import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // 认证相关
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),

  // Todo相关
  getTodos: () => api.get('/todos'),
  createTodo: (todoData) => api.post('/todos', todoData),
  updateTodo: (id, todoData) => api.put(`/todos/${id}`, todoData),
  deleteTodo: (id) => api.delete(`/todos/${id}`),
};