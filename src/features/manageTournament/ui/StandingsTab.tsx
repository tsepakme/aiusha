import React from 'react';
import { StandingsTable } from '@/entities/tournament/ui/StandingsTable';
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { Tournament } from '@/entities/tournament/model/tournament';

interface StandingsTabProps {
  tournament: Tournament | null;
  isFinished: boolean;
  onResetTournament: () => void;
}

export const StandingsTab: React.FC<StandingsTabProps> = ({
  tournament,
  isFinished,
  onResetTournament
}) => {
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
          onConfirm={onResetTournament} 
          value='Start New Tournament' 
          variant={'default'} 
        />
      </div>
    </div>
  );
}; 