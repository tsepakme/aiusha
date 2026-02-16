import React, { createContext, useContext, ReactNode } from "react";
import { useRoundRobin } from "./useRoundRobin";
import type {
  RoundRobinTeam,
  RoundRobinTeamBase,
  Round,
  MatchResult,
  PointsConfig,
} from "@/entities/tournament/model/roundRobin";

export interface RoundRobinContextType {
  players: Array<{ name: string; rating?: number }>;
  initialTeams: RoundRobinTeamBase[] | null;
  rounds: Round[] | null;
  results: Record<number, Record<number, MatchResult>>;
  confirmedRounds: number[];
  teamsWithStats: RoundRobinTeam[];
  standings: RoundRobinTeam[];
  phase: "setup" | "playing" | "finished";
  isComplete: boolean;
  champion: RoundRobinTeam | null;
  config: PointsConfig;
  addPlayer: (name: string, rating?: string) => void;
  removePlayer: (index: number) => void;
  editPlayer: (index: number, name: string, rating?: string) => void;
  startTournament: (playersOverride?: Array<{ name: string; rating?: number }>) => void;
  setResult: (roundIndex: number, matchIndex: number, result: MatchResult) => void;
  confirmRound: (roundIndex: number) => void;
  resetTournament: () => void;
  isRoundConfirmed: (roundIndex: number) => boolean;
  validateParticipantCount: (n: number) => { valid: boolean; message?: string };
}

const RoundRobinContext = createContext<RoundRobinContextType | null>(null);

export const RoundRobinProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const value = useRoundRobin();
  return (
    <RoundRobinContext.Provider value={value}>
      {children}
    </RoundRobinContext.Provider>
  );
};

export const useRoundRobinContext = (): RoundRobinContextType => {
  const ctx = useContext(RoundRobinContext);
  if (!ctx) throw new Error("useRoundRobinContext must be used within RoundRobinProvider");
  return ctx;
};
