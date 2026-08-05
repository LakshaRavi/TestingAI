from sqlalchemy.orm import Session
from datetime import date, timedelta
try:
    from . import models, database
except ImportError:
    import models
    import database


def seed_db():
    database.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()

    try:
        # Check if users already exist
        if db.query(models.User).first():
            print("Database already contains seed data.")
            return

        print("Seeding initial data...")
        
        # 1. Create Users
        admin = models.User(
            name="Admin User",
            email="admin@office.com",
            password="admin123",
            role="admin"
        )
        emp1 = models.User(
            name="John Doe",
            email="john@office.com",
            password="user123",
            role="employee"
        )
        emp2 = models.User(
            name="Jane Smith",
            email="jane@office.com",
            password="user123",
            role="employee"
        )
        emp3 = models.User(
            name="Alex Johnson",
            email="alex@office.com",
            password="user123",
            role="employee"
        )

        db.add_all([admin, emp1, emp2, emp3])
        db.commit()

        # Refresh to get IDs
        db.refresh(emp1)
        db.refresh(emp2)
        db.refresh(emp3)

        # 2. Create Projects
        today = date.today()
        proj1 = models.Project(
            project_name="Cloud Migration Project",
            description="Migrate legacy monolithic architecture to cloud microservices and AWS infrastructure.",
            start_date=(today - timedelta(days=30)).isoformat(),
            end_date=(today + timedelta(days=60)).isoformat(),
            status="In Progress"
        )
        proj2 = models.Project(
            project_name="Mobile App Redesign",
            description="Revamp iOS & Android customer dashboard with React Native and modern visual design.",
            start_date=(today - timedelta(days=15)).isoformat(),
            end_date=(today + timedelta(days=45)).isoformat(),
            status="In Progress"
        )
        proj3 = models.Project(
            project_name="Security & Compliance Audit",
            description="Comprehensive SOC2 audit and quarterly penetration testing.",
            start_date=(today - timedelta(days=60)).isoformat(),
            end_date=(today - timedelta(days=5)).isoformat(),
            status="Completed"
        )
        proj4 = models.Project(
            project_name="AI Work Assistant",
            description="Integrate AI automated reporting and work summary generators.",
            start_date=today.isoformat(),
            end_date=(today + timedelta(days=90)).isoformat(),
            status="Not Started"
        )

        db.add_all([proj1, proj2, proj3, proj4])
        db.commit()

        # Refresh projects
        db.refresh(proj1)
        db.refresh(proj2)
        db.refresh(proj3)
        db.refresh(proj4)

        # 3. Assign Members to Projects
        assignments = [
            models.ProjectMember(project_id=proj1.id, user_id=emp1.id),
            models.ProjectMember(project_id=proj1.id, user_id=emp2.id),
            models.ProjectMember(project_id=proj2.id, user_id=emp2.id),
            models.ProjectMember(project_id=proj2.id, user_id=emp3.id),
            models.ProjectMember(project_id=proj3.id, user_id=emp1.id),
            models.ProjectMember(project_id=proj3.id, user_id=emp3.id),
            models.ProjectMember(project_id=proj4.id, user_id=emp1.id),
            models.ProjectMember(project_id=proj4.id, user_id=emp2.id),
            models.ProjectMember(project_id=proj4.id, user_id=emp3.id),
        ]
        db.add_all(assignments)
        db.commit()

        # 4. Create Daily Status Records
        today_str = today.isoformat()
        yesterday_str = (today - timedelta(days=1)).isoformat()
        prev_str = (today - timedelta(days=2)).isoformat()

        statuses = [
            models.DailyStatus(
                project_id=proj1.id,
                user_id=emp1.id,
                work_date=today_str,
                task_completed="Configured Docker containers for backend services.",
                task_in_progress="Setting up Kubernetes ingress controllers.",
                blockers="Awaiting DNS update approval from DevOps team.",
                hours_worked=7.5,
                remarks="Made great progress on dev environment."
            ),
            models.DailyStatus(
                project_id=proj2.id,
                user_id=emp2.id,
                work_date=today_str,
                task_completed="Designed Figma components for user profile screen.",
                task_in_progress="Implementing dark mode styles in React component library.",
                blockers="",
                hours_worked=8.0,
                remarks="All mockups approved by product lead."
            ),
            models.DailyStatus(
                project_id=proj1.id,
                user_id=emp2.id,
                work_date=yesterday_str,
                task_completed="Implemented database migration scripts.",
                task_in_progress="Testing schema constraints with sample data.",
                blockers="Minor network latency on test instance.",
                hours_worked=8.0,
                remarks="Completed initial schema verification."
            ),
            models.DailyStatus(
                project_id=proj3.id,
                user_id=emp3.id,
                work_date=prev_str,
                task_completed="Finalized SOC2 compliance report documentation.",
                task_in_progress="Submitting compliance certificates to auditors.",
                blockers="",
                hours_worked=6.5,
                remarks="Project milestone achieved successfully."
            )
        ]

        db.add_all(statuses)
        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
