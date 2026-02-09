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
    return <p className="text-center py-4" role="status">No players added yet.</p>;
  }

  return (
    <div>
      <Table aria-label="Players list" aria-describedby="players-description">
        <caption className="sr-only" id="players-description">
          Table of registered players with their names and ratings
        </caption>
        <TableHeader>
          <TableRow>
            <TableCell scope="col">#</TableCell>
            <TableCell scope="col">Name</TableCell>
            <TableCell scope="col">Rating</TableCell>
            {!isTournamentActive && (onRemovePlayer || onEditPlayer) && (
              <TableCell scope="col">Actions</TableCell>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <TableRow key={index}>
              <TableCell scope="row">{index + 1}</TableCell>

              {editingPlayerIndex === index ? (
                <>
                  <TableCell>
                    <Input
                      id={`edit-player-name-${index}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      aria-label="Edit player name"
                      aria-describedby={`edit-player-name-help-${index}`}
                      aria-required="true"
                    />
                    <span id={`edit-player-name-help-${index}`} className="sr-only">
                      Enter the player's name
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      id={`edit-player-rating-${index}`}
                      type="number"
                      value={editRating}
                      onChange={(e) => setEditRating(e.target.value)}
                      aria-label="Edit player rating"
                      aria-describedby={`edit-player-rating-help-${index}`}
                    />
                    <span id={`edit-player-rating-help-${index}`} className="sr-only">
                      Enter the player's rating (optional)
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2" role="group" aria-label="Edit actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveEdit(index)}
                        disabled={!editName.trim()}
                        aria-label={`Save changes for player ${player.name}`}
                      >
                        <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span className="sr-only">Save</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span className="sr-only">Cancel</span>
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.rating || 'Not set'}</TableCell>
                  {!isTournamentActive && (onRemovePlayer || onEditPlayer) && (
                    <TableCell>
                      <div className="flex space-x-2" role="group" aria-label={`Actions for player ${player.name}`}>
                        {onEditPlayer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(index)}
                            aria-label={`Edit player ${player.name}`}
                          >
                            <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        {onRemovePlayer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemovePlayer(index)}
                            aria-label={`Remove player ${player.name}`}
                          >
                            <Trash aria-hidden="true" />
                            <span className="sr-only">Remove</span>
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
        <div
          className='flex flex-col sm:flex-row justify-between gap-2 mt-5'
          role="group"
          aria-label="Tournament actions"
        >
          {onStartTournament && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStartTournament();
              }}
              aria-label="Start tournament with current players"
            >
              Start Tournament
            </Button>
          )}
          {onResetPlayers && (
            <DeleteConfirmationDialog
              onConfirm={onResetPlayers}
              value='Delete all'
              variant={'destructive'}
              aria-label="Delete all players"
            />
          )}
        </div>
      )}
    </div>
  );
};