// src/App.jsx
import { useState, useEffect } from "react";
import { message } from "antd";
import Auth from "./components/Auth/Auth";
import TodoForm from "./components/TodoForm/TodoForm";
import TodoList from "./components/TodoList/TodoList";
import UserHeader from "./components/UserHeader/UserHeader";
import api from "./api";
import "./styles.css";

/**
 * 主应用组件
 * 管理用户认证、待办事项数据流，并协调各子组件通信
 */
export default function App() {
  const [todos, setTodos] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 页面加载时检查本地存储中的登录状态
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      loadTodos();
    }
  }, []);

  // 从 API 加载待办事项列表
  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error("Expected array from getTodos, got:", data);
        setTodos([]);
        message.error("Failed to load todos: Invalid data format");
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
      message.error("Failed to load todos");
    }
  };

  // 处理用户登录逻辑
  const handleLogin = async (userData) => {
    setLoading(true);
    try {
      const data = await api.login({
        username: userData.username,
        password: userData.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);
      message.success("Login successful");
      loadTodos();
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 处理用户注册逻辑
  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      await api.register({
        username: userData.username,
        password: userData.password,
      });
      message.success("Registration successful. Please login.");
      return true;
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 处理用户登出
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setTodos([]);
    message.success("Logged out successfully");
  };

  // 添加新任务
  const addTodo = async (title, dueDate) => {
    try {
      const newTodo = await api.createTodo({
        title,
        dueDate: dueDate || null,
      });

      if (
        newTodo &&
        typeof newTodo === "object" &&
        newTodo.title &&
        newTodo._id !== undefined
      ) {
        setTodos([...todos, newTodo]);
        message.success("Todo added successfully");
      } else {
        console.error("Invalid todo object from createTodo:", newTodo);
        loadTodos();
        message.warning("Task created, but UI needs refresh.");
      }
    } catch (error) {
      console.error("Failed to add todo:", error);
      message.error("Failed to add todo");
    }
  };

  // 切换任务完成状态
  const toggleTodo = async (id, completed) => {
    try {
      await api.updateTodo(id, { completed });
      setTodos(
        todos.map((todo) => (todo._id === id ? { ...todo, completed } : todo))
      );
      message.success("Todo updated successfully");
    } catch (error) {
      console.error("Failed to update todo:", error);
      message.error("Failed to update todo");
    }
  };

  // 删除任务
  const deleteTodo = async (id) => {
    try {
      await api.deleteTodo(id);
      setTodos(todos.filter((todo) => todo._id !== id));
      message.success("Todo deleted successfully");
    } catch (error) {
      console.error("Failed to delete todo:", error);
      message.error("Failed to delete todo");
    }
  };

  // 未登录状态：显示认证组件
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <Auth
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loading}
          onRegisterSuccess={() => message.success("注册成功，请登录")}
        />
      </div>
    );
  }

  // 已登录状态：显示任务界面
  return (
    <div className="app-container">
      <UserHeader user={user} onLogout={handleLogout} />
      <TodoForm onSubmit={addTodo} />
      <h1 className="header">Todo List</h1>
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}
