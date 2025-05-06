import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";
import { useRoundRobinContext } from '../model/RoundRobinContext';
import { MatchResult } from "@/shared/types/enums";

export const RoundRobinStandingsTab: React.FC = () => {
  const { tournament, resetTournament } = useRoundRobinContext();

  const resultsMap = useMemo(() => {
    if (!tournament) return {};
    
    const results: Record<string, Record<string, MatchResult | undefined>> = {};
    
    tournament.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        if (!match.player2) return;
        
        if (!results[match.player1.id]) {
          results[match.player1.id] = {};
        }
        if (!results[match.player2.id]) {
          results[match.player2.id] = {};
        }
        
        // Set the results from both players' perspectives
        results[match.player1.id][match.player2.id] = match.result;
        if (match.result !== undefined) {
          const oppositeResult = 
            match.result === MatchResult.WIN ? MatchResult.LOSS :
            match.result === MatchResult.LOSS ? MatchResult.WIN :
            MatchResult.DRAW;
          results[match.player2.id][match.player1.id] = oppositeResult;
        }
      });
    });
    
    return results;
  }, [tournament]);

  if (!tournament) {
    return (
      <div className="p-4 text-center">
        <p>No tournament data available. Please start a tournament first.</p>
      </div>
    );
  }

  // Sort players by points
  const sortedPlayers = [...tournament.players].sort((a, b) => b.points - a.points);

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Tournament Standings</h2>
      
      {/* Traditional table view */}
      <div className="mb-8 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell>Name</TableCell>
              {tournament.players.some(p => p.rating) && <TableCell>Rating</TableCell>}
              <TableCell>Points</TableCell>
              {sortedPlayers.map((player, idx) => (
                <TableCell key={player.id}>vs #{idx + 1}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.name}</TableCell>
                {tournament.players.some(p => p.rating) && <TableCell>{player.rating || "-"}</TableCell>}
                <TableCell>{player.points}</TableCell>
                {sortedPlayers.map((opponent) => (
                  <TableCell key={opponent.id}>
                    {player.id === opponent.id ? (
                      "×"
                    ) : resultsMap[player.id]?.[opponent.id] === MatchResult.WIN ? (
                      "1"
                    ) : resultsMap[player.id]?.[opponent.id] === MatchResult.LOSS ? (
                      "0"
                    ) : resultsMap[player.id]?.[opponent.id] === MatchResult.DRAW ? (
                      "½"
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
            
      <div className="mt-8">
        <DeleteConfirmationDialog 
          onConfirm={resetTournament} 
          value='Start New Tournament' 
          variant={'default'} 
        />
      </div>
    </div>
  );
};