import React, { useState, useEffect } from 'react';
import { ThemeProvider } from "@/shared/theme-provider"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "@/shared/components/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"
import { Separator } from "@/shared/components/separator"
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog"
import { ModeToggle } from '@/shared/components/mode-toggle';
import { Tournament } from "@/entities/tournament/model/tournament";
import { runTournament, generateSwissRound, updateResults, calculateRounds } from "@/features/manageTournament/model/manageTournament";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/hover-card"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/shared/components/drawer"
import { toast } from "sonner"

const TournamentPage: React.FC = () => {
  const [players, setPlayers] = useState<{ name: string; rating?: number }[]>(() => {
    const savedPlayers = localStorage.getItem('players');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });
  const [tournament, setTournament] = useState<Tournament | null>(() => {
    const savedTournament = localStorage.getItem('tournament');
    return savedTournament ? JSON.parse(savedTournament) : null;
  });
  const [tournamentData, setTournamentData] = useState(() => {
    const savedTournamentData = localStorage.getItem('tournamentData');
    return savedTournamentData ? JSON.parse(savedTournamentData) : null;
  });
  const [playerName, setPlayerName] = useState('');
  const [playerRating, setPlayerRating] = useState<string>('');
  const [isFinished, setIsFinished] = useState(() => {
    const savedIsFinished = localStorage.getItem('isFinished');
    return savedIsFinished ? JSON.parse(savedIsFinished) : false;
  });
  const [roundResults, setRoundResults] = useState<string[][]>(() => {
    const savedRoundResults = localStorage.getItem('roundResults');
    return savedRoundResults ? JSON.parse(savedRoundResults) : [];
  });

  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('tournament', JSON.stringify(tournament));
  }, [tournament]);

  useEffect(() => {
    localStorage.setItem('isFinished', JSON.stringify(isFinished));
  }, [isFinished]);

  useEffect(() => {
    localStorage.setItem('roundResults', JSON.stringify(roundResults));
  }, [roundResults]);

  useEffect(() => {
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
  }, [tournamentData]);

  const addPlayer = () => {
    setPlayers([...players, { name: playerName, rating: playerRating ? parseInt(playerRating) : undefined }]);
    setPlayerName('');
    setPlayerRating('');
  };

  const startTournament = () => {
    const newTournament = runTournament(players);
    setTournament(newTournament);
    setTournamentData(newTournament);
    setRoundResults(newTournament.rounds.map(() => []));
  };

  const handleResultChange = (roundIndex: number, matchIndex: number, result: string) => {
    const newRoundResults = [...roundResults];
    if (!newRoundResults[roundIndex]) {
      newRoundResults[roundIndex] = [];
    }
    newRoundResults[roundIndex][matchIndex] = result;
    setRoundResults(newRoundResults);
  };

  const finishRound = (roundIndex: number) => {
    if (tournament) {
      const newTournament = { ...tournament };
      const allMatches = newTournament.rounds.flatMap(round => round.matches);
      if (newTournament.rounds[roundIndex]) {
        updateResults(newTournament.rounds[roundIndex].matches, roundResults[roundIndex] || [], newTournament.players, allMatches);
        setTournament(newTournament);
        setTournamentData(newTournament);
      }
    }
  };

  const nextRound = () => {
    if (tournament) {
      if (tournament.rounds.length < calculateRounds(tournament.players.length)) {
        finishRound(tournament.rounds.length - 1);
        const newTournament = { ...tournament };
        const newRoundMatches = generateSwissRound(newTournament.players);
        newTournament.rounds.push({ matches: newRoundMatches });
        setTournament(newTournament);
        setTournamentData(newTournament);
        setRoundResults([...roundResults, []]);

        toast.success('Round finished');
      }
    }
  };

  const finishTournament = () => {
    if (tournament) {
      finishRound(tournament.rounds.length - 1);
      setIsFinished(true);
      setTournamentData({ ...tournament, isFinished: true });
      toast.success('Tournament finished', {
        description: 'The tournament has finished. Go to the "Standings" tab to see the final standings.',
      });
    }
  };

  const startNewTournament = () => {
    setPlayers([]);
    setTournament(null);
    setTournamentData(null);
    setPlayerName('');
    setPlayerRating('');
    setIsFinished(false);
    setRoundResults([]);
    localStorage.removeItem('players');
    localStorage.removeItem('tournament');
    localStorage.removeItem('isFinished');
    localStorage.removeItem('roundResults');
    localStorage.removeItem('tournamentData');
    toast.success('Tournament started', {
      description: 'The tournament has started. Go to the "Rounds" tab to begin.',
    });
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="w-full md:w-1/2 mx-auto">
        <div className='w-full flex justify-between items-top my-5'>
          <div className=''>
            <h1 className='text-lg'>Swiss System Tournament</h1>
            <p className='text-base mt-5'>Ideal for Chess, but adaptable for Go, Checkers, and other games with black and white sides.
              Supports custom points for various games like football, tennis, darts, etc.</p>
          </div>
          <div>
            <ModeToggle />
          </div>
        </div>
        <Tabs defaultValue="players" className="w-full">
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            {!tournament && (
              <div className='flex flex-col gap-2 my-3'>
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
                <Button variant={'secondary'} onClick={addPlayer}>Add Player</Button>
              </div>
            )}

            {players.length > 0 && (
              <Table>
                {/* <TableCaption>Players</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {players.length > 0 && !tournament && (
              <div className='flex flex-col sm:flex-row justify-between gap-2 mt-5'>
                <Button onClick={startTournament}>Start Tournament</Button>
                <DeleteConfirmationDialog onConfirm={startNewTournament} value='Delete all' variant={'destructive'} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="rounds">
            {tournament && (
              <div>
                {
                  tournament.rounds.map((round, roundIndex) => (
                    <div className='' key={roundIndex}>
                      <h3>Round {roundIndex + 1}</h3>
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
                                          <li>1 - 0 Means that person from fre right wins</li>
                                          <li>0 - 1 Means that person from fre left wins</li>
                                          <li>0.5 - 0.5 Means that it was a draw</li>
                                        </ul>
                                      </DrawerDescription>
                                    </DrawerHeader>
                                    <DrawerFooter>
                                      <DrawerClose>
                                        {/* <Button variant="outline">Close</Button> */}
                                      </DrawerClose>
                                    </DrawerFooter>
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
                          {round.matches.map((match, matchIndex) => (
                            <TableRow key={matchIndex}>
                              <TableCell>{match.player1.name}</TableCell>
                              <TableCell>{match.player1Color}</TableCell>
                              <TableCell>{match.player1.points}</TableCell>
                              <TableCell>{match.player2 ? (
                                roundIndex === tournament.rounds.length - 1 && !isFinished ? (
                                  <Select onValueChange={(e) => {
                                    handleResultChange(roundIndex, matchIndex, e)
                                  }}>
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
                                    {roundResults[roundIndex][matchIndex] === '+' ?
                                      `1 - 0` : roundResults[roundIndex][matchIndex] === '-' ?
                                        `0 - 1` : '0.5 - 0.5'}
                                  </span>
                                )
                              ) : (
                                'Bye'
                              )}</TableCell>
                              <TableCell>{match.player2?.points}</TableCell>
                              <TableCell>{match.player2Color || ''}</TableCell>
                              <TableCell>{match.player2?.name || ''}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Separator className='my-4' />
                    </div>
                  ))
                }
                <div className='flex flex-col sm:flex-row justify-between gap-2 mt-5 w-full'>
                  {tournament.rounds.length < calculateRounds(tournament.players.length) && (
                    <Button className='' onClick={nextRound}>Next Round</Button>
                  )}
                  {tournament.rounds.length === calculateRounds(tournament.players.length) && !isFinished && (
                    <Button onClick={finishTournament}>Finish Tournament</Button>
                  )}
                  <DeleteConfirmationDialog onConfirm={startNewTournament} value='Delete all' variant={'destructive'} />
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="standings">
            {tournament && (
              <div>
                <Table>
                  <TableCaption>Final Standings</TableCaption>
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
                          <DrawerTrigger>Buc1</DrawerTrigger>
                          <DrawerContent>
                            <div className='mx-auto w-full max-w-sm'>
                              <DrawerHeader>
                                <DrawerTitle>What is Buc1?</DrawerTitle>
                                <DrawerDescription>
                                  <p>The Buchholz Cut 1 is the Buchholz score reduced by the lowest score of the opponents.</p>
                                  <a className='underline' href='https://chess.stackexchange.com/questions/24915/how-is-buchholz-score-calculated-in-a-swiss-tournament'>How is Buchholz score calculated in a Swiss tournament?</a>
                                </DrawerDescription>
                              </DrawerHeader>
                              <DrawerFooter>
                                <DrawerClose>
                                  {/* <Button variant="outline">Close</Button> */}
                                </DrawerClose>
                              </DrawerFooter>
                            </div>
                          </DrawerContent>
                        </Drawer>
                      </TableCell>
                      <TableCell>
                        <Drawer>
                          <DrawerTrigger>BucT</DrawerTrigger>
                          <DrawerContent>
                            <div className='mx-auto w-full max-w-sm'>
                              <DrawerHeader>
                                <DrawerTitle>What is BucT?</DrawerTitle>
                                <DrawerDescription>
                                  <p>The Buchholz System is the sum of the scores of each of the opponents of a player.</p>
                                  <a className='underline' href='https://chess.stackexchange.com/questions/24915/how-is-buchholz-score-calculated-in-a-swiss-tournament'>How is Buchholz score calculated in a Swiss tournament?</a>
                                </DrawerDescription>
                              </DrawerHeader>
                              <DrawerFooter>
                                <DrawerClose>
                                  {/* <Button variant="outline">Close</Button> */}
                                </DrawerClose>
                              </DrawerFooter>
                            </div>
                          </DrawerContent>
                        </Drawer>
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournament.players
                      .sort((a, b) => b.points - a.points || b.buc1 - a.buc1 || b.bucT - a.bucT)
                      .map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{tournament.players.indexOf(player) + 1}</TableCell>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.rating}</TableCell>
                          <TableCell>{player.points}</TableCell>
                          {tournament.rounds.map((round, roundIndex) => {
                            const match = round.matches.find(m => m.player1.id === player.id || m.player2?.id === player.id);
                            if (match) {
                              const opponent = match.player1.id === player.id ? match.player2 : match.player1;
                              const color = match.player1.id === player.id ? (match.player1Color === 'white' ? 'W' : 'B') : (match.player2Color === 'white' ? 'W' : 'B');
                              const opponentPosition = opponent ? tournament.players.indexOf(opponent) + 1 : '';
                              const result = match.player1.id === player.id ? player.resultHistory?.[roundIndex] : opponent?.resultHistory?.[roundIndex];
                              if (!isFinished) {
                                if (!result) {
                                  return (
                                    <TableCell key={roundIndex}>
                                      <HoverCard>
                                        <HoverCardTrigger>
                                          pending
                                        </HoverCardTrigger>
                                        <HoverCardContent>
                                          results is not yet available
                                        </HoverCardContent>
                                      </HoverCard>
                                    </TableCell>
                                  )
                                }
                                return (
                                  <TableCell key={roundIndex}>
                                    <HoverCard>
                                      <HoverCardTrigger>
                                        {opponent ? `${result}${color}${opponent.name}` : '+'}
                                      </HoverCardTrigger>
                                      {!opponent ? (
                                        <HoverCardContent>
                                          player has a bye
                                        </HoverCardContent>
                                      ) : (
                                        <HoverCardContent>
                                          {match.player1.name} {result === '=' ? '0.5 - 0.5' : result === '+' ? '1 - 0' : '0 - 1'} {match.player2?.name}
                                        </HoverCardContent>
                                      )}
                                    </HoverCard>
                                  </TableCell>
                                );
                              }
                              return (
                                <TableCell key={roundIndex}>
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      {opponent ? `${result}${color}${opponentPosition}` : '+'}
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      {match.player1.name} {result === '=' ? '0.5 - 0.5' : result === '+' ? '1 - 0' : '0 - 1'} {match.player2?.name}
                                    </HoverCardContent>
                                  </HoverCard>
                                </TableCell>
                              );
                            }
                            return <TableCell key={roundIndex}>Bye</TableCell>;
                          })}
                          <TableCell>{player.buc1}</TableCell>
                          <TableCell>{player.bucT}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <DeleteConfirmationDialog onConfirm={startNewTournament} value='Start New Tournament' variant={'default'} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
};

export default TournamentPage;