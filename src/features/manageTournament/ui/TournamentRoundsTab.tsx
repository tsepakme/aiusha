import React from 'react';
import { Button } from "@/shared/components/button";
import { Separator } from "@/shared/components/separator";
import { RoundView } from '@/entities/tournament/ui/RoundView';
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { Tournament } from '@/entities/tournament/model/tournament';
import { calculateRounds } from '../model/manageTournament';
import { toast } from "sonner";

interface TournamentRoundsTabProps {
  tournament: Tournament | null;
  roundResults: string[][];
  isFinished: boolean;
  onResultChange: (roundIndex: number, matchIndex: number, result: string) => void;
  onNextRound: () => void;
  onFinishTournament: () => void;
  onResetTournament: () => void;
}

export const TournamentRoundsTab: React.FC<TournamentRoundsTabProps> = ({
  tournament,
  roundResults,
  isFinished,
  onResultChange,
  onNextRound,
  onFinishTournament,
  onResetTournament
}) => {
  if (!tournament) {
    return (
      <div className="p-4 text-center">
        <p>No active tournament. Please add players and start a tournament first.</p>
      </div>
    );
  }

  const handleNextRound = () => {
    onNextRound();
    toast.success('Round finished');
  };

  const handleFinishTournament = () => {
    onFinishTournament();
    toast.success('Tournament finished', {
      description: 'The tournament has finished. Go to the "Standings" tab to see the final standings.',
    });
  };

  return (
    <div>
      {tournament.rounds.map((round, roundIndex) => (
        <div key={roundIndex}>
          <RoundView
            roundNumber={roundIndex + 1}
            matches={round.matches}
            results={roundResults[roundIndex] || []}
            onResultChange={(matchIndex, result) => onResultChange(roundIndex, matchIndex, result)}
            isCurrentRound={roundIndex === tournament.rounds.length - 1}
            isFinished={isFinished}
          />
          <Separator className='my-4' />
        </div>
      ))}
      
      <div className='flex flex-col sm:flex-row justify-between gap-2 mt-5 w-full'>
        {tournament.rounds.length < calculateRounds(tournament.players.length) && !isFinished && (
          <Button className='' onClick={handleNextRound}>Next Round</Button>
        )}
        {tournament.rounds.length === calculateRounds(tournament.players.length) && !isFinished && (
          <Button onClick={handleFinishTournament}>Finish Tournament</Button>
        )}
        <DeleteConfirmationDialog 
          onConfirm={onResetTournament} 
          value='Delete all' 
          variant={'destructive'} 
        />
      </div>
    </div>
  );
}; 