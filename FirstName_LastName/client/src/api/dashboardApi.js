import http from './http.js';

export const fetchDashboard = () => http.get('/dashboard').then((r) => r.data.data);
