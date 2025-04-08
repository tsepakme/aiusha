import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { Edit, Save, Trash, X } from 'lucide-react';

type PlayerInput = { name: string; rating?: number };

interface PlayersListProps {
  players: PlayerInput[];
  onRemovePlayer?: (index: number) => void;
  onEditPlayer?: (index: number, name: string, rating?: string) => void;
  onStartTournament?: () => void;
  onResetPlayers?: () => void;
  isTournamentActive: boolean;
}

export const PlayersList: React.FC<PlayersListProps> = ({
  players,
  onRemovePlayer,
  onEditPlayer,
  onStartTournament,
  onResetPlayers,
  isTournamentActive
}) => {
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editRating, setEditRating] = useState('');

  const handleEditClick = (index: number) => {
    setEditingPlayerIndex(index);
    setEditName(players[index].name);
    setEditRating(players[index].rating?.toString() || '');
  };

  const handleCancelEdit = () => {
    setEditingPlayerIndex(null);
  };

  const handleSaveEdit = (index: number) => {
    if (onEditPlayer) {
      onEditPlayer(index, editName, editRating);
      setEditingPlayerIndex(null);
    }
  };

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
            {!isTournamentActive && (onRemovePlayer || onEditPlayer) && (
              <TableCell>Actions</TableCell>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>

              {editingPlayerIndex === index ? (
                <>
                  <TableCell>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={editRating}
                      onChange={(e) => setEditRating(e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveEdit(index)}
                        disabled={!editName.trim()}
                      >
                        <Save className="h-4 w-4 mr-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-1" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.rating}</TableCell>
                  {!isTournamentActive && (onRemovePlayer || onEditPlayer) && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {onEditPlayer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(index)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                          </Button>
                        )}
                        {onRemovePlayer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemovePlayer(index)}
                          >
                            <Trash />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </>
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