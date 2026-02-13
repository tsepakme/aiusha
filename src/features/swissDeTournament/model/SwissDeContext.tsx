import React, { createContext, useContext, ReactNode } from "react";
import { useSwissDe } from "./useSwissDe";
import type { SwissDETeam, SwissDERound, DEBracket } from "@/entities/tournament/model/swissDe";

export interface SwissDeContextType {
  players: Array<{ name: string; rating?: number }>;
  teams: SwissDETeam[] | null;
  swissRounds: SwissDERound[];
  swissResults: ("team1" | "team2" | null)[][];
  playoffBracket: DEBracket | null;
  phase: "setup" | "swiss" | "playoff" | "finished";
  canStartPlayoff: boolean;
  champion: SwissDETeam | null;
  addPlayer: (name: string, rating?: string) => void;
  removePlayer: (index: number) => void;
  editPlayer: (index: number, name: string, rating?: string) => void;
  startTournament: (playersOverride?: Array<{ name: string; rating?: number }>) => void;
  setSwissResult: (roundIndex: number, matchIndex: number, result: "team1" | "team2") => void;
  completeSwissRound: (roundIndex: number) => void;
  startPlayoff: () => void;
  setPlayoffMatchResult: (
    location:
      | { roundKind: "winner"; roundIndex: number; matchIndex: number }
      | { roundKind: "loser"; roundIndex: number; matchIndex: number }
      | { roundKind: "grandFinal" },
    result: "team1" | "team2"
  ) => void;
  resetTournament: () => void;
  validateParticipantCount: (n: number) => { valid: boolean; message?: string };
}

const SwissDeContext = createContext<SwissDeContextType | null>(null);

export const SwissDeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const value = useSwissDe();
  return (
    <SwissDeContext.Provider value={value}>
      {children}
    </SwissDeContext.Provider>
  );
};

export const useSwissDeContext = (): SwissDeContextType => {
  const ctx = useContext(SwissDeContext);
  if (!ctx) {
    throw new Error("useSwissDeContext must be used within SwissDeProvider");
  }
  return ctx;
};
