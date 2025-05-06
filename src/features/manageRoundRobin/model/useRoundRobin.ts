import { useMemo } from 'react';
import { Tournament } from "@/entities/tournament/model/tournament";
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { toast } from 'sonner';
import { MatchResult, PlayerColor } from "@/shared/types/enums";
import { Player } from '@/entities/player/model/player';
import { initializePlayers } from '@/features/addPlayer/model/addPlayer';

type PlayerInput = { name: string; rating?: number };

export const useRoundRobin = () => {
  const [players, setPlayers, removePlayers] = useLocalStorage<PlayerInput[]>('rr-players', []);
  const [tournament, setTournament, removeTournament] = useLocalStorage<Tournament | null>('rr-tournament', null);
  const [isFinished, setIsFinished, removeIsFinished] = useLocalStorage<boolean>('rr-isFinished', false);
  const [roundResults, setRoundResults, removeRoundResults] = useLocalStorage<(MatchResult | undefined)[][]>('rr-roundResults', []);

  const addPlayer = (name: string, rating?: string) => {
    if (!name.trim()) return false;
    
    setPlayers([...players, { 
      name: name.trim(), 
      rating: rating ? parseInt(rating) : undefined 
    }]);
    return true;
  };

  const removePlayer = (index: number) => {
    if (index < 0 || index >= players.length) return false;

    setPlayers(players.filter((_, i) => i !== index));
    return true;
  };
  
  const editPlayer = (index: number, name: string, rating?: string) => {
    if (index < 0 || index >= players.length) return false;
    if (!name.trim()) return false;
    
    const newPlayers = [...players];
    newPlayers[index] = {
      name: name.trim(),
      rating: rating ? parseInt(rating, 10) : undefined
    };
    setPlayers(newPlayers);
    return true;
  };

  const generateRoundRobinSchedule = (players: Player[]): Tournament => {
    const numPlayers = players.length;
    const rounds = [];
    const numRounds = numPlayers % 2 === 0 ? numPlayers - 1 : numPlayers;
    
    // For odd number of players, add a dummy player (bye)
    const actualPlayers = [...players];
    if (numPlayers % 2 !== 0) {
      actualPlayers.push({
        id: -1,
        name: 'BYE',
        points: 0,
        buc1: 0,
        bucT: 0,
        opponents: [],
        colorHistory: [],
        resultHistory: [],
        result: undefined
      });
    }
    
    const n = actualPlayers.length;
    
    // Create rounds
    for (let round = 0; round < numRounds; round++) {
      const matches = [];
      
      for (let i = 0; i < n / 2; i++) {
        const player1Index = i;
        const player2Index = n - 1 - i;
        
        // Skip matches involving the dummy player
        if (actualPlayers[player1Index].id !== -1 && actualPlayers[player2Index].id !== -1) {
          const player1Color = round % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK;
          const player2Color = player1Color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
          
          matches.push({
            player1: actualPlayers[player1Index],
            player2: actualPlayers[player2Index],
            player1Color,
            player2Color,
            result: undefined
          });
          
          // Update player data
          actualPlayers[player1Index].opponents.push(actualPlayers[player2Index].id);
          actualPlayers[player2Index].opponents.push(actualPlayers[player1Index].id);
          actualPlayers[player1Index].colorHistory.push(player1Color);
          actualPlayers[player2Index].colorHistory.push(player2Color);
        }
      }
      
      rounds.push({ matches });
      
      // Rotate players for the next round (keeping first player fixed)
      const lastPlayer = actualPlayers[n - 1];
      for (let i = n - 1; i > 1; i--) {
        actualPlayers[i] = actualPlayers[i - 1];
      }
      actualPlayers[1] = lastPlayer;
    }
    
    // Remove dummy player if it was added
    const finalPlayers = players.map(p => {
      const updatedPlayer = { ...p };
      // Remove any references to the dummy player
      updatedPlayer.opponents = updatedPlayer.opponents.filter(id => id !== -1);
      return updatedPlayer;
    });
    
    return {
      players: finalPlayers,
      rounds
    };
  };

  const startTournament = () => {
    if (players.length < 2) return false;
    
    const initializedPlayers = initializePlayers(players);
    const newTournament = generateRoundRobinSchedule(initializedPlayers);
    setTournament(newTournament);
    setRoundResults(newTournament.rounds.map(() => []));
    return true;
  };

  const handleResultChange = (roundIndex: number, matchIndex: number, result: MatchResult) => {
    setRoundResults(prevResults => {
      const newResults = [...prevResults];
      if (!newResults[roundIndex]) {
        newResults[roundIndex] = [];
      }
      newResults[roundIndex][matchIndex] = result;
      return newResults;
    });
  };

  const updateResults = (tournament: Tournament, roundIndex: number, results: (MatchResult | undefined)[]): Tournament => {
    const updatedTournament = { ...tournament };
    const round = updatedTournament.rounds[roundIndex];
    
    round.matches.forEach((match, index) => {
      const result = results[index];
      match.result = result;
      
      if (result === MatchResult.WIN) {
        match.player1.points += 1;
        match.player1.resultHistory.push(MatchResult.WIN);
        if (match.player2) {
          match.player2.resultHistory.push(MatchResult.LOSS);
        }
      } else if (result === MatchResult.LOSS) {
        if (match.player2) {
          match.player2.points += 1;
          match.player2.resultHistory.push(MatchResult.WIN);
          match.player1.resultHistory.push(MatchResult.LOSS);
        }
      } else if (result === MatchResult.DRAW) {
        if (match.player2) {
          match.player1.points += 0.5;
          match.player2.points += 0.5;
          match.player1.resultHistory.push(MatchResult.DRAW);
          match.player2.resultHistory.push(MatchResult.DRAW);
        }
      }
    });
    
    return updatedTournament;
  };

  const finishRound = (roundIndex: number) => {
    if (!tournament) return false;

    const updatedTournament = updateResults(
      tournament,
      roundIndex,
      roundResults[roundIndex] || []
    );
    
    setTournament(updatedTournament);
    return true;
  };

  const nextRound = () => {
    if (!tournament) return false;
    
    finishRound(tournament.currentRound || 0);
    
    const updatedTournament = { ...tournament };
    updatedTournament.currentRound = (tournament.currentRound || 0) + 1;
    
    setTournament(updatedTournament);
    return true;
  };

  const finishTournament = () => {
    if (!tournament) return false;
    
    finishRound(tournament.currentRound || tournament.rounds.length - 1);
    setIsFinished(true);
    return true;
  };

  const resetTournament = () => {
    try {
      removePlayers();
      removeTournament();
      removeIsFinished();
      removeRoundResults();
      setPlayers([]);
      setTournament(null);
      setIsFinished(false);
      setRoundResults([]);
      toast.success('Tournament data reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting tournament data:', error);
      toast.error('Failed to reset tournament data');
      return false;
    }
  };

  const sortedPlayers = useMemo(() => {
    if (!tournament) return [];
    
    return [...tournament.players].sort(
      (a, b) => b.points - a.points
    );
  }, [tournament]);
  
  return {
    players,
    tournament,
    isFinished,
    roundResults,
    sortedPlayers,
    addPlayer,
    removePlayer,
    editPlayer,
    startTournament,
    handleResultChange,
    finishRound,
    nextRound,
    finishTournament,
    resetTournament
  };
};