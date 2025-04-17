import { useMemo } from 'react';
import { Tournament, MatchResult } from "@/entities/tournament/model/tournament";
import { runTournament, generateSwissRound, updateResults, calculateRounds } from "./manageTournament";
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { toast } from 'sonner';

type PlayerInput = { name: string; rating?: number };

export const useTournament = () => {
  const [players, setPlayers, removePlayers] = useLocalStorage<PlayerInput[]>('players', []);
  const [tournament, setTournament, removeTournament] = useLocalStorage<Tournament | null>('tournament', null);
  const [isFinished, setIsFinished, removeIsFinished] = useLocalStorage<boolean>('isFinished', false);
  const [roundResults, setRoundResults, removeRoundResults] = useLocalStorage<(MatchResult | undefined)[][]>('roundResults', []);

  const addPlayer = (name: string, rating?: string) => {
    if (!name.trim()) return false;
    
    setPlayers([...players, { 
      name: name.trim(), 
      rating: rating ? parseInt(rating) : undefined 
    }]);
    return true;
  };

  const removePlayer = (index: number) => {
    if (index < 0 || index >= players.length) return false

    setPlayers(players.filter((_, i) => i !== index))
    return true
  }
  
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

  const startTournament = () => {
    if (players.length < 2) return false;
    
    const newTournament = runTournament(players);
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

  const finishRound = (roundIndex: number) => {
    if (!tournament) return false;

    const newTournament = { ...tournament };
    const allMatches = newTournament.rounds.flatMap(round => round.matches);
    
    if (newTournament.rounds[roundIndex]) {
      updateResults(
        newTournament.rounds[roundIndex].matches, 
        roundResults[roundIndex] || [], 
        newTournament.players, 
        allMatches
      );
      setTournament(newTournament);
      return true;
    }
    
    return false;
  };

  const nextRound = () => {
    if (!tournament) return false;
    
    if (tournament.rounds.length < calculateRounds(tournament.players.length)) {
      finishRound(tournament.rounds.length - 1);
      
      const newTournament = { ...tournament };
      const newRoundMatches = generateSwissRound(newTournament.players);
      newTournament.rounds.push({ matches: newRoundMatches });
      setTournament(newTournament);
      setRoundResults([...roundResults, []]);
      return true;
    }
    
    return false;
  };

  const finishTournament = () => {
    if (!tournament) return false;
    
    finishRound(tournament.rounds.length - 1);
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
      (a, b) => b.points - a.points || b.buc1 - a.buc1 || b.bucT - a.bucT
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