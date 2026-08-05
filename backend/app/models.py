from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False, default="employee")  # "admin" | "employee"

    # Relationships
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    daily_statuses = relationship("DailyStatus", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    status = Column(String(50), nullable=False, default="In Progress")  # "Not Started", "In Progress", "Completed", "On Hold"

    # Relationships
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    daily_statuses = relationship("DailyStatus", back_populates="project", cascade="all, delete-orphan")

class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")

class DailyStatus(Base):
    __tablename__ = "daily_status"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    work_date = Column(String(20), nullable=False)
    task_completed = Column(Text, nullable=False)
    task_in_progress = Column(Text, nullable=False)
    blockers = Column(Text, nullable=True, default="")
    hours_worked = Column(Float, nullable=False, default=8.0)
    remarks = Column(Text, nullable=True, default="")

    # Relationships
    project = relationship("Project", back_populates="daily_statuses")
    user = relationship("User", back_populates="daily_statuses")
