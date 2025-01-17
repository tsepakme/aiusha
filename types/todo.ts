export type Task = {
  text: string
  completed: boolean
  isEditing: boolean
}

export type TodoContextProps = {
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