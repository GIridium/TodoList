// src/App.jsx
import { useState, useEffect } from "react";
import { Empty, Button, message } from "antd";
import "./styles.css";
import Auth from "./components/Auth/Auth";
import api from "./api";

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 检查本地存储中的认证状态
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      loadTodos();
    }
  }, []);

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      console.log("API Response - Todos:", data); // 👈 调试：查看实际数据

      // ✅ 防御性检查：确保 data 是数组
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error("Expected array from getTodos, got:", data);
        setTodos([]); // 安全兜底
        message.error("Failed to load todos: Invalid data format");
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
      message.error("Failed to load todos");
    }
  };

  const handleLogin = async (userData) => {
    setLoading(true);
    try {
      const data = await api.login({
        username: userData.username,
        password: userData.password,
      });

      // 保存 token 和用户信息
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);

      message.success("Login successful");
      loadTodos(); // 登录后加载待办事项
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setTodos([]);
    message.success("Logged out successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const newTodo = await api.createTodo({
        title: newItem,
        dueDate: dueDate || null,
      });

      // 🔍 调试：打印 createTodo 的响应
      console.log("🚀 createTodo Response:", newTodo);

      // ✅ 检查返回的对象是否包含必要字段
      if (
        newTodo &&
        typeof newTodo === "object" &&
        newTodo.title &&
        newTodo._id !== undefined
      ) {
        setTodos([...todos, newTodo]);
        setNewItem("");
        setDueDate("");
        message.success("Todo added successfully");
      } else {
        console.error("❌ Invalid todo object from createTodo:", newTodo);
        // 兜底：重新加载列表
        loadTodos();
        message.warning("Task created, but UI needs refresh.");
      }
    } catch (error) {
      console.error("❌ Failed to add todo:", error);
      message.error("Failed to add todo");
    }
  };

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

  // ✅ 防御性渲染：检查 todos 是否为数组
  const renderTodos = () => {
    if (!Array.isArray(todos) || todos.length === 0) {
      return (
        <div className="empty-state">
          <Empty
            description="No tasks yet"
            styles={{
              image: {
                filter: "hue-rotate(180deg) saturate(1.5)",
                marginBottom: 20,
              },
            }}
          />
        </div>
      );
    }
    return todos.map((todo) => (
      <li key={todo._id}>
        {" "}
        {/* ✅ 使用 todo._id 作为 key */}
        <label>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => toggleTodo(todo._id, e.target.checked)}
          />
          <span
            style={{
              textDecoration: todo.completed ? "line-through" : "none",
              color: todo.completed ? "#7b9eb1" : "#333",
            }}
          >
            {todo.title} {/* ✅ 显示 title */}
          </span>
          <span
            className="due-date"
            style={{
              marginLeft: "10px",
              fontSize: "0.8rem",
              color: getDateColor(todo.dueDate),
            }}
          >
            {formatDueDate(todo.dueDate)}
          </span>
        </label>
        <button
          onClick={() => deleteTodo(todo._id)} // ✅ 传入 todo._id
          className="btn btn-danger"
        >
          Delete
        </button>
      </li>
    ));
  };

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

  return (
    <div className="app-container">
      <div className="user-header">
        <span>Welcome, {user?.username}</span>
        <Button type="link" onClick={handleLogout} className="logout-btn">
          Logout
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="new-item-form">
        <div className="form-row">
          <label htmlFor="item">Task</label>
          <input
            type="text"
            id="item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button className="btn" type="submit">
          Add Task
        </button>
      </form>

      <h1 className="header">Todo List</h1>

      <ul className="list">{renderTodos()}</ul>
    </div>
  );
}

// 辅助函数
function formatDueDate(dateString) {
  if (!dateString || dateString === "No deadline") return dateString;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateColor(dateString) {
  if (!dateString || dateString === "No deadline") return "#5f9ea0";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "#f08080";
  if (diffDays === 0) return "#ffa500";
  if (diffDays <= 3) return "#ffd700";
  return "#4682b4";
}
