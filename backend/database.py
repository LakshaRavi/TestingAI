import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Default PostgreSQL connection URL.
# Modify host, port, dbname, user, and password as per your local PostgreSQL setup.
# Format: postgresql://username:password@localhost:5432/database_name
POSTGRES_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/auth_db")

try:
    # Attempt to connect to PostgreSQL
    engine = create_engine(POSTGRES_URL)
    # Test connection
    connection = engine.connect()
    connection.close()
    print("Connected to PostgreSQL database successfully!")
except Exception as e:
    print(f"PostgreSQL connection error: {e}")
    print("Fallback to local SQLite database for instant out-of-the-box execution...")
    SQLITE_URL = "sqlite:///./app.db"
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

# Create a SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy database models
Base = declarative_base()

# Dependency helper function to get a database session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
