import React, { createContext, useContext, ReactNode } from 'react';
import { useTournament } from './useTournament';
import { Tournament, MatchResult } from '@/entities/tournament/model/tournament';
import { Player } from '@/entities/player/model/player';

interface TournamentContextType {
  players: Array<{ name: string; rating?: number }>;
  tournament: Tournament | null;
  isFinished: boolean;
  roundResults: (MatchResult | undefined)[][];
  addPlayer: (name: string, rating?: string) => void;
  removePlayer: (index: number) => void;
  editPlayer: (index: number, name: string, rating?: string) => void;
  startTournament: (playersOverride?: Array<{ name: string; rating?: number }>) => void;
  handleResultChange: (roundIndex: number, matchIndex: number, result: MatchResult) => void;
  finishRound: (roundIndex: number) => void;
  nextRound: () => boolean;
  finishTournament: () => boolean;
  resetTournament: () => void;
  getSortedPlayers: () => Player[];
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tournamentData = useTournament();
  
  const contextValue: TournamentContextType = {
    ...tournamentData,
    getSortedPlayers: () => tournamentData.sortedPlayers || []
  };
  
  return (
    <TournamentContext.Provider value={contextValue}>
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