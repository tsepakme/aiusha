import React, { useEffect } from 'react';
import { StandingsTable } from '@/entities/tournament/ui/StandingsTable';
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { useTournamentContext } from '../model/TournamentContext';
import { analytics } from '@/shared/lib/analytics';

export const StandingsTab: React.FC = () => {
  const { tournament, isFinished, resetTournament } = useTournamentContext();

  // Track standings view
  useEffect(() => {
    if (tournament) {
      const tournamentId = `tournament_${Date.now()}`;
      analytics.standingsViewed({
        tournament_id: tournamentId,
        round_number: tournament.rounds.length
      });
    }
  }, []); // Only track on mount

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
