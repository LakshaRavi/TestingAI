from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "employee"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "employee"
    name: Optional[str] = None


class LoginResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    message: str = "Login successful"

# --- PROJECT SCHEMAS ---
class ProjectBase(BaseModel):
    project_name: str
    description: Optional[str] = ""
    start_date: str
    end_date: str
    status: str = "In Progress"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None

class MemberSummary(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class ProjectResponse(ProjectBase):
    id: int
    members: List[MemberSummary] = []

    class Config:
        from_attributes = True

# --- ASSIGNMENT SCHEMAS ---
class AssignMembersRequest(BaseModel):
    project_id: int
    user_ids: List[int]

# --- DAILY STATUS SCHEMAS ---
class DailyStatusBase(BaseModel):
    project_id: int
    work_date: str
    task_completed: str
    task_in_progress: str
    blockers: Optional[str] = ""
    hours_worked: float
    remarks: Optional[str] = ""

class DailyStatusCreate(DailyStatusBase):
    user_id: int

class DailyStatusUpdate(BaseModel):
    task_completed: Optional[str] = None
    task_in_progress: Optional[str] = None
    blockers: Optional[str] = None
    hours_worked: Optional[float] = None
    remarks: Optional[str] = None

class DailyStatusResponse(DailyStatusBase):
    id: int
    user_id: int
    user_name: Optional[str] = ""
    project_name: Optional[str] = ""

    class Config:
        from_attributes = True

# --- DASHBOARD METRICS SCHEMA ---
class DashboardMetrics(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_employees: int
    todays_updates: int
