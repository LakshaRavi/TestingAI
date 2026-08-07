import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, statusAPI } from '../api/services';
import { User, Mail, Shield, Briefcase, Clock, CheckCircle2, Calendar, Activity, Sparkles } from 'lucide-react';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User color="var(--primary)" size={24} /> User Profile Details
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Account overview, role privileges, assigned projects, and work productivity history.
          </p>
        </div>
        <span style={{ 
          background: 'rgba(34, 197, 94, 0.15)', 
          color: '#22c55e', 
          padding: '0.4rem 0.85rem', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <CheckCircle2 size={14} /> Account Active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: PERSONAL PROFILE CARD */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div 
              className="user-avatar" 
              style={{ width: 90, height: 90, fontSize: '2.2rem', margin: '0 auto 1.25rem auto', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)' }}
            >
              {initials}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{user.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0.75rem 0' }}>{user.email}</p>
            <div>
              <span className={`role-pill ${user.role === 'admin' ? 'role-admin' : 'role-employee'}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
                <Shield size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {user.role === 'admin' ? 'Administrator' : 'Employee'}
              </span>
            </div>
          </div>

          <div style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                <User size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>#{user.id}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                <Mail size={18} color="var(--primary)" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                <Shield size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Permissions</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {user.role === 'admin' 
                    ? 'Full Administrative Access (Projects, Users, Reports)' 
                    : 'Standard Member Access (Daily Status & Projects)'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Role</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METRICS, PROJECTS & RECENT ACTIVITY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STATS OVERVIEW */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--accent)" /> Work Summary & Metrics
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-dark)', padding: '1.1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>{assignedProjects.length}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {user.role === 'admin' ? 'Total Projects' : 'Assigned Projects'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '1.1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6366f1' }}>{myStatuses.length}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Status Submissions</div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '1.1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>{totalHours} hrs</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total Logged Hours</div>
                </div>
              </div>
            )}
          </div>

          {/* ASSIGNED PROJECTS LIST */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="var(--primary)" />
              {user.role === 'admin' ? 'All Active Projects' : 'My Assigned Projects'}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="loading-spinner"></div>
              </div>
            ) : assignedProjects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No projects assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                {assignedProjects.map(proj => (
                  <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{proj.project_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{proj.start_date} to {proj.end_date}</div>
                    </div>
                    <span className={`status-badge status-${proj.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {proj.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT STATUS LOGS TIMELINE */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#a855f7" /> Recent Activity Logs
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="loading-spinner"></div>
              </div>
            ) : myStatuses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No work status logs submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
                {myStatuses.slice(0, 5).map(status => (
                  <div key={status.id} style={{ background: 'var(--bg-dark)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>{status.project_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {status.work_date} ({status.hours_worked} hrs)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {status.task_completed}
                    </div>
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
