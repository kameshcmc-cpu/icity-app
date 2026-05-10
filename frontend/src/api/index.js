import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${BASE_URL}/api` });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('icity_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('icity_token');
      localStorage.removeItem('icity_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = axios.create({ baseURL: `${BASE_URL}/auth` });
authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('icity_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
