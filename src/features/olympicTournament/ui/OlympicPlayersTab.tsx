import React from "react";
import { PlayerForm } from "@/features/addPlayer/ui/PlayerForm";
import { PlayersList } from "@/entities/tournament/ui/PlayersList";
import { useOlympicContext } from "../model/OlympicContext";
import { toast } from "sonner";

export const OlympicPlayersTab: React.FC = () => {
  const {
    players,
    bracket,
    addPlayer,
    removePlayer,
    editPlayer,
    startBracket,
    resetBracket,
  } = useOlympicContext();

  const handleEditPlayer = (index: number, name: string, rating?: string) => {
    editPlayer(index, name, rating);
    toast.success("Player updated");
  };

  const handleRemovePlayer = (index: number) => {
    removePlayer(index);
    toast.success("Player removed");
  };

  return (
    <div>
      {!bracket && (
        <PlayerForm
          onAddPlayer={addPlayer}
          disabled={!!bracket}
        />
      )}

      <PlayersList
        players={players}
        isTournamentActive={!!bracket}
        onRemovePlayer={!bracket ? handleRemovePlayer : undefined}
        onEditPlayer={!bracket ? handleEditPlayer : undefined}
        onStartTournament={
          players.length >= 2 ? () => startBracket(players) : undefined
        }
        onResetPlayers={resetBracket}
      />
    </div>
  );
};
