import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlayersList } from "@/entities/player/ui/PlayersList";
import { useRoundRobinContext } from '../model/RoundRobinContext';

export const RRPlayersTab: React.FC = () => {
  const { 
    players, 
    tournament,
    addPlayer, 
    removePlayer, 
    editPlayer, 
    startTournament,
    resetTournament
  } = useRoundRobinContext();

  const [nameInput, setNameInput] = useState('');
  const [ratingInput, setRatingInput] = useState('');

  const handleAddPlayer = () => {
    if (nameInput.trim() !== '') {
      addPlayer(nameInput, ratingInput);
      setNameInput('');
      setRatingInput('');
      toast.success('Player added');
    } else {
      toast.error('Failed to add player', {
        description: 'Name cannot be empty',
      });
    }
  };
  
  const handleRemovePlayer = (index: number) => {
    removePlayer(index);
    toast.success('Player removed');
  };
  
  const handleEditPlayer = (index: number, name: string, rating?: string) => {
    if (name.trim() === '') {
      toast.error('Failed to update player', {
        description: 'Name cannot be empty',
      });
      return;
    }
    
    editPlayer(index, name, rating);
    toast.success('Player updated');
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Player name"
          className="mr-2 p-2 border rounded"
        />
        <input
          type="text"
          value={ratingInput}
          onChange={(e) => setRatingInput(e.target.value)}
          placeholder="Rating (optional)"
          className="mr-2 p-2 border rounded"
        />
        <button 
          onClick={handleAddPlayer}
          className="p-2 bg-blue-500 text-white rounded"
          disabled={!!tournament}
        >
          Add Player
        </button>
      </div>
      
      <PlayersList 
        players={players}
        isTournamentActive={!!tournament}
        onRemovePlayer={!tournament ? handleRemovePlayer : undefined}
        onEditPlayer={!tournament ? handleEditPlayer : undefined}
        onStartTournament={!tournament && players.length >= 2 ? startTournament : undefined}
        onResetPlayers={resetTournament}
      />
    </div>
  );
};