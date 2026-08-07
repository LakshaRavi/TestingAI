import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, statusAPI, usersAPI } from '../api/services';
import { User, Mail, Shield, Briefcase, Clock, CheckCircle2, Calendar, Activity, Edit3, X, Check, Lock } from 'lucide-react';

const Profile = () => {
  const { user, updateUserSession } = useAuth();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [myStatuses, setMyStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleOpenEditModal = () => {
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPassword('');
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      setFormError('Name and Email cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        name: editName.trim(),
        email: editEmail.trim()
      };
      if (editPassword) {
        payload.password = editPassword;
      }

      const updatedUser = await usersAPI.updateUser(user.id, payload);
      
      // Update session in AuthContext & LocalStorage
      updateUserSession({
        name: updatedUser.name,
        email: updatedUser.email
      });

      setIsEditModalOpen(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const totalHours = myStatuses.reduce((acc, curr) => acc + (curr.hours_worked || 0), 0);
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* SUCCESS TOAST */}
      {successMsg && (
        <div style={{ 
          background: 'rgba(34, 197, 94, 0.2)', 
          color: '#22c55e', 
          border: '1px solid rgba(34, 197, 94, 0.4)', 
          padding: '0.85rem 1.25rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User color="var(--primary)" size={24} /> User Profile Details
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Personal account information, edit details, and productivity overview.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={handleOpenEditModal}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
          
          <span style={{ 
            background: 'rgba(34, 197, 94, 0.15)', 
            color: '#22c55e', 
            padding: '0.45rem 0.85rem', 
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
                    ? 'Full Administrative Access' 
                    : 'Standard Member Access'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button 
                onClick={handleOpenEditModal}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <Edit3 size={15} /> Edit Personal Information
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METRICS & PROJECTS */}
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
                  <div style={{ fontSize: '1.8rem', fontWeight 700, color: '#6366f1' }}>{myStatuses.length}</div>
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

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} color="var(--primary)" /> Edit Profile Details
              </h3>
              <button 
                className="btn-icon" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', margin: '1rem 1.5rem 0 1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    className="form-control"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Leave blank to keep unchanged)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    className="form-control"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '0.5rem', padding: '1rem 0 0 0' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
