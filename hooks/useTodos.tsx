import { useState } from 'react';
import { Task } from '../types/todo';

const useTodos = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, completed: false, isEditing: false }]);
      setNewTask('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleToggleTask = (index: number) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const handleRemoveTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const handleEditTask = (index: number) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, isEditing: true } : task
    );
    setTasks(updatedTasks);
  };

  const handleSaveTask = (index: number, newText: string) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, text: newText, isEditing: false } : task
    );
    setTasks(updatedTasks);
  };

  const handleEditKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, index: number, newText: string) => {
    if (event.key === 'Enter') {
      handleSaveTask(index, newText);
    }
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
    handleEditKeyPress,
  };
};

export default useTodos;