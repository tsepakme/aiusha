import React, { useState, useEffect } from 'react';
import { Button } from "@/shared/components/button";
import { Separator } from "@/shared/components/separator";
import { RoundView } from '@/entities/tournament/ui/RoundView';
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { toast } from "sonner";
import { useRoundRobinContext } from '../model/RoundRobinContext';
import { MatchResult } from '@/shared/types/enums';

export const RoundRobinRoundsTab: React.FC = () => {
  const {
    tournament,
    roundResults,
    isFinished,
    handleResultChange,
    nextRound,
    finishTournament,
    resetTournament
  } = useRoundRobinContext();

  const [unfilledMatchesCount, setUnfilledMatchesCount] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  useEffect(() => {
    if (!tournament) return;
    
    setCurrentRoundIndex(tournament.currentRound || 0);
    
    const currentRoundMatches = tournament.rounds[currentRoundIndex]?.matches || [];
    const currentRoundResults = roundResults[currentRoundIndex] || [];
    
    const unfilled = currentRoundMatches.filter((match, index) => 
      match.player2 && currentRoundResults[index] === undefined
    );
    
    setUnfilledMatchesCount(unfilled.length);
  }, [tournament, roundResults, currentRoundIndex]);

  if (!tournament) {
    return (
      <div className="p-4 text-center">
        <p>No active tournament. Please add players and start a tournament first.</p>
      </div>
    );
  }

  const handleMatchResultChange = (roundIndex: number, matchIndex: number, result: MatchResult) => {
    handleResultChange(roundIndex, matchIndex, result);
    
    setTimeout(() => {
      const currentRoundMatches = tournament.rounds[currentRoundIndex]?.matches || [];
      const currentRoundResults = roundResults[currentRoundIndex] || [];
      
      const unfilled = currentRoundMatches.filter((match, index) => 
        match.player2 && currentRoundResults[index] === undefined
      );
      
      setUnfilledMatchesCount(unfilled.length);
    }, 50);
  };

  const handleNextRound = () => {
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
    setCurrentRoundIndex(prev => prev + 1);
    toast.success('Round finished');
  };

  const handleFinishTournament = () => {
    const currentRoundMatches = tournament.rounds[currentRoundIndex]?.matches || [];
    const currentRoundResults = roundResults[currentRoundIndex] || [];

    const unfilledMatches = currentRoundMatches
      .filter((match, index) => match.player2 && !currentRoundResults[index]);

    if (unfilledMatches.length > 0) {
      toast.error('Cannot finish tournament', {
        description: `Please fill in results for all matches in current round before finishing.`,
        duration: 5000,
      });
      return;
    }

    finishTournament();
    toast.success('Tournament finished', {
      description: 'The tournament has finished. Go to the "Standings" tab to see the final standings.',
    });
  };

  const isLastRound = currentRoundIndex === tournament.rounds.length - 1;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Round {currentRoundIndex + 1} of {tournament.rounds.length}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          In a round-robin tournament, each player plays against every other player once.
        </p>
      </div>

      <RoundView
        roundNumber={currentRoundIndex + 1}
        matches={tournament.rounds[currentRoundIndex].matches}
        results={roundResults[currentRoundIndex] || []}
        onResultChange={(matchIndex, result) => handleMatchResultChange(currentRoundIndex, matchIndex, result)}
        isCurrentRound={true}
        isFinished={isFinished}
      />
      
      <Separator className='my-4' />

      <div className='flex flex-col sm:flex-row justify-between gap-2 mt-5 w-full'>
        {!isLastRound && !isFinished && (
          <Button
            onClick={handleNextRound}
          >
            Next Round {unfilledMatchesCount > 0 ? `(${unfilledMatchesCount} results missing)` : ''}
          </Button>
        )}
        {isLastRound && !isFinished && (
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