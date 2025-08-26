import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60_000,
});

http.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(err?.response?.data || err),
);
