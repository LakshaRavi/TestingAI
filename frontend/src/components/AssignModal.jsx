import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { usersAPI, assignmentsAPI } from '../api/services';

const AssignModal = ({ isOpen, onClose, project, onAssignSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      fetchEmployees();
      // Initialize selected employees from project members
      const currentMemberIds = project.members ? project.members.map(m => m.id) : [];
      setSelectedUserIds(currentMemberIds);
    }
  }, [isOpen, project]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getUsers('employee');
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees list');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  const toggleUser = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await assignmentsAPI.assignMembers(project.id, selectedUserIds);
      onAssignSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update project assignments');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <UserPlus size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Assign Employees to "{project.project_name}"
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading employees list...</p>
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {employees.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No employees found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {employees.map((emp) => {
                  const isChecked = selectedUserIds.includes(emp.id);
                  return (
                    <label
                      key={emp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: isChecked ? 'var(--primary-light)' : 'var(--bg-dark)',
                        border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleUser(emp.id)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? <div className="loading-spinner"></div> : <><Check size={16} /> Save Assignments</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;
