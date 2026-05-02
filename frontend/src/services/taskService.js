import api from './api';

export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getStats = () => api.get('/tasks/stats');
export const getRecentUpdates = () => api.get('/tasks/recent-updates');
export const getTaskUpdates = (id) => api.get(`/tasks/${id}/updates`);
export const addTaskUpdate = (id, data) => api.post(`/tasks/${id}/updates`, data);
