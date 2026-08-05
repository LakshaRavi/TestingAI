import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, statusAPI } from '../api/services';
import NotificationToast from '../components/NotificationToast';
import { 
  ClipboardList, 
  Send, 
  Clock, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

const DailyStatus = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    project_id: '',
    work_date: todayStr,
    task_completed: '',
    task_in_progress: '',
    blockers: '',
    hours_worked: 8.0,
    remarks: ''
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [projList, statusList] = await Promise.all([
        projectsAPI.getProjects(user.role === 'admin' ? null : user.id),
        statusAPI.getStatuses({ user_id: user.id })
      ]);
      setProjects(projList);
      setHistory(statusList);

      if (projList.length > 0) {
        setFormData(prev => ({ ...prev, project_id: projList[0].id }));
      }
    } catch (err) {
      showToast('Failed to load project and status history data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleEditEntry = (entry) => {
    setEditingId(entry.id);
    setFormData({
      project_id: entry.project_id,
      work_date: entry.work_date,
      task_completed: entry.task_completed || '',
      task_in_progress: entry.task_in_progress || '',
      blockers: entry.blockers || '',
      hours_worked: entry.hours_worked || 8.0,
      remarks: entry.remarks || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      project_id: projects.length > 0 ? projects[0].id : '',
      work_date: todayStr,
      task_completed: '',
      task_in_progress: '',
      blockers: '',
      hours_worked: 8.0,
      remarks: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_id) {
      showToast('Please select a project', 'error');
      return;
    }
    if (!formData.task_completed.trim() || !formData.task_in_progress.trim()) {
      showToast('Please specify completed and in-progress tasks', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        project_id: parseInt(formData.project_id),
        hours_worked: parseFloat(formData.hours_worked) || 0
      };

      if (editingId) {
        await statusAPI.updateStatus(editingId, payload);
        showToast('Daily work status updated successfully!', 'success');
      } else {
        await statusAPI.createStatus({ ...payload, user_id: user.id });
        showToast('Daily work status submitted successfully!', 'success');
      }

      resetForm();
      const updatedHistory = await statusAPI.getStatuses({ user_id: user.id });
      setHistory(updatedHistory);
    } catch (err) {
      showToast(err.message || 'Failed to submit status update', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Daily Work Status Form</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Record your daily progress, upcoming tasks, blockers, and billable hours.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* FORM CONTAINER */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ClipboardList size={20} color="var(--primary)" />
              {editingId ? 'Edit Work Status Entry' : 'Log New Work Update'}
            </h3>
            {editingId && (
              <button className="btn btn-secondary btn-sm" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
              <p>You are not assigned to any projects. Contact your administrator to get assigned.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Select Project *</label>
                  <select
                    className="form-select"
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    required
                  >
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.project_name} ({proj.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Work Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.work_date}
                    onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tasks Completed Today *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Detail tasks finished today (e.g. Fixed navigation bug, completed API documentation)..."
                  value={formData.task_completed}
                  onChange={(e) => setFormData({ ...formData, task_completed: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tasks In Progress *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe ongoing tasks planned for continuation..."
                  value={formData.task_in_progress}
                  onChange={(e) => setFormData({ ...formData, task_in_progress: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blockers / Dependencies (Optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="List any impediments or pending reviews..."
                  value={formData.blockers}
                  onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hours Worked *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    className="form-control"
                    value={formData.hours_worked}
                    onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Remarks (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="General notes..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={submitting}>
                {submitting ? <div className="loading-spinner"></div> : <><Send size={16} /> {editingId ? 'Update Status' : 'Submit Status Update'}</>}
              </button>
            </form>
          )}
        </div>

        {/* SUBMISSION HISTORY STREAM */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={20} color="var(--accent)" /> Previous Submissions
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{history.length} Logs</span>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <FileText size={36} style={{ marginBottom: '0.5rem' }} />
              <p>No previous submissions found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '550px', overflowY: 'auto' }}>
              {history.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>{entry.project_name}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <Calendar size={12} /> {entry.work_date} • {entry.hours_worked} Hours Logged
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditEntry(entry)}
                      title="Edit this entry"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Completed: </strong>
                    <span>{entry.task_completed}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>In Progress: </strong>
                    <span>{entry.task_in_progress}</span>
                  </div>

                  {entry.blockers && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--danger)', background: 'var(--danger-bg)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                      <strong>Blockers: </strong>{entry.blockers}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default DailyStatus;
