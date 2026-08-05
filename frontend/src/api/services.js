import api from './axios';

export const authAPI = {
  login: (email, password, role = 'employee', name = '') => api.post('/login', { email, password, role, name })
};


export const usersAPI = {
  getUsers: (role) => api.get('/users', { params: role ? { role } : {} }),
  createUser: (userData) => api.post('/users', userData)
};

export const projectsAPI = {
  getProjects: (userId) => api.get('/projects', { params: userId ? { user_id: userId } : {} }),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`)
};

export const assignmentsAPI = {
  assignMembers: (projectId, userIds) => api.post('/assign', { project_id: projectId, user_ids: userIds })
};

export const statusAPI = {
  createStatus: (statusData) => api.post('/status', statusData),
  getStatuses: (params = {}) => api.get('/status', { params }),
  updateStatus: (id, statusData) => api.put(`/status/${id}`, statusData)
};

export const reportsAPI = {
  getReports: (params = {}) => api.get('/reports', { params }),
  getMetrics: () => api.get('/dashboard/metrics')
};
