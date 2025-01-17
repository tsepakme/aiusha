import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '../types/todo';
import { TodoContextProps } from '../types/todo';

// Создание контекста задач
const TodoContext = createContext<TodoContextProps | undefined>(undefined);

// Провайдер контекста задач
export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <TodoContext.Provider
      value={{
        tasks,
        newTask,
        setNewTask,
        handleAddTask,
        handleKeyPress,
        handleToggleTask,
        handleRemoveTask,
        handleEditTask,
        handleSaveTask,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// Хук для использования контекста задач
export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};