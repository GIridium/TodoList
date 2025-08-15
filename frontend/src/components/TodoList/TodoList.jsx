// src/components/TodoList/TodoList.jsx
import { Empty } from "antd";

/**
 * 任务列表展示组件
 * 渲染待办事项列表，支持完成状态切换和删除操作
 *
 * @param {Array} todos - 待办事项数组
 * @param {Function} onToggle - 切换任务完成状态的回调函数，接收 (id, completed)
 * @param {Function} onDelete - 删除任务的回调函数，接收 (id)
 */

// 格式化日期显示：将日期字符串转换为 "短月份 日, 年" 的格式
function formatDueDate(dateString) {
  if (!dateString || dateString === "No deadline") return dateString;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// 根据任务截止日期与当前日期的差距，返回对应的颜色值
function getDateColor(dateString) {
  if (!dateString || dateString === "No deadline") return "#5f9ea0";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "#f08080"; // 已过期：红色
  if (diffDays === 0) return "#ffa500"; // 今天到期：橙色
  if (diffDays <= 3) return "#ffd700"; // 3天内到期：黄色
  return "#4682b4"; // 正常：蓝色
}

export default function TodoList({ todos, onToggle, onDelete }) {
  /**
   * 渲染任务列表项
   * 若任务列表为空，显示空状态提示
   */
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
        <label>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => onToggle(todo._id, e.target.checked)}
          />
          <span
            style={{
              textDecoration: todo.completed ? "line-through" : "none",
              color: todo.completed ? "#7b9eb1" : "#333",
            }}
          >
            {todo.title}
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
        <button onClick={() => onDelete(todo._id)} className="btn btn-danger">
          Delete
        </button>
      </li>
    ));
  };

  return <ul className="list">{renderTodos()}</ul>;
}
