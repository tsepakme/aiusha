import React from "react";
import { PlayerForm } from "@/features/addPlayer/ui/PlayerForm";
import { PlayersList } from "@/entities/tournament/ui/PlayersList";
import { useSwissDeContext } from "../model/SwissDeContext";
import { toast } from "sonner";
import { SWISS_CONFIG } from "@/entities/tournament/model/swissDe";

export const SwissDePlayersTab: React.FC = () => {
  const {
    players,
    phase,
    addPlayer,
    removePlayer,
    editPlayer,
    startTournament,
    resetTournament,
    validateParticipantCount,
  } = useSwissDeContext();

  const isActive = phase !== "setup";
  const validation = validateParticipantCount(players.length);
  const canStart = validation.valid && players.length >= SWISS_CONFIG.minParticipants;

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
      {!isActive && (
        <PlayerForm onAddPlayer={addPlayer} disabled={isActive} />
      )}

      {!validation.valid && players.length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-2" role="status">
          {validation.message} (use {SWISS_CONFIG.minParticipants}, 16, 32, …)
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
