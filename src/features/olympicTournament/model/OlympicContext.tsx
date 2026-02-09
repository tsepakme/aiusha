import React, { createContext, useContext, ReactNode } from "react";
import { useOlympic } from "./useOlympic";
import type { EliminationBracket } from "@/entities/tournament/model/elimination";
import type { MatchResult } from "@/entities/tournament/model/tournament";
import type { Player } from "@/entities/player/model/player";

export interface OlympicContextType {
  players: Array<{ name: string; rating?: number }>;
  bracket: EliminationBracket | null;
  isFinished: boolean;
  addPlayer: (name: string, rating?: string) => void;
  removePlayer: (index: number) => void;
  editPlayer: (index: number, name: string, rating?: string) => void;
  startBracket: (playersOverride?: Array<{ name: string; rating?: number }>) => void;
  setMatchResult: (
    roundIndex: number,
    matchIndex: number,
    result: MatchResult
  ) => void;
  resetBracket: () => void;
}

const OlympicContext = createContext<OlympicContextType | null>(null);

export const OlympicProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const value = useOlympic();
  return (
    <OlympicContext.Provider value={value}>
      {children}
    </OlympicContext.Provider>
  );
};

export const useOlympicContext = (): OlympicContextType => {
  const ctx = useContext(OlympicContext);
  if (!ctx) {
    throw new Error("useOlympicContext must be used within OlympicProvider");
  }
  return ctx;
};
