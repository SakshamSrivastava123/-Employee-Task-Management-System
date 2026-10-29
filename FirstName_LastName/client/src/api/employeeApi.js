import http, { cleanParams } from './http.js';

export const fetchEmployees = (params) =>
  http.get('/employees', { params: cleanParams(params) }).then((r) => r.data);
export const fetchEmployeeLookup = () => http.get('/employees/lookup').then((r) => r.data.data);
export const fetchEmployee = (id) => http.get(`/employees/${id}`).then((r) => r.data.data);
export const createEmployee = (body) => http.post('/employees', body).then((r) => r.data.data);
export const updateEmployee = (id, body) => http.put(`/employees/${id}`, body).then((r) => r.data.data);
export const deleteEmployee = (id) => http.delete(`/employees/${id}`).then((r) => r.data);
