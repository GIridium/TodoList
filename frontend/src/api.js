// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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

// 响应拦截器 - 适配当前后端（无 data 包裹）
api.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    const method = response.config.method;

    if (url.includes('/todos')) {
      // 创建、更新：返回单个对象
      if (method === 'post' || method === 'put') {
        return response.data; // ✅ 直接返回对象
      }
      // 获取列表：返回数组
      if (method === 'get') {
        return Array.isArray(response.data) ? response.data : [];
      }
      // 删除：返回成功消息
      if (method === 'delete') {
        return response.data; // 可以是 { success: true, message: '...' }
      }
    }

    // auth 等其他接口
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getTodos: () => api.get('/todos'),
  createTodo: (todoData) => api.post('/todos', todoData),
  updateTodo: (id, todoData) => api.put(`/todos/${id}`, todoData),
  deleteTodo: (id) => api.delete(`/todos/${id}`),
};