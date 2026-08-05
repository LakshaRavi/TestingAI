import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, statusAPI } from '../api/services';
import { User, Mail, Shield, Briefcase, Clock, FileCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [myStatuses, setMyStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfileMetrics();
    }
  }, [user]);

  const fetchProfileMetrics = async () => {
    try {
      setLoading(true);
      const [projList, statusList] = await Promise.all([
        projectsAPI.getProjects(user.role === 'admin' ? null : user.id),
        statusAPI.getStatuses({ user_id: user.id })
      ]);
      setAssignedProjects(projList);
      setMyStatuses(statusList);
    } catch (err) {
      console.error('Failed to load profile metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const totalHours = myStatuses.reduce((acc, curr) => acc + (curr.hours_worked || 0), 0);
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>User Profile</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Personal account information, role details, and work productivity overview.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* ACCOUNT INFO CARD */}
        <div className="card">
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div 
              className="user-avatar" 
              style={{ width: 80, height: 80, fontSize: '2rem', margin: '0 auto 1rem auto', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}
            >
              {initials}
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>{user.name}</h3>
            <div style={{ marginTop: '0.35rem' }}>
              <span className={`role-pill ${user.role === 'admin' ? 'role-admin' : 'role-employee'}`}>
                {user.role} Account
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User ID</div>
                <div style={{ fontWeight: 600 }}>#{user.id}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontWeight: 600 }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Access Role</div>
                <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS & ASSIGNED PROJECTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* STAT SUMMARY */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Clock size={20} color="var(--accent)" /> Productivity Metrics
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{myStatuses.length}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Status Logs</div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{totalHours} hrs</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hours Logged</div>
                </div>
              </div>
            )}
          </div>

          {/* ASSIGNED PROJECTS LIST */}
          <div className="card" style={{ marginBottom: 0, flex: 1 }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Briefcase size={20} color="var(--primary)" />
              {user.role === 'admin' ? 'Active Office Projects' : 'My Assigned Projects'}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="loading-spinner"></div>
              </div>
            ) : assignedProjects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No projects currently assigned.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
                {assignedProjects.map(proj => (
                  <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{proj.project_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{proj.start_date} to {proj.end_date}</div>
                    </div>
                    <span className={`status-badge status-${proj.status.toLowerCase().replace(' ', '-')}`}>
                      {proj.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
