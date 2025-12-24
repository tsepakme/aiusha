import React, { useEffect } from 'react';
import { StandingsTable } from '@/entities/tournament/ui/StandingsTable';
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { useTournamentContext } from '../model/TournamentContext';
import { analytics } from '@/shared/lib/analytics';
import { SupportButton } from '@/shared/components/SupportButton';

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

      {/* Show support button after tournament is finished */}
      {isFinished && (
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <div className="flex flex-col items-center gap-3 text-center">
            <h3 className="font-semibold">Enjoyed using this tournament manager?</h3>
            <p className="text-sm text-muted-foreground">
              Help us keep this tool free and improve it further!
            </p>
            <SupportButton
              source="standings"
              tournamentId={`tournament_${Date.now()}`}
              variant="default"
            />
          </div>
        </div>
      )}

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
