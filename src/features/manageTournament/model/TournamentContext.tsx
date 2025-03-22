import React, { createContext, useContext, ReactNode } from 'react';
import { useTournament } from './useTournament';
import { Tournament } from '@/entities/tournament/model/tournament';
import { Player } from '@/entities/player/model/player';

interface TournamentContextType {
  players: Array<{ name: string; rating?: number }>;
  tournament: Tournament | null;
  isFinished: boolean;
  roundResults: string[][];
  addPlayer: (name: string, rating?: string) => void;
  removePlayer: (index: number) => void;
  startTournament: () => void;
  handleResultChange: (roundIndex: number, matchIndex: number, result: string) => void;
  finishRound: (roundIndex: number) => void;
  nextRound: () => boolean;
  finishTournament: () => boolean;
  resetTournament: () => void;
  getSortedPlayers: () => Player[];
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tournamentData = useTournament();
  
  return (
    <TournamentContext.Provider value={tournamentData}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournamentContext = (): TournamentContextType => {
  const context = useContext(TournamentContext);
  
  if (!context) {
    throw new Error('useTournamentContext must be used within a TournamentProvider');
  }
  
  return context;
}; 