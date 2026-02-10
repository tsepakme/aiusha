import React, { createContext, useContext, ReactNode } from 'react';
import { useSwiss } from './useSwiss';
import { Tournament, MatchResult } from '@/entities/tournament/model/tournament';
import { Player } from '@/entities/player/model/player';

interface SwissContextType {
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

const SwissContext = createContext<SwissContextType | null>(null);

export const SwissProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tournamentData = useSwiss();
  
  const contextValue: SwissContextType = {
    ...tournamentData,
    getSortedPlayers: () => tournamentData.sortedPlayers || []
  };
  
  return (
    <SwissContext.Provider value={contextValue}>
      {children}
    </SwissContext.Provider>
  );
};

export const useSwissContext = (): SwissContextType => {
  const context = useContext(SwissContext);
  
  if (!context) {
    throw new Error('useSwissContext must be used within a SwissProvider');
  }
  
  return context;
};
