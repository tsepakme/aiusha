import React from 'react';
import { PlayerForm } from './PlayerForm';
import { PlayersList } from '@/entities/tournament/ui/PlayersList';
import { useTournamentContext } from '@/features/manageTournament/model/TournamentContext';

export const PlayersTab: React.FC = () => {
  const {
    players,
    tournament,
    addPlayer,
    removePlayer,
    startTournament,
    resetTournament
  } = useTournamentContext();

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
        onRemovePlayer={!tournament ? removePlayer : undefined}
        onStartTournament={!tournament ? startTournament : undefined}
        onResetPlayers={!tournament ? resetTournament : undefined}
      />
    </div>
  );
}; 