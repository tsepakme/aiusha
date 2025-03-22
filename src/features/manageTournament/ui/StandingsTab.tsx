import React from 'react';
import { StandingsTable } from '@/entities/tournament/ui/StandingsTable';
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { useTournamentContext } from '../model/TournamentContext';

export const StandingsTab: React.FC = () => {
  const { tournament, isFinished, resetTournament } = useTournamentContext();

  if (!tournament) {
    return (
      <div className="p-4 text-center">
        <p>No tournament data available. Please start a tournament first.</p>
      </div>
    );
  }

  return (
    <div>
      <StandingsTable 
        tournament={tournament} 
        isFinished={isFinished} 
      />
      
      <div className="mt-4">
        <DeleteConfirmationDialog 
          onConfirm={resetTournament} 
          value='Start New Tournament' 
          variant={'default'} 
        />
      </div>
    </div>
  );
}; 