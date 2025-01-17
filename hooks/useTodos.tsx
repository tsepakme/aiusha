import { useState } from 'react';
import { Task } from '../types/todo';

// Пользовательский хук для управления состоянием задач
const useTodos = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Функция для добавления новой задачи
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, completed: false, isEditing: false }]);
      setNewTask('');
    }
  };

  // Функция для обработки нажатия клавиши Enter
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  // Функция для переключения состояния выполнения задачи
  const handleToggleTask = (index: number) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // Функция для удаления задачи
  const handleRemoveTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  // Функция для начала редактирования задачи
  const handleEditTask = (index: number) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, isEditing: true } : task
    );
    setTasks(updatedTasks);
  };

  // Функция для сохранения отредактированной задачи
  const handleSaveTask = (index: number, newText: string) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, text: newText, isEditing: false } : task
    );
    setTasks(updatedTasks);
  };

  return {
    tasks,
    newTask,
    setNewTask,
    handleAddTask,
    handleKeyPress,
    handleToggleTask,
    handleRemoveTask,
    handleEditTask,
    handleSaveTask,
  };
};

export default useTodos;