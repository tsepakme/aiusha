import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/hover-card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/shared/components/drawer";
import { Player } from '@/entities/player/model/player';
import { Tournament, MatchResult } from '@/entities/tournament/model/tournament';

interface StandingsTableProps {
  tournament: Tournament;
  isFinished: boolean;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  tournament,
  isFinished
}) => {
  const sortedPlayers = [...tournament.players].sort(
    (a, b) => b.points - a.points || b.buc1 - a.buc1 || b.bucT - a.bucT
  );

  const getResultDisplay = (
    opponent: Player | undefined, 
    result: MatchResult | undefined, 
    color: string, 
    opponentPosition: number
  ) => {
    if (!opponent) return MatchResult.WIN;
    
    const displayColor = color === 'white' ? 'W' : 'B';
    if (isFinished) {
      return `${result}${displayColor}${opponentPosition}`;
    } else {
      return `${result}${displayColor}${opponent.name}`;
    }
  };

  const getPlayerResult = (matchResult: MatchResult | undefined, isPlayer1: boolean): MatchResult | undefined => {
    if (matchResult === undefined) return undefined;
    
    if (matchResult === MatchResult.DRAW) return MatchResult.DRAW;
    
    if (isPlayer1) {
      return matchResult;
    } else {
      return matchResult === MatchResult.WIN ? MatchResult.LOSS : MatchResult.WIN;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Pos</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Rating</TableCell>
          <TableCell>Points</TableCell>
          {tournament.rounds.map((_, roundIndex) => (
            <TableCell key={roundIndex}>Round {roundIndex + 1}</TableCell>
          ))}
          <TableCell>
            <Drawer>
              <DrawerTrigger aria-label='Buchholz Cut 1 score'>Buc1</DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-sm'>
                  <DrawerHeader>
                    <DrawerTitle>What is Buc1?</DrawerTitle>
                    <DrawerDescription>
                      <p>The Buchholz Cut 1 is the Buchholz score reduced by the lowest score of the opponents.</p>
                      <a className='underline' href='https://chess.stackexchange.com/questions/24915/how-is-buchholz-score-calculated-in-a-swiss-tournament'>
                        How is Buchholz score calculated in a Swiss tournament?
                      </a>
                    </DrawerDescription>
                  </DrawerHeader>
                </div>
              </DrawerContent>
            </Drawer>
          </TableCell>
          <TableCell>
            <Drawer>
              <DrawerTrigger aria-label='Buchholz System score'>BucT</DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-sm'>
                  <DrawerHeader>
                    <DrawerTitle>What is BucT?</DrawerTitle>
                    <DrawerDescription>
                      <p>The Buchholz System is the sum of the scores of each of the opponents of a player.</p>
                      <a className='underline' href='https://chess.stackexchange.com/questions/24915/how-is-buchholz-score-calculated-in-a-swiss-tournament'>
                        How is Buchholz score calculated in a Swiss tournament?
                      </a>
                    </DrawerDescription>
                  </DrawerHeader>
                </div>
              </DrawerContent>
            </Drawer>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPlayers.map((player, index) => (
          <TableRow key={player.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{player.name}</TableCell>
            <TableCell>{player.rating}</TableCell>
            <TableCell>{player.points}</TableCell>
            
            {tournament.rounds.map((round, roundIndex) => {
              const match = round.matches.find(
                m => m.player1.id === player.id || m.player2?.id === player.id
              );
              
              if (!match) {
                return <TableCell key={roundIndex}>Bye</TableCell>;
              }
              
              const isPlayer1 = match.player1.id === player.id;
              const opponent = isPlayer1 ? match.player2 : match.player1;
              const color = isPlayer1 
                ? match.player1Color 
                : (match.player2Color || 'white');
              const opponentPosition = opponent 
                ? sortedPlayers.findIndex(p => p.id === opponent.id) + 1 
                : 0;
              
              const matchResult = match.player1.resultHistory?.[roundIndex];
              
              const playerResult = getPlayerResult(matchResult as MatchResult, isPlayer1);
              
              if (!playerResult) {
                return (
                  <TableCell key={roundIndex}>
                    <HoverCard>
                      <HoverCardTrigger>pending</HoverCardTrigger>
                      <HoverCardContent>
                        results is not yet available
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                );
              }
              
              const resultDisplay = getResultDisplay(
                opponent, 
                playerResult, 
                color, 
                opponentPosition
              );
              
              const matchDisplayText = matchResult === MatchResult.DRAW 
                ? '0.5 - 0.5' 
                : matchResult === MatchResult.WIN 
                  ? '1 - 0' 
                  : '0 - 1';
              
              return (
                <TableCell key={roundIndex}>
                  <HoverCard>
                    <HoverCardTrigger>{resultDisplay}</HoverCardTrigger>
                    {!opponent ? (
                      <HoverCardContent>player has a bye</HoverCardContent>
                    ) : (
                      <HoverCardContent>
                        {match.player1.name} {matchDisplayText} {match.player2?.name}
                      </HoverCardContent>
                    )}
                  </HoverCard>
                </TableCell>
              );
            })}
            
            <TableCell>{player.buc1}</TableCell>
            <TableCell>{player.bucT}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};