from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from . import models, schemas

# --- USER OPERATIONS ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, role: Optional[str] = None):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    return query.all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name,
        email=user.email.lower().strip(),
        password=user.password,  # Stored in plaintext/simple hash for basic scope
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    if user_update.name is not None and user_update.name.strip():
        user.name = user_update.name.strip()
    if user_update.email is not None and user_update.email.strip():
        user.email = user_update.email.lower().strip()
    if user_update.password is not None and user_update.password:
        user.password = user_update.password
    db.commit()
    db.refresh(user)
    return user

def authenticate_or_create_user(db: Session, email: str, password: str, role: str = "employee", name: Optional[str] = None):
    clean_email = email.lower().strip()
    user = get_user_by_email(db, clean_email)
    
    if user:
        if user.password != password:
            return None
        if role and user.role != role:
            user.role = role
            db.commit()
            db.refresh(user)
        return user

    # User does not exist -> Create new account automatically with chosen role
    display_name = name.strip() if (name and name.strip()) else clean_email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
    new_user = models.User(
        name=display_name,
        email=clean_email,
        password=password,
        role=role.lower().strip() if role else "employee"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# --- PROJECT OPERATIONS ---
def get_projects(db: Session, user_id: Optional[int] = None):
    query = db.query(models.Project)
    if user_id:
        # If user_id provided (e.g. employee view), filter projects assigned to user
        query = query.join(models.ProjectMember).filter(models.ProjectMember.user_id == user_id)
    
    projects = query.all()
    
    # Format members into response structure
    result = []
    for proj in projects:
        member_users = [pm.user for pm in proj.members if pm.user]
        proj_data = {
            "id": proj.id,
            "project_name": proj.project_name,
            "description": proj.description,
            "start_date": proj.start_date,
            "end_date": proj.end_date,
            "status": proj.status,
            "members": member_users
        }
        result.append(proj_data)
    return result

def get_project_by_id(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(
        project_name=project.project_name,
        description=project.description,
        start_date=project.start_date,
        end_date=project.end_date,
        status=project.status
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project_update: schemas.ProjectUpdate):
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(db_project, key, value)
            
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return False
    db.delete(db_project)
    db.commit()
    return True

# --- ASSIGNMENT OPERATIONS ---
def assign_members(db: Session, project_id: int, user_ids: List[int]):
    # Delete existing memberships for this project to re-assign clean list
    db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id).delete()
    
    for uid in user_ids:
        pm = models.ProjectMember(project_id=project_id, user_id=uid)
        db.add(pm)
        
    db.commit()
    return get_project_by_id(db, project_id)

# --- DAILY STATUS OPERATIONS ---
def create_daily_status(db: Session, status: schemas.DailyStatusCreate):
    db_status = models.DailyStatus(
        project_id=status.project_id,
        user_id=status.user_id,
        work_date=status.work_date,
        task_completed=status.task_completed,
        task_in_progress=status.task_in_progress,
        blockers=status.blockers,
        hours_worked=status.hours_worked,
        remarks=status.remarks
    )
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status

def get_daily_status_by_id(db: Session, status_id: int):
    return db.query(models.DailyStatus).filter(models.DailyStatus.id == status_id).first()

def update_daily_status(db: Session, status_id: int, status_update: schemas.DailyStatusUpdate):
    db_status = get_daily_status_by_id(db, status_id)
    if not db_status:
        return None
    
    update_data = status_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(db_status, key, value)
            
    db.commit()
    db.refresh(db_status)
    return db_status

def get_daily_statuses(
    db: Session,
    user_id: Optional[int] = None,
    project_id: Optional[int] = None,
    work_date: Optional[str] = None,
    employee_search: Optional[str] = None
):
    query = db.query(models.DailyStatus).join(models.User).join(models.Project)
    
    if user_id:
        query = query.filter(models.DailyStatus.user_id == user_id)
    if project_id:
        query = query.filter(models.DailyStatus.project_id == project_id)
    if work_date:
        query = query.filter(models.DailyStatus.work_date == work_date)
    if employee_search:
        search_pattern = f"%{employee_search}%"
        query = query.filter(models.User.name.ilike(search_pattern))
        
    statuses = query.order_by(models.DailyStatus.work_date.desc(), models.DailyStatus.id.desc()).all()
    
    result = []
    for st in statuses:
        st_dict = {
            "id": st.id,
            "project_id": st.project_id,
            "user_id": st.user_id,
            "work_date": st.work_date,
            "task_completed": st.task_completed,
            "task_in_progress": st.task_in_progress,
            "blockers": st.blockers or "",
            "hours_worked": st.hours_worked,
            "remarks": st.remarks or "",
            "user_name": st.user.name if st.user else "Unknown User",
            "project_name": st.project.project_name if st.project else "Unknown Project"
        }
        result.append(st_dict)
        
    return result

# --- DASHBOARD METRICS ---
def get_dashboard_metrics(db: Session):
    today_str = date.today().isoformat()
    
    total_projects = db.query(models.Project).count()
    active_projects = db.query(models.Project).filter(models.Project.status == "In Progress").count()
    completed_projects = db.query(models.Project).filter(models.Project.status == "Completed").count()
    total_employees = db.query(models.User).filter(models.User.role == "employee").count()
    todays_updates = db.query(models.DailyStatus).filter(models.DailyStatus.work_date == today_str).count()
    
    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "total_employees": total_employees,
        "todays_updates": todays_updates
    }
