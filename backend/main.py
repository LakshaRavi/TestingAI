from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

# Create database tables automatically on application startup
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Basic Auth API", description="Simple Login and Sign Up API with FastAPI and PostgreSQL")

# Configure CORS so that the React frontend running on localhost can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all origins for simple local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import hashlib

# Simple helper function to hash passwords using SHA-256
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Simple helper function to verify if plain password matches hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

@app.get("/")
def read_root():
    """Simple health check root route."""
    return {"message": "FastAPI Backend is running successfully!"}

@app.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: schemas.SignUpRequest, db: Session = Depends(get_db)):
    """
    Sign Up endpoint:
    - Checks if the user email is already registered in PostgreSQL.
    - Hashes password before saving to database.
    - Returns error message 'User already exists' if email is found.
    """
    # Check if a user with this email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    # Hash the plain text password
    hashed_pwd = hash_password(user_data.password)

    # Create new user record with hashed password
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_pwd
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully!",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }

@app.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint:
    - Finds user by email in PostgreSQL database.
    - Verifies password against stored hash.
    - Returns error message 'Invalid email or password' if verification fails.
    """
    # Find user by email
    user = db.query(models.User).filter(models.User.email == login_data.email).first()

    # Check if user exists and password is correct
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }
