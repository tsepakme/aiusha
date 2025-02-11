import React, { useState } from 'react';
import { ThemeProvider } from "@/shared/theme-provider"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"

import { ModeToggle } from '@/shared/components/mode-toggle';
import { Player } from "@/entities/player/model/player";
import { Tournament, Match } from "@/entities/tournament/model/tournament";
import { initializePlayers } from "@/features/addPlayer/model/addPlayer";
import { runTournament, generateSwissRound, updateResults, calculateRounds } from "@/features/manageTournament/model/manageTournament";

const SwissTournament: React.FC = () => {
  const [players, setPlayers] = useState<{ name: string; rating?: number }[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerRating, setPlayerRating] = useState<string>('');
  const [isFinished, setIsFinished] = useState(false);
  const [roundResults, setRoundResults] = useState<number[][]>([]);

  const addPlayer = () => {
    setPlayers([...players, { name: playerName, rating: playerRating ? parseInt(playerRating) : undefined }]);
    setPlayerName('');
    setPlayerRating('');
  };

  const startTournament = () => {
    const newTournament = runTournament(players);
    setTournament(newTournament);
    setRoundResults(newTournament.rounds.map(() => []));
  };

  const handleResultChange = (roundIndex: number, matchIndex: number, result: number) => {
    const newRoundResults = [...roundResults];
    newRoundResults[roundIndex][matchIndex] = result;
    setRoundResults(newRoundResults);
  };

  const finishRound = (roundIndex: number) => {
    if (tournament) {
      const newTournament = { ...tournament };
      updateResults(newTournament.rounds[roundIndex].matches, roundResults[roundIndex]);
      setTournament(newTournament);
    }
  };

  const nextRound = () => {
    if (tournament) {
      const currentRoundResults = roundResults[tournament.rounds.length - 1];
      const allResultsEntered = currentRoundResults.every(result => result !== undefined && result !== null);

      if (!allResultsEntered) {
        alert('Please enter all results before proceeding to the next round.');
        return;
      }

      if (tournament.rounds.length < calculateRounds(tournament.players.length)) {
        finishRound(tournament.rounds.length - 1);
        const newTournament = { ...tournament };
        const newRoundMatches = generateSwissRound(newTournament.players);
        newTournament.rounds.push({ matches: newRoundMatches });
        setTournament(newTournament);
        setRoundResults([...roundResults, []]);
      }
    }
  };

  const finishTournament = () => {
    finishRound(tournament!.rounds.length - 1);
    setIsFinished(true);
  };

  const startNewTournament = () => {
    setPlayers([]);
    setTournament(null);
    setPlayerName('');
    setPlayerRating('');
    setIsFinished(false);
    setRoundResults([]);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="w-full md:w-1/2 mx-auto">
        <div className='w-full flex justify-between items-top'>
          <div className=''>
            <h1 className='text-lg'>Swiss System Tournament</h1>
            <p className='text-base mt-5'>Ideal for Chess, but adaptable for Go, Checkers, and other games with black and white sides.
              Supports custom points for various games like football, tennis, darts, etc.</p>
          </div>
          <div>
            <ModeToggle />
          </div>
        </div>
        <Tabs defaultValue="players" className="w-full mt-5">
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            {!tournament && (
              <div className='flex flex-col gap-2'>
                <h2>Add Players</h2>
                <Input
                  type="text"
                  placeholder="Player Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Player Rating (optional)"
                  value={playerRating}
                  onChange={(e) => setPlayerRating(e.target.value)}
                />
                <Button onClick={addPlayer}>Add Player</Button>
              </div>
            )}

            {players.length > 0 && (
              <Table>
                <TableCaption>Players</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {tournament && (
              <p className='mt-10'>The draw has taken place. Go to the 'Rounds' tab.</p>
            )}

            {players.length > 0 && !tournament && (
              <Button onClick={startTournament}>Start Tournament</Button>
            )}
          </TabsContent>
          <TabsContent value="rounds">
            {tournament && (
              <div>
                {
                  tournament.rounds.map((round, roundIndex) => (
                    <div className='mb-5' key={roundIndex}>
                      <h3>Round {roundIndex + 1}</h3>
                      <ul>
                        {round.matches.map((match, matchIndex) => (
                          <li key={matchIndex}>
                            {match.player1.name} ({match.player1Color}) vs {match.player2?.name || 'Bye'} ({match.player2Color || 'N/A'}) -{' '}
                            {match.player2 ? (
                              <Select onValueChange={(e) => {
                                handleResultChange(roundIndex, matchIndex, parseInt(e))
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select result" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">{match.player1.name} Wins</SelectItem>
                                  <SelectItem value="-1">{match.player2?.name} Wins</SelectItem>
                                  <SelectItem value="0">Draw</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              'Win by default'
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                }

                {tournament.rounds.length < calculateRounds(tournament.players.length) && (
                  <Button onClick={nextRound}>Next Round</Button>
                )}

                {tournament.rounds.length === calculateRounds(tournament.players.length) && !isFinished && (
                  <Button onClick={finishTournament}>Finish Tournament</Button>
                )}

                {isFinished && (
                  <p>The tournament has finished. Go to the 'Standings' tab to see the final standings.</p>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="standings">
            {tournament && isFinished && (
              <div>
                <Table>
                  <TableCaption>Final Standings</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Points</TableCell>
                      <TableCell>Buchholz T</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournament.players
                      .sort((a, b) => b.points - a.points || b.buchholzT - a.buchholzT)
                      .map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.points}</TableCell>
                          <TableCell>{player.buchholzT}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <Button onClick={startNewTournament}>Start New Tournament</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
};

export default SwissTournament;