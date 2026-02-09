import React from 'react';
import { PlayerForm } from './PlayerForm';
import { PlayersList } from '@/entities/tournament/ui/PlayersList';
import { useTournamentContext } from '@/features/manageTournament/model/TournamentContext';
import { toast } from 'sonner';

export const PlayersTab: React.FC = () => {
  const {
    players,
    tournament,
    addPlayer,
    removePlayer,
    editPlayer,
    startTournament,
    resetTournament
  } = useTournamentContext();

  const handleEditPlayer = (index: number, name: string, rating?: string) => {
    editPlayer(index, name, rating);
    toast.success('Player updated successfully');
  };

  const handleRemovePlayer = (index: number) => {
    removePlayer(index);
    toast.success('Player removed');
  };

  return (
    <div>
      {!tournament && (
        <PlayerForm
          onAddPlayer={addPlayer}
          disabled={!!tournament}
        />
      )}

      <PlayersList
        players={players}
        isTournamentActive={!!tournament}
        onRemovePlayer={!tournament ? handleRemovePlayer : undefined}
        onEditPlayer={!tournament ? handleEditPlayer : undefined}
        onStartTournament={
          !tournament && players.length >= 2
            ? () => startTournament(players)
            : undefined
        }
        onResetPlayers={resetTournament}
      />
    </div>
  );
};