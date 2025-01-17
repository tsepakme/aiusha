import React from 'react';
import { Task } from '../../types/todo';
import './TodoItem.scss';

interface TodoItemProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onSave: (newText: string) => void;
  onRemove: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ task, onToggle, onEdit, onSave, onRemove }) => {
  return (
    <li className={task.completed ? 'completed' : ''}>
      {task.isEditing ? (
        <input
          type='text'
          defaultValue={task.text}
          onBlur={(e) => onSave(e.target.value)}
          autoFocus
        />
      ) : (
        <span>
          <input
            type='checkbox'
            checked={task.completed}
            onChange={onToggle}
          />
          {task.text}
        </span>
      )}
      <div>
        {!task.isEditing && <button onClick={onEdit}>Edit</button>}
        <button onClick={onRemove}>Remove</button>
      </div>
    </li>
  );
};

export default TodoItem;