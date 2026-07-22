from sqlalchemy import Column, Integer, String
from database import Base

# SQLAlchemy model for storing user details in PostgreSQL database
class User(Base):
    __tablename__ = "users"

    # Primary key ID (auto-incrementing)
    id = Column(Integer, primary_key=True, index=True)
    
    # User's full name (required for sign up)
    name = Column(String, nullable=False)
    
    # User's email address (must be unique)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # User's password
    password = Column(String, nullable=False)
