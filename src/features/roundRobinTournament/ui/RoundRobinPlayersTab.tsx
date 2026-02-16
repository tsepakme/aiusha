import React from "react";
import { PlayerForm } from "@/features/addPlayer/ui/PlayerForm";
import { PlayersList } from "@/entities/tournament/ui/PlayersList";
import { useRoundRobinContext } from "../model/RoundRobinContext";
import { toast } from "sonner";

const MIN_PLAYERS = 3;

export const RoundRobinPlayersTab: React.FC = () => {
  const {
    players,
    phase,
    addPlayer,
    removePlayer,
    editPlayer,
    startTournament,
    resetTournament,
    validateParticipantCount,
  } = useRoundRobinContext();

  const isActive = phase !== "setup";
  const validation = validateParticipantCount(players.length);
  const canStart = validation.valid && players.length >= MIN_PLAYERS;

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
      {!isActive && <PlayerForm onAddPlayer={addPlayer} disabled={isActive} />}
      {!validation.valid && players.length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-2" role="status">
          {validation.message} (minimum {MIN_PLAYERS} participants)
        </p>
      )}
      <PlayersList
        players={players}
        isTournamentActive={isActive}
        onRemovePlayer={!isActive ? handleRemovePlayer : undefined}
        onEditPlayer={!isActive ? handleEditPlayer : undefined}
        onStartTournament={
          !isActive && canStart ? () => startTournament(players) : undefined
        }
        onResetPlayers={resetTournament}
      />
    </div>
  );
};
