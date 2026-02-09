import { useMemo } from 'react';
import { Tournament, MatchResult } from "@/entities/tournament/model/tournament";
import { runTournament, generateSwissRound, updateResults, calculateRounds } from "./manageTournament";
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { toast } from 'sonner';
import { analytics } from '@/shared/lib/analytics';


type PlayerInput = { name: string; rating?: number };

export const useTournament = () => {
  const [players, setPlayers, removePlayers] = useLocalStorage<PlayerInput[]>('players', []);
  const [tournament, setTournament, removeTournament] = useLocalStorage<Tournament | null>('tournament', null);
  const [isFinished, setIsFinished, removeIsFinished] = useLocalStorage<boolean>('isFinished', false);
  const [roundResults, setRoundResults, removeRoundResults] = useLocalStorage<(MatchResult | undefined)[][]>('roundResults', []);

  const addPlayer = (name: string, rating?: string) => {
    if (!name.trim()) return false;
    
    const newPlayers = [...players, { 
      name: name.trim(), 
      rating: rating ? parseInt(rating) : undefined 
    }];
    setPlayers(newPlayers);
    
    // Track participant added event
    if (tournament) {
      analytics.participantAdded({
        tournament_id: `tournament_${Date.now()}`, // Using timestamp as ID since no explicit ID exists
        participant_count: newPlayers.length,
        method: 'manual'
      });
    }
    
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

  const startTournament = (playersOverride?: PlayerInput[]) => {
    const list = playersOverride ?? players;
    if (list.length < 2) return false;

    const newTournament = runTournament(list);
    setTournament(newTournament);
    setRoundResults(newTournament.rounds.map(() => []));
    
    // Track tournament creation
    const tournamentId = `tournament_${Date.now()}`;
    analytics.tournamentCreated({
      tournament_id: tournamentId,
      system_type: 'swiss',
      participant_count: newTournament.players.length
    });
    
    // Track first round generation
    analytics.roundGenerated({
      tournament_id: tournamentId,
      round_number: 1,
      system_type: 'swiss'
    });
    
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
    
    // Track match result entry
    const tournamentId = `tournament_${Date.now()}`;
    analytics.matchResultEntered({
      tournament_id: tournamentId,
      round_number: roundIndex + 1,
      match_id: `match_${roundIndex}_${matchIndex}`
    });
  };

  const finishRound = (roundIndex: number) => {
    if (!tournament || !tournament.rounds[roundIndex]) return false;

    const newTournament = updateResults(
      tournament,
      roundIndex,
      roundResults[roundIndex] || []
    );
    setTournament(newTournament);

    const tournamentId = `tournament_${Date.now()}`;
    analytics.roundCompleted({
      tournament_id: tournamentId,
      round_number: roundIndex + 1,
      time_to_complete_sec: 0, // TODO: Track actual time
    });

    return true;
  };

  const nextRound = () => {
    if (!tournament) return false;

    if (tournament.rounds.length >= calculateRounds(tournament.players.length)) {
      return false;
    }

    const currentRoundIndex = tournament.rounds.length - 1;
    const afterFinish = updateResults(
      tournament,
      currentRoundIndex,
      roundResults[currentRoundIndex] || []
    );
    const { matches, players: nextPlayers } = generateSwissRound(afterFinish.players);

    setTournament({
      ...afterFinish,
      players: nextPlayers,
      rounds: [...afterFinish.rounds, { matches }],
    });
    setRoundResults([...roundResults, []]);

    const tournamentId = `tournament_${Date.now()}`;
    analytics.roundGenerated({
      tournament_id: tournamentId,
      round_number: afterFinish.rounds.length + 1,
      system_type: 'swiss',
    });

    return true;
  };

  const finishTournament = () => {
    if (!tournament) return false;
    
    finishRound(tournament.rounds.length - 1);
    setIsFinished(true);
    
    // Track tournament completion
    const tournamentId = `tournament_${Date.now()}`;
    analytics.tournamentFinished({
      tournament_id: tournamentId,
      total_rounds: tournament.rounds.length,
      total_participants: tournament.players.length,
      duration_sec: 0 // TODO: Track actual duration
    });
    
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