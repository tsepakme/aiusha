import React, { useState } from 'react';
import { TodoItemProps } from '../../types/todo';
import Button from '../Button/Button';
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
        <div className='task'>
          <input
            type='checkbox'
            checked={task.completed}
            onChange={onToggle}
          />
          <div className='task_text' onClick={onEdit}>{task.text}</div>
        </div>
      )}
      <div>
        {/* {!task.isEditing && <Button onClick={onEdit}>Edit</Button>} */}
        <Button onClick={onRemove}>Remove</Button>
      </div>
    </li>
  );
};

export default TodoItem;