import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/shared/components/drawer"
import { Match } from '@/entities/tournament/model/tournament';

interface RoundViewProps {
  roundNumber: number;
  matches: Match[];
  results: string[];
  onResultChange?: (matchIndex: number, result: string) => void;
  isCurrentRound: boolean;
  isFinished: boolean;
}

export const RoundView: React.FC<RoundViewProps> = ({
  roundNumber,
  matches,
  results,
  onResultChange,
  isCurrentRound,
  isFinished
}) => {
  return (
    <div className='mb-4'>
      <h3 className='text-lg font-medium mb-2'>Round {roundNumber}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Player 1</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Pts</TableCell>
            <TableCell>
              <Drawer>
                <DrawerTrigger>Result</DrawerTrigger>
                <DrawerContent>
                  <div className='mx-auto w-full max-w-sm'>
                    <DrawerHeader>
                      <DrawerTitle>The meanings of results</DrawerTitle>
                      <DrawerDescription>
                        <p>In chess, the results are typically represented as follows:</p>
                        <ul>
                          <li>1 - 0 Means that person from the right wins</li>
                          <li>0 - 1 Means that person from the left wins</li>
                          <li>0.5 - 0.5 Means that it was a draw</li>
                        </ul>
                      </DrawerDescription>
                    </DrawerHeader>
                  </div>
                </DrawerContent>
              </Drawer>
            </TableCell>
            <TableCell>Pts</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Player 2</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match, matchIndex) => (
            <TableRow key={matchIndex}>
              <TableCell>{match.player1.name}</TableCell>
              <TableCell>{match.player1Color}</TableCell>
              <TableCell>{match.player1.points}</TableCell>
              <TableCell>
                {match.player2 ? (
                  isCurrentRound && !isFinished ? (
                    <Select onValueChange={(value) => onResultChange?.(matchIndex, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+">1 - 0</SelectItem>
                        <SelectItem value="-">0 - 1</SelectItem>
                        <SelectItem value="=">0.5 - 0.5</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>
                      {results[matchIndex] === '+' 
                        ? `1 - 0` 
                        : results[matchIndex] === '-' 
                          ? `0 - 1` 
                          : '0.5 - 0.5'}
                    </span>
                  )
                ) : (
                  'Bye'
                )}
              </TableCell>
              <TableCell>{match.player2?.points}</TableCell>
              <TableCell>{match.player2Color || ''}</TableCell>
              <TableCell>{match.player2?.name || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 