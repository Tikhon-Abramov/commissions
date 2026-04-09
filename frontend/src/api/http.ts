import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const userKey = localStorage.getItem('userKey');
  if (userKey) {
    config.headers['x-user-key'] = userKey;
  }
  return config;
});
