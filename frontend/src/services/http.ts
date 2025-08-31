import axios from 'axios';

// API base URL - cập nhật để trỏ đúng backend với CORS đã sửa
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 60_000,
  headers: {
    'Accept': 'application/json',
  }
});

// Response interceptor để xử lý CORS và errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle CORS errors
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({
        message: 'Lỗi kết nối mạng. Kiểm tra xem backend có đang chạy không?',
        details: 'Network Error - possibly CORS issue'
      });
    }
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Yêu cầu timeout. Server phản hồi quá chậm.',
        details: 'Request timeout'
      });
    }
    
    return Promise.reject(error?.response?.data || error);
  }
);

// Request interceptor để log requests
http.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export default http;