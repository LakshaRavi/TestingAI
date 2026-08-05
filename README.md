# Office Work Management System

A full-stack, modular, role-based Office Work Management System built with **React (Vite)** on the frontend and **FastAPI + SQLAlchemy (SQLite)** on the backend.

---

## 🌟 Features

### 🔐 Authentication & Roles
- **Role-Based Access Control**: Separate views and privileges for **Admin** and **Employee** roles.
- **Persistent Session**: User login state saved in `localStorage` with protected routes.
- **Quick Demo Login Buttons**: Single-click demo credentials on login screen.

### 👑 Admin Capabilities
- **Summary Metric Cards**: Total Projects, Active Projects, Completed Projects, Total Employees, Today's Work Updates.
- **Project Management**: Create, view, edit, and delete projects.
- **Team Assignment**: Interactive modal to assign multiple employees to projects.
- **Work Log Overview**: Real-time stream of employee status submissions.

### 👤 Employee Capabilities
- **Assigned Projects View**: View projects assigned to the employee.
- **Daily Status Submission**: Form to log completed tasks, tasks in progress, blockers, hours worked, and remarks.
- **Log Editing**: Update today's submitted log directly.
- **History Tracking**: Review past status logs.
- **Profile Page**: Personal metrics and assignment breakdown.

### 📊 Reports & CSV Export
- **Master Table**: View all work updates across all employees and projects.
- **Search & Filtering**: Real-time search by employee name, filter by project, and filter by date.
- **Pagination**: Clean table pagination.
- **CSV Export**: One-click download of filtered reports in CSV format.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM, Axios, Lucide Icons, Vanilla CSS (Modern dark/slate glassmorphic theme).
- **Backend**: FastAPI, SQLAlchemy ORM, SQLite database, Pydantic v2, Uvicorn server.
- **Architecture**: Modular REST API with CORS enabled.

---

## 📁 Project Structure

```
c:/Users/admin/Desktop/tAI/CODE 2/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py       # SQLite connection & SQLAlchemy Session
│   │   ├── models.py         # SQLAlchemy ORM models (User, Project, ProjectMember, DailyStatus)
│   │   ├── schemas.py        # Pydantic models for validation
│   │   ├── crud.py           # Database CRUD queries
│   │   ├── seed.py           # Seed script for initial demo data
│   │   └── main.py           # FastAPI app, CORS, REST endpoints
│   ├── requirements.txt      # Python backend dependencies
│   └── run.py                # Server launcher script
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance & REST service methods
│   │   ├── components/       # Navbar, Sidebar, ProtectedRoute, Modals, Toast
│   │   ├── context/          # AuthContext session management
│   │   ├── pages/            # Login, AdminDashboard, EmployeeDashboard, Projects, DailyStatus, Reports, Profile
│   │   ├── styles/           # Modern Vanilla CSS design system
│   │   ├── App.jsx           # App routing & main layout
│   │   └── main.jsx          # React app entry
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md                 # Setup & usage documentation
```

---

## 🚀 Setup & Execution Guide

### 1. Backend Setup (FastAPI + SQLite)

1. Open a terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server (automatically seeds SQLite database on first run):
   ```bash
   python run.py
   ```
   The FastAPI server will run on `http://127.0.0.1:8000`. You can also view interactive API docs at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup (React + Vite)

1. Open a second terminal window and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The React application will open on `http://localhost:3000`.

---

## 🔑 Default Demo Credentials

The database is pre-seeded with initial users and projects for instant testing:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@office.com` | `admin123` | Admin User |
| **Employee** | `john@office.com` | `user123` | John Doe |
| **Employee** | `jane@office.com` | `user123` | Jane Smith |
| **Employee** | `alex@office.com` | `user123` | Alex Johnson |
