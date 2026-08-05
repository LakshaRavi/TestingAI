import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/services';
import ProjectModal from '../components/ProjectModal';
import AssignModal from '../components/AssignModal';
import NotificationToast from '../components/NotificationToast';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  Calendar, 
  Clock, 
  Search,
  Users
} from 'lucide-react';

const Projects = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningProject, setAssigningProject] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Admin sees all projects; Employee sees assigned projects
      const data = await projectsAPI.getProjects(isAdmin ? null : user?.id);
      setProjects(data);
    } catch (err) {
      showToast('Failed to load projects list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateNew = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleOpenAssign = (project) => {
    setAssigningProject(project);
    setIsAssignModalOpen(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will remove all member assignments and status history for this project.')) {
      return;
    }

    try {
      await projectsAPI.deleteProject(projectId);
      showToast('Project deleted successfully', 'success');
      fetchProjects();
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  const handleSaveProject = async (formData) => {
    if (editingProject) {
      await projectsAPI.updateProject(editingProject.id, formData);
      showToast('Project updated successfully', 'success');
    } else {
      await projectsAPI.createProject(formData);
      showToast('Project created successfully', 'success');
    }
    fetchProjects();
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2>Projects Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isAdmin ? 'Manage office projects, status updates, and team member assignments.' : 'View your assigned office projects and status details.'}
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={handleCreateNew}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '40px' }}
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Not Started">Not Started</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROJECTS GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Briefcase size={40} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
          <h3>No Projects Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Try adjusting your search criteria or create a new project.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredProjects.map((project) => (
            <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                  {project.project_name}
                </h3>
                <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                  {project.status}
                </span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', flex: 1 }}>
                {project.description || 'No detailed description provided.'}
              </p>

              {/* TIMELINE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem', background: 'var(--bg-dark)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <Calendar size={14} color="var(--primary)" />
                <span>{project.start_date} → {project.end_date}</span>
              </div>

              {/* ASSIGNED MEMBERS */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} /> Team Members ({project.members?.length || 0})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {project.members && project.members.length > 0 ? (
                    project.members.map(m => (
                      <span
                        key={m.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'var(--bg-surface-hover)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-xl)',
                          fontSize: '0.75rem',
                          color: 'var(--text-main)'
                        }}
                      >
                        <div className="user-avatar" style={{ width: 18, height: 18, fontSize: '0.6rem' }}>
                          {m.name.substring(0, 2).toUpperCase()}
                        </div>
                        {m.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', italic: 'true' }}>No team members assigned</span>
                  )}
                </div>
              </div>

              {/* ADMIN ACTIONS */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleOpenAssign(project)}>
                    <UserPlus size={14} /> Assign
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(project)} title="Edit Project">
                    <Edit size={14} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)} title="Delete Project">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
      />

      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        project={assigningProject}
        onAssignSuccess={() => {
          showToast('Project member assignments saved successfully', 'success');
          fetchProjects();
        }}
      />

      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Projects;
