import React from 'react';
import { PlayerForm } from './PlayerForm';
import { PlayersList } from '@/entities/tournament/ui/PlayersList';

interface PlayersTabProps {
  players: Array<{ name: string; rating?: number }>;
  tournament: any | null;
  onAddPlayer: (name: string, rating?: string) => void;
  onRemovePlayer: (index: number) => void;
  onStartTournament: () => void;
  onResetPlayers: () => void;
}

export const PlayersTab: React.FC<PlayersTabProps> = ({
  players,
  tournament,
  onAddPlayer,
  onRemovePlayer,
  onStartTournament,
  onResetPlayers
}) => {
  return (
    <div>
      {!tournament && (
        <PlayerForm 
          onAddPlayer={onAddPlayer}
          disabled={!!tournament}
        />
      )}

      <PlayersList
        players={players}
        isTournamentActive={!!tournament}
        onRemovePlayer={!tournament ? onRemovePlayer : undefined}
        onStartTournament={!tournament ? onStartTournament : undefined}
        onResetPlayers={!tournament ? onResetPlayers : undefined}
      />
    </div>
  );
}; 