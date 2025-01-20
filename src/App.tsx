import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TodoProvider } from '../contexts/TodoContext';
import useTodos from '../hooks/useTodos';
import TodoItem from '../components/TodoItem/TodoItem';
import Button from '../components/Button/Button';
import SwissPage from '../pages/SwissPage';
import './App.scss';

const AppContent: React.FC = () => {
  const {
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
  } = useTodos();

  return (
    <div className='todo-app'>
      <h1>Hello world!</h1>
      <div className='add-task'>
        <input
          type='text'
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder='Add a new task'
        />
        <Button onClick={handleAddTask}>Add Task</Button>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <TodoItem
            key={index}
            task={task}
            onToggle={() => handleToggleTask(index)}
            onEdit={() => handleEditTask(index)}
            onSave={(newText) => handleSaveTask(index, newText)}
            onRemove={() => handleRemoveTask(index)}
            onEditKeyPress={(e, newText) => handleEditKeyPress(e, index, newText)}
          />
        ))}
      </ul>
    </div>
  );
};

const App: React.FC = () => (
  <TodoProvider>
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/swiss" element={<SwissPage />} />
      </Routes>
    </Router>
  </TodoProvider>
);

export default App;