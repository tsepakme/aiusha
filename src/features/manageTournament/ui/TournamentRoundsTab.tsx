import React from 'react';
import { Button } from "@/shared/components/button";
import { Separator } from "@/shared/components/separator";
import { RoundView } from '@/entities/tournament/ui/RoundView';
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { calculateRounds } from '../model/manageTournament';
import { toast } from "sonner";
import { useTournamentContext } from '../model/TournamentContext';

export const TournamentRoundsTab: React.FC = () => {
  const {
    tournament,
    roundResults,
    isFinished,
    handleResultChange,
    nextRound,
    finishTournament,
    resetTournament
  } = useTournamentContext();

  if (!tournament) {
    return (
      <div className="p-4 text-center">
        <p>No active tournament. Please add players and start a tournament first.</p>
      </div>
    );
  }

  const handleNextRound = () => {
    const currentRoundIndex = tournament.rounds.length - 1;
    const currentRoundMatches = tournament.rounds[currentRoundIndex]?.matches || [];
    const currentRoundResults = roundResults[currentRoundIndex] || [];

    const unfilledMatches = currentRoundMatches
      .filter((match, index) => match.player2 && !currentRoundResults[index]);

    if (unfilledMatches.length > 0) {
      toast.error('Cannot proceed to next round', {
        description: `Please fill in results for all matches before continuing.`,
        duration: 5000,
      });
      return;
    }

    nextRound();
    toast.success('Round finished');
  };

  const handleFinishTournament = () => {
    const currentRoundIndex = tournament.rounds.length - 1;
    const currentRoundMatches = tournament.rounds[currentRoundIndex]?.matches || [];
    const currentRoundResults = roundResults[currentRoundIndex] || [];

    const unfilledMatches = currentRoundMatches
      .filter((match, index) => match.player2 && !currentRoundResults[index]);

    if (unfilledMatches.length > 0) {
      toast.error('Cannot finish tournament', {
        description: `Please fill in results for all matches in round ${currentRoundIndex + 1} before finishing.`,
        duration: 5000,
      });
      return;
    }

    finishTournament();
    toast.success('Tournament finished', {
      description: 'The tournament has finished. Go to the "Standings" tab to see the final standings.',
    });
  };

  const currentRoundIndex = tournament.rounds.length - 1;
  const currentRoundMatches = tournament.rounds[currentRoundIndex]?.matches || [];
  const currentRoundResults = roundResults[currentRoundIndex] || [];
  const unfilledMatches = currentRoundMatches
    .filter((match, index) => match.player2 && !currentRoundResults[index]);
  const unfilledMatchesCount = unfilledMatches.length;

  return (
    <div>
      {tournament.rounds.map((round, roundIndex) => (
        <div key={roundIndex}>
          <RoundView
            roundNumber={roundIndex + 1}
            matches={round.matches}
            results={roundResults[roundIndex] || []}
            onResultChange={(matchIndex, result) => handleResultChange(roundIndex, matchIndex, result)}
            isCurrentRound={roundIndex === tournament.rounds.length - 1}
            isFinished={isFinished}
          />
          <Separator className='my-4' />
        </div>
      ))}
      
      <div className='flex flex-col sm:flex-row justify-between gap-2 mt-5 w-full'>
        {tournament.rounds.length < calculateRounds(tournament.players.length) && !isFinished && (
          <Button 
            className='' 
            onClick={handleNextRound}
          >
            Next Round {unfilledMatchesCount > 0 ? `(${unfilledMatchesCount} results missing)` : ''}
          </Button>
        )}
        {tournament.rounds.length === calculateRounds(tournament.players.length) && !isFinished && (
          <Button 
            onClick={handleFinishTournament}
          >
            Finish Tournament {unfilledMatchesCount > 0 ? `(${unfilledMatchesCount} results missing)` : ''}
          </Button>
        )}
        <DeleteConfirmationDialog 
          onConfirm={resetTournament} 
          value='Delete all' 
          variant={'destructive'} 
        />
      </div>
    </div>
  );
};