import React, { useState } from 'react';
import { TodoItemProps } from '../../types/todo';
import './TodoItem.scss';

const TodoItem: React.FC<TodoItemProps> = ({ task, onToggle, onEdit, onSave, onRemove, onEditKeyPress }) => {
  const [editText, setEditText] = useState(task.text);

  return (
    <li className={task.completed ? 'completed' : ''}>
      {task.isEditing ? (
        <input
          type='text'
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => onSave(editText)}
          onKeyDown={(e) => onEditKeyPress(e, editText)}
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