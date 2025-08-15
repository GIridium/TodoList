// src/components/TodoForm/TodoForm.jsx
import { useState } from "react";

/**
 * 任务输入表单组件
 * 允许用户输入任务标题和截止日期，并提交新任务
 *
 * @param {Function} onSubmit - 提交表单时调用的回调函数，接收 (title, dueDate) 两个参数
 */
export default function TodoForm({ onSubmit }) {
  // 本地状态：存储当前输入的任务标题
  const [newItem, setNewItem] = useState("");
  // 本地状态：存储当前选择的截止日期
  const [dueDate, setDueDate] = useState("");

  /**
   * 处理表单提交事件
   * 阻止默认提交行为，验证输入，调用父组件传入的 onSubmit 函数
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    onSubmit(newItem, dueDate);
    // 提交后清空输入框
    setNewItem("");
    setDueDate("");
  };

  return (
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
  );
}
