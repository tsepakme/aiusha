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
    nextRound();
    toast.success('Round finished');
  };

  const handleFinishTournament = () => {
    finishTournament();
    toast.success('Tournament finished', {
      description: 'The tournament has finished. Go to the "Standings" tab to see the final standings.',
    });
  };

  const currentRoundIndex = tournament.rounds.length - 1;
  const currentRoundMatches = tournament.rounds[currentRoundIndex]?.matches || [];
  const currentRoundResults = roundResults[currentRoundIndex] || [];
  const allResultsFilled = currentRoundMatches.length > 0 && 
    currentRoundMatches.every((match, index) => 
      !match.player2 || currentRoundResults[index]);

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
            disabled={!allResultsFilled}
            title={!allResultsFilled ? "Fill all match results before proceeding" : ""}
          >
            Next Round
          </Button>
        )}
        {tournament.rounds.length === calculateRounds(tournament.players.length) && !isFinished && (
          <Button 
            onClick={handleFinishTournament}
            disabled={!allResultsFilled}
            title={!allResultsFilled ? "Fill all match results before finishing" : ""}  
          >
            Finish Tournament
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