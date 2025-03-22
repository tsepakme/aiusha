import { useState, useEffect } from 'react';
import { Tournament } from "@/entities/tournament/model/tournament";
import { runTournament, generateSwissRound, updateResults, calculateRounds } from "./manageTournament";

type PlayerInput = { name: string; rating?: number };
type TournamentState = Tournament | null;
type RoundResultsState = string[][];

export const useTournament = () => {
  const [players, setPlayers] = useState<PlayerInput[]>(() => {
    try {
      const saved = localStorage.getItem('players');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [tournament, setTournament] = useState<TournamentState>(() => {
    try {
      const saved = localStorage.getItem('tournament');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [isFinished, setIsFinished] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('isFinished');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  
  const [roundResults, setRoundResults] = useState<RoundResultsState>(() => {
    try {
      const saved = localStorage.getItem('roundResults');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('players', JSON.stringify(players));
    } catch {
      console.error('Failed to save players to localStorage');
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem('tournament', JSON.stringify(tournament));
    } catch {
      console.error('Failed to save tournament to localStorage');
    }
  }, [tournament]);

  useEffect(() => {
    try {
      localStorage.setItem('isFinished', JSON.stringify(isFinished));
    } catch {
      console.error('Failed to save isFinished state to localStorage');
    }
  }, [isFinished]);

  useEffect(() => {
    try {
      localStorage.setItem('roundResults', JSON.stringify(roundResults));
    } catch {
      console.error('Failed to save roundResults to localStorage');
    }
  }, [roundResults]);

  const addPlayer = (name: string, rating?: string) => {
    setPlayers([...players, { 
      name, 
      rating: rating ? parseInt(rating) : undefined 
    }]);
  };

  const removePlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const startTournament = () => {
    const newTournament = runTournament(players);
    setTournament(newTournament);
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
        setRoundResults([...roundResults, []]);
        return true;
      }
    }
    return false;
  };

  const finishTournament = () => {
    if (tournament) {
      finishRound(tournament.rounds.length - 1);
      setIsFinished(true);
      return true;
    }
    return false;
  };

  const resetTournament = () => {
    setPlayers([]);
    setTournament(null);
    setIsFinished(false);
    setRoundResults([]);
    localStorage.removeItem('players');
    localStorage.removeItem('tournament');
    localStorage.removeItem('isFinished');
    localStorage.removeItem('roundResults');
  };

  const getSortedPlayers = () => {
    if (!tournament) return [];
    
    return [...tournament.players].sort(
      (a, b) => b.points - a.points || b.buc1 - a.buc1 || b.bucT - a.bucT
    );
  };
  
  return {
    players,
    tournament,
    isFinished,
    roundResults,
    addPlayer,
    removePlayer,
    startTournament,
    handleResultChange,
    finishRound,
    nextRound,
    finishTournament,
    resetTournament,
    getSortedPlayers
  };
}; 