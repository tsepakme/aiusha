import React, { createContext, useContext, ReactNode } from 'react';
import { useRoundRobin } from '@/features/manageRoundRobin/model/useRoundRobin';
import { Tournament } from '@/entities/tournament/model/tournament';
import { Player } from '@/entities/player/model/player';
import { MatchResult } from '@/shared/types/enums';

interface RoundRobinContextType {
  players: Array<{ name: string; rating?: number }>;
  tournament: Tournament | null;
  isFinished: boolean;
  roundResults: (MatchResult | undefined)[][];
  addPlayer: (name: string, rating?: string) => void;
  removePlayer: (index: number) => void;
  editPlayer: (index: number, name: string, rating?: string) => void;
  startTournament: () => void;
  handleResultChange: (roundIndex: number, matchIndex: number, result: MatchResult) => void;
  finishRound: (roundIndex: number) => void;
  nextRound: () => boolean;
  finishTournament: () => boolean;
  resetTournament: () => void;
  getSortedPlayers: () => Player[];
}

const RoundRobinContext = createContext<RoundRobinContextType | null>(null);

export const RoundRobinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const roundRobinData = useRoundRobin();
  
  const contextValue: RoundRobinContextType = {
    ...roundRobinData,
    getSortedPlayers: () => roundRobinData.sortedPlayers || []
  };
  
  return (
    <RoundRobinContext.Provider value={contextValue}>
      {children}
    </RoundRobinContext.Provider>
  );
};

export const useRoundRobinContext = (): RoundRobinContextType => {
  const context = useContext(RoundRobinContext);
  
  if (!context) {
    throw new Error('useRoundRobinContext must be used within a RoundRobinProvider');
  }
  
  return context;
};