import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table"
import { Button } from "@/shared/components/button"
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog"

type PlayerInput = { name: string; rating?: number };

interface PlayersListProps {
  players: PlayerInput[];
  onRemovePlayer?: (index: number) => void;
  onStartTournament?: () => void;
  onResetPlayers?: () => void;
  isTournamentActive: boolean;
}

export const PlayersList: React.FC<PlayersListProps> = ({
  players,
  onRemovePlayer,
  onStartTournament,
  onResetPlayers,
  isTournamentActive
}) => {
  if (players.length === 0) {
    return <p className="text-center py-4">No players added yet.</p>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Rating</TableCell>
            {!isTournamentActive && onRemovePlayer && (
              <TableCell>Actions</TableCell>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.rating}</TableCell>
              {!isTournamentActive && onRemovePlayer && (
                <TableCell>
                  <Button 
                    variant="ghost" 
                    onClick={() => onRemovePlayer(index)}
                    size="sm"
                  >
                    Remove
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!isTournamentActive && players.length > 0 && (
        <div className='flex flex-col sm:flex-row justify-between gap-2 mt-5'>
          {onStartTournament && (
            <Button onClick={onStartTournament}>Start Tournament</Button>
          )}
          {onResetPlayers && (
            <DeleteConfirmationDialog 
              onConfirm={onResetPlayers} 
              value='Delete all' 
              variant={'destructive'} 
            />
          )}
        </div>
      )}
    </div>
  );
}; 