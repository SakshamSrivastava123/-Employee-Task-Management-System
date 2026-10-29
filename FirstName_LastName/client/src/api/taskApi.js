import http, { cleanParams } from './http.js';
import { downloadBlob } from '../utils/download.js';

export const fetchTasks = (params) => http.get('/tasks', { params: cleanParams(params) }).then((r) => r.data);
export const fetchTask = (id) => http.get(`/tasks/${id}`).then((r) => r.data.data);
export const createTask = (body) => http.post('/tasks', body).then((r) => r.data.data);
export const updateTask = (id, body) => http.put(`/tasks/${id}`, body).then((r) => r.data.data);
export const updateTaskStatus = (id, status) => http.put(`/tasks/${id}/status`, { status }).then((r) => r.data.data);
export const deleteTask = (id) => http.delete(`/tasks/${id}`).then((r) => r.data);

// Downloads ALL tasks matching the filters (the server ignores page / limit).
export async function exportTasksCsv(params) {
  const { page, limit, ...filters } = params;
  const response = await http.get('/tasks/export', { params: cleanParams(filters), responseType: 'blob' });
  downloadBlob(response.data, `tasks-${new Date().toISOString().slice(0, 10)}.csv`);
}
