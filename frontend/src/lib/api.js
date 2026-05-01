import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const bookingApi = {
  submit: (data) => api.post('/bookings', data),
  list: (params) => api.get('/bookings', { params }),
  cities: () => api.get('/bookings/cities'),
  get: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.patch(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};
