import React from 'react';
import { TodoProvider } from '../contexts/TodoContext';
import useTodos from '../hooks/useTodos';
import TodoItem from '../components/TodoItem/TodoItem';
import Button from '../components/Button/Button';
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
  } = useTodos();

  return (
    <div className='todo-app'>
      <h1>Hello world!</h1>
      <input
        type='text'
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder='Add a new task'
      />
      <Button onClick={handleAddTask}>Add Task</Button>
      <ul>
        {tasks.map((task, index) => (
          <TodoItem
            key={index}
            task={task}
            onToggle={() => handleToggleTask(index)}
            onEdit={() => handleEditTask(index)}
            onSave={(newText) => handleSaveTask(index, newText)}
            onRemove={() => handleRemoveTask(index)}
          />
        ))}
      </ul>
    </div>
  );
};

const App: React.FC = () => (
  <TodoProvider>
    <AppContent />
  </TodoProvider>
);

export default App;