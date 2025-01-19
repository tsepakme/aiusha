import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types/todo';

interface TodoContextProps {
  tasks: Task[];
  newTask: string;
  setNewTask: (task: string) => void;
  handleAddTask: () => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleToggleTask: (index: number) => void;
  handleRemoveTask: (index: number) => void;
  handleEditTask: (index: number) => void;
  handleSaveTask: (index: number, newText: string) => void;
}

const TodoContext = createContext<TodoContextProps | undefined>(undefined);

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

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

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};