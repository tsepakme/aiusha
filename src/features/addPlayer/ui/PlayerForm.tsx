import React, { useState } from 'react';
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"

interface PlayerFormProps {
  onAddPlayer: (name: string, rating?: string) => void;
  disabled?: boolean;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ 
  onAddPlayer,
  disabled = false
}) => {
  const [playerName, setPlayerName] = useState('');
  const [playerRating, setPlayerRating] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    onAddPlayer(playerName, playerRating);
    setPlayerName('');
    setPlayerRating('');
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2 my-3'>
      <h2 className="text-lg font-medium">Add Players</h2>
      <label htmlFor='playerName' className="text-sm font-medium">Player Name</label>
      <Input
        id='playerName'
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        disabled={disabled}
        required
      />
      <label htmlFor='playerRating' className="text-sm font-medium">Player Rating (optional)</label>
      <Input
        id='playerRating'
        type="number"
        value={playerRating}
        onChange={(e) => setPlayerRating(e.target.value)}
        disabled={disabled}
      />
      <Button 
        variant={'secondary'} 
        type="submit"
        disabled={disabled || !playerName.trim()}
      >
        Add Player
      </Button>
    </form>
  );
}; 