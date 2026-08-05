import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, projectsAPI, usersAPI, statusAPI } from '../api/services';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Users, 
  FileCheck, 
  UserCheck,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [recentStatuses, setRecentStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [m, projList, empList, stList] = await Promise.all([
        reportsAPI.getMetrics(),
        projectsAPI.getProjects(),
        usersAPI.getUsers('employee'),
        statusAPI.getStatuses()
      ]);
      setMetrics(m);
      setProjects(projList.slice(0, 5));
      setEmployees(empList);
      setRecentStatuses(stList.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Overview of office operations, employee productivity, and active projects.</p>
        </div>
        <Link to="/projects" className="btn btn-primary btn-sm">
          <Plus size={16} /> Manage Projects
        </Link>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* DASHBOARD CARDS */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Briefcase size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{metrics?.total_projects || 0}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <Clock size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{metrics?.active_projects || 0}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{metrics?.completed_projects || 0}</span>
            <span className="stat-label">Completed Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon secondary">
            <Users size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{metrics?.total_employees || 0}</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FileCheck size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{metrics?.todays_updates || 0}</span>
            <span className="stat-label">Today's Updates</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID FOR PROJECTS & EMPLOYEES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* ACTIVE PROJECTS LIST */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--primary)" /> Project Overview
            </h3>
            <Link to="/projects" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{proj.project_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ends: {proj.end_date}</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${proj.status.toLowerCase().replace(' ', '-')}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {proj.members && proj.members.slice(0, 3).map((m, idx) => (
                          <div key={m.id || idx} className="member-avatar-pill" title={m.name}>
                            {m.name.substring(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {proj.members && proj.members.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            +{proj.members.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EMPLOYEES DIRECTORY */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <UserCheck size={18} color="var(--secondary)" /> Employee Roster
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{employees.length} Members</span>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{emp.email}</td>
                    <td>
                      <span className="role-pill role-employee">{emp.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TODAY'S RECENT DAILY WORK UPDATES STREAM */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <FileCheck size={18} color="var(--success)" /> Recent Work Logs
          </h3>
          <Link to="/reports" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Full Report <ArrowRight size={14} />
          </Link>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Project</th>
                <th>Task Completed</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {recentStatuses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No work status entries submitted yet.</td>
                </tr>
              ) : (
                recentStatuses.map((st) => (
                  <tr key={st.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{st.work_date}</td>
                    <td style={{ fontWeight: 600 }}>{st.user_name}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{st.project_name}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {st.task_completed}
                    </td>
                    <td>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {st.hours_worked} hrs
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
