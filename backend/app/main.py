from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from . import models, schemas, crud, database
from .seed import seed_db

app = FastAPI(
    title="Office Work Management System API",
    description="REST API for managing projects, employee daily work statuses, assignments, and reports.",
    version="1.0.0"
)

# Enable CORS for frontend client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from Vite dev server and local clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    seed_db()

@app.get("/")
def read_root():
    return {"message": "Office Work Management System API is running smoothly."}

# ==========================================
# AUTHENTICATION APIs
# ==========================================
@app.post("/api/login", response_model=schemas.LoginResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = crud.authenticate_or_create_user(
        db,
        login_data.email,
        login_data.password,
        role=login_data.role,
        name=login_data.name
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "message": "Login successful"
    }


# ==========================================
# USER APIs
# ==========================================
@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(role: Optional[str] = None, db: Session = Depends(database.get_db)):
    users = crud.get_users(db, role=role)
    return users

@app.post("/api/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    new_user = crud.create_user(db, user)
    return new_user

@app.put("/api/users/{id}", response_model=schemas.UserResponse)
def update_user_profile(id: int, user_update: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    if user_update.email:
        existing = crud.get_user_by_email(db, user_update.email)
        if existing and existing.id != id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists"
            )
    updated = crud.update_user(db, id, user_update)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

# ==========================================
# PROJECT APIs
# ==========================================
@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def get_projects(user_id: Optional[int] = None, db: Session = Depends(database.get_db)):
    projects = crud.get_projects(db, user_id=user_id)
    return projects

@app.post("/api/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db)):
    new_project = crud.create_project(db, project)
    # Fetch formatted response structure
    formatted_projects = crud.get_projects(db)
    for p in formatted_projects:
        if p["id"] == new_project.id:
            return p
    return new_project

@app.put("/api/projects/{id}", response_model=schemas.ProjectResponse)
def update_project(id: int, project_update: schemas.ProjectUpdate, db: Session = Depends(database.get_db)):
    updated = crud.update_project(db, id, project_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    formatted_projects = crud.get_projects(db)
    for p in formatted_projects:
        if p["id"] == id:
            return p
    return updated

@app.delete("/api/projects/{id}")
def delete_project(id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_project(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# ==========================================
# ASSIGNMENT APIs
# ==========================================
@app.post("/api/assign", response_model=schemas.ProjectResponse)
def assign_project_members(assignment: schemas.AssignMembersRequest, db: Session = Depends(database.get_db)):
    project = crud.get_project_by_id(db, assignment.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    crud.assign_members(db, assignment.project_id, assignment.user_ids)
    
    formatted_projects = crud.get_projects(db)
    for p in formatted_projects:
        if p["id"] == assignment.project_id:
            return p
    return project

# ==========================================
# DAILY STATUS APIs
# ==========================================
@app.post("/api/status", response_model=schemas.DailyStatusResponse, status_code=status.HTTP_201_CREATED)
def create_daily_status(status_in: schemas.DailyStatusCreate, db: Session = Depends(database.get_db)):
    project = crud.get_project_by_id(db, status_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    user = crud.get_user_by_id(db, status_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_status = crud.create_daily_status(db, status_in)
    return {
        "id": new_status.id,
        "project_id": new_status.project_id,
        "user_id": new_status.user_id,
        "work_date": new_status.work_date,
        "task_completed": new_status.task_completed,
        "task_in_progress": new_status.task_in_progress,
        "blockers": new_status.blockers or "",
        "hours_worked": new_status.hours_worked,
        "remarks": new_status.remarks or "",
        "user_name": user.name,
        "project_name": project.project_name
    }

@app.get("/api/status", response_model=List[schemas.DailyStatusResponse])
def get_daily_statuses(
    user_id: Optional[int] = None,
    project_id: Optional[int] = None,
    work_date: Optional[str] = None,
    employee_search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    statuses = crud.get_daily_statuses(
        db,
        user_id=user_id,
        project_id=project_id,
        work_date=work_date,
        employee_search=employee_search
    )
    return statuses

@app.put("/api/status/{id}", response_model=schemas.DailyStatusResponse)
def update_daily_status(id: int, status_update: schemas.DailyStatusUpdate, db: Session = Depends(database.get_db)):
    updated = crud.update_daily_status(db, id, status_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Status entry not found")
    
    user = crud.get_user_by_id(db, updated.user_id)
    project = crud.get_project_by_id(db, updated.project_id)
    
    return {
        "id": updated.id,
        "project_id": updated.project_id,
        "user_id": updated.user_id,
        "work_date": updated.work_date,
        "task_completed": updated.task_completed,
        "task_in_progress": updated.task_in_progress,
        "blockers": updated.blockers or "",
        "hours_worked": updated.hours_worked,
        "remarks": updated.remarks or "",
        "user_name": user.name if user else "",
        "project_name": project.project_name if project else ""
    }

# ==========================================
# REPORTS & DASHBOARD APIs
# ==========================================
@app.get("/api/reports", response_model=List[schemas.DailyStatusResponse])
def get_reports(
    user_id: Optional[int] = None,
    project_id: Optional[int] = None,
    work_date: Optional[str] = None,
    employee_search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    reports = crud.get_daily_statuses(
        db,
        user_id=user_id,
        project_id=project_id,
        work_date=work_date,
        employee_search=employee_search
    )
    return reports

@app.get("/api/dashboard/metrics", response_model=schemas.DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(database.get_db)):
    return crud.get_dashboard_metrics(db)
