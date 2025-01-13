import { useState } from 'react';
import './App.scss';

function App() {
  const [tasks, setTasks] = useState<{ text: string, completed: boolean, isEditing: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, completed: false, isEditing: false }]);
      setNewTask('');
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
    <div className='todo-app'>
      <h1>Hello world!</h1>
      <input 
        type='text' 
        value={newTask} 
        onChange={(e) => setNewTask(e.target.value)} 
        placeholder='Add a new task' 
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul>
        {tasks.map((task, index) => (
          <li key={index} className={task.completed ? 'completed' : ''}>
            {task.isEditing ? (
              <input 
                type='text' 
                defaultValue={task.text} 
                onBlur={(e) => handleSaveTask(index, e.target.value)} 
                autoFocus 
              />
            ) : (
              <span onClick={() => handleToggleTask(index)}>{task.text}</span>
            )}
            <div>
              {!task.isEditing && <button onClick={() => handleEditTask(index)}>Edit</button>}
              <button onClick={() => handleRemoveTask(index)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;