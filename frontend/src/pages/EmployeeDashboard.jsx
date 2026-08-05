import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, statusAPI } from '../api/services';
import { 
  Briefcase, 
  Clock, 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Calendar
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [myStatuses, setMyStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const [projectsList, statusList] = await Promise.all([
        projectsAPI.getProjects(user.id),
        statusAPI.getStatuses({ user_id: user.id })
      ]);
      setAssignedProjects(projectsList);
      setMyStatuses(statusList);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysSubmission = myStatuses.find(st => st.work_date === todayStr);

  const totalHoursLogged = myStatuses.reduce((sum, st) => sum + (st.hours_worked || 0), 0);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* WELCOME BANNER */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Welcome back, {user.name}!</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your daily tasks, submit progress reports, and stay aligned with your project deliverables.
        </p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Briefcase size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{assignedProjects.length}</span>
            <span className="stat-label">Assigned Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <Clock size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{totalHoursLogged} hrs</span>
            <span className="stat-label">Total Hours Logged</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={26} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{myStatuses.length}</span>
            <span className="stat-label">Status Submissions</span>
          </div>
        </div>
      </div>

      {/* TODAY'S STATUS ACTION BANNER */}
      <div className="card" style={{ borderColor: todaysSubmission ? 'var(--success)' : 'var(--primary)', background: todaysSubmission ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: todaysSubmission ? 'var(--success)' : 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
              {todaysSubmission ? '✓ Submitted for Today' : '⚡ Action Required'}
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
              Daily Work Log ({todayStr})
            </h3>
            {todaysSubmission ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                You logged {todaysSubmission.hours_worked} hours for project <strong>{todaysSubmission.project_name}</strong>.
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                You haven't logged today's daily work update yet. Submit now to inform your team.
              </p>
            )}
          </div>

          <Link to="/status" className="btn btn-primary">
            {todaysSubmission ? 'Edit Today\'s Status' : 'Submit Today\'s Status'} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* TWO COLUMN GRID: MY PROJECTS & PREVIOUS LOGS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* ASSIGNED PROJECTS */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Briefcase size={18} color="var(--primary)" /> Assigned Projects
            </h3>
            <Link to="/projects" style={{ fontSize: '0.85rem' }}>View Details</Link>
          </div>
          {assignedProjects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>You are not currently assigned to any active projects.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignedProjects.map(proj => (
                <div key={proj.id} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem' }}>{proj.project_name}</h4>
                    <span className={`status-badge status-${proj.status.toLowerCase().replace(' ', '-')}`}>
                      {proj.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    {proj.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span>Start: {proj.start_date}</span>
                    <span>End: {proj.end_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PREVIOUS SUBMISSIONS */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="var(--accent)" /> Recent Submissions
            </h3>
            <Link to="/status" style={{ fontSize: '0.85rem' }}>View All</Link>
          </div>
          {myStatuses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>No status updates submitted yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Task Completed</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {myStatuses.slice(0, 5).map(st => (
                    <tr key={st.id}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{st.work_date}</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{st.project_name}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {st.task_completed}
                      </td>
                      <td style={{ fontWeight: 600 }}>{st.hours_worked}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
