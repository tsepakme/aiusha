import { useRef } from "react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { toast } from "sonner";
import {
  validateParticipantCount,
  createInitialTeams,
  pairSwissRound,
  applySwissRoundResults,
  getQualifiedTeams,
  assignSeeds,
  isSwissComplete,
  type SwissDETeam,
  type SwissDERound,
} from "@/entities/tournament/model/swissDe";
import type { DEBracket } from "@/entities/tournament/model/swissDe";
import {
  buildDoubleEliminationBracket,
  setDEMatchResult,
  isDEBracketComplete,
  getDEChampion,
} from "@/entities/tournament/model/doubleElimination";

type PlayerInput = { name: string; rating?: number };

const STORAGE_PLAYERS = "swiss_de_players";
const STORAGE_TEAMS = "swiss_de_teams";
const STORAGE_SWISS_ROUNDS = "swiss_de_swiss_rounds";
const STORAGE_SWISS_RESULTS = "swiss_de_swiss_results";
const STORAGE_PLAYOFF = "swiss_de_playoff";

export function useSwissDe() {
  const [players, setPlayers, removePlayers] = useLocalStorage<PlayerInput[]>(
    STORAGE_PLAYERS,
    []
  );
  const [teams, setTeams, removeTeams] = useLocalStorage<SwissDETeam[] | null>(
    STORAGE_TEAMS,
    null
  );
  const [swissRounds, setSwissRounds, removeSwissRounds] =
    useLocalStorage<SwissDERound[]>(STORAGE_SWISS_ROUNDS, []);
  const [swissResults, setSwissResults, removeSwissResults] = useLocalStorage<
    ("team1" | "team2" | null)[][]
  >(STORAGE_SWISS_RESULTS, []);
  const [playoffBracket, setPlayoffBracket, removePlayoff] =
    useLocalStorage<DEBracket | null>(STORAGE_PLAYOFF, null);

  const completedTeamsRef = useRef<SwissDETeam[] | null>(null);

  const addPlayer = (name: string, rating?: string) => {
    if (!name.trim()) return false;
    setPlayers([
      ...players,
      {
        name: name.trim(),
        rating: rating ? parseInt(rating, 10) : undefined,
      },
    ]);
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
    const next = [...players];
    next[index] = {
      name: name.trim(),
      rating: rating ? parseInt(rating, 10) : undefined,
    };
    setPlayers(next);
    return true;
  };

  const startTournament = (playersOverride?: PlayerInput[]) => {
    const list = playersOverride ?? players;
    const validation = validateParticipantCount(list.length);
    if (!validation.valid) {
      toast.error(validation.message);
      return false;
    }
    const initial = createInitialTeams(list);
    const { round, teams: nextTeams } = pairSwissRound(initial);
    setTeams(nextTeams);
    setSwissRounds([round]);
    setSwissResults([[]]);
    setPlayoffBracket(null);
    toast.success("Swiss stage started");
    return true;
  };

  const setSwissResult = (
    roundIndex: number,
    matchIndex: number,
    result: "team1" | "team2"
  ) => {
    setSwissResults((prev) => {
      const next = prev.map((r, i) => (i === roundIndex ? [...r] : r));
      if (!next[roundIndex]) next[roundIndex] = [];
      next[roundIndex][matchIndex] = result;
      return next;
    });
  };

  const completeSwissRound = (roundIndex: number) => {
    if (!teams || !swissRounds[roundIndex]) return false;
    const results = swissResults[roundIndex] ?? [];
    const round = swissRounds[roundIndex];
    const updated = applySwissRoundResults(teams, round, results);
    setTeams(updated);
    if (!isSwissComplete(updated)) {
      completedTeamsRef.current = null;
      const { round: nextRound, teams: nextTeams } = pairSwissRound(updated);
      setSwissRounds((prev) => [...prev, nextRound]);
      setTeams(nextTeams);
      setSwissResults((prev) => [...prev, []]);
      toast.success("Round complete. Next round generated.");
    } else {
      completedTeamsRef.current = updated;
      toast.success("Swiss stage complete. You can start the playoff now.");
    }
    return true;
  };

  const startPlayoff = () => {
    const teamsToUse = completedTeamsRef.current ?? teams;
    if (!teamsToUse) {
      toast.error("No tournament data. Start the tournament from the Players tab.");
      return false;
    }
    if (!isSwissComplete(teamsToUse)) {
      toast.error("Complete the Swiss stage first: enter all results and click «Complete round» until every team has 3 wins or 3 losses.");
      return false;
    }
    completedTeamsRef.current = null;
    const qualified = getQualifiedTeams(teamsToUse);
    if (qualified.length === 0) {
      toast.error("No qualified teams (need 3 wins). Complete the Swiss rounds.");
      return false;
    }
    const n = qualified.length;
    if (n < 2 || (n & (n - 1)) !== 0) {
      toast.error(`Qualified count must be a power of 2 (got ${n}). Check Swiss results.`);
      return false;
    }
    try {
      const seeded = assignSeeds(qualified);
      const bracket = buildDoubleEliminationBracket(seeded, false);
      setPlayoffBracket(bracket);
      toast.success("Playoff started. Open the Playoff tab to enter results.");
      return true;
    } catch (err) {
      console.error("startPlayoff failed:", err);
      toast.error("Could not start playoff. Check console for details.");
      return false;
    }
  };

  const setPlayoffMatchResult = (
    location:
      | { roundKind: "winner"; roundIndex: number; matchIndex: number }
      | { roundKind: "loser"; roundIndex: number; matchIndex: number }
      | { roundKind: "grandFinal" },
    result: "team1" | "team2"
  ) => {
    if (!playoffBracket) return;
    const next = setDEMatchResult(playoffBracket, location, result);
    setPlayoffBracket(next);
    if (location.roundKind === "grandFinal" && isDEBracketComplete(next)) {
      const champion = getDEChampion(next);
      if (champion) toast.success(`${champion.name} wins the tournament!`);
    }
  };

  const resetTournament = () => {
    completedTeamsRef.current = null;
    removePlayers();
    removeTeams();
    removeSwissRounds();
    removeSwissResults();
    removePlayoff();
    setPlayers([]);
    setTeams(null);
    setSwissRounds([]);
    setSwissResults([]);
    setPlayoffBracket(null);
    toast.success("Tournament reset");
  };

  const phase: "setup" | "swiss" | "playoff" | "finished" =
    !teams && !playoffBracket
      ? "setup"
      : playoffBracket
        ? isDEBracketComplete(playoffBracket)
          ? "finished"
          : "playoff"
        : "swiss";

  const canStartPlayoff =
    teams !== null && isSwissComplete(teams) && !playoffBracket;
  const champion =
    playoffBracket && isDEBracketComplete(playoffBracket)
      ? getDEChampion(playoffBracket)
      : null;

  return {
    players,
    teams,
    swissRounds,
    swissResults,
    playoffBracket,
    phase,
    canStartPlayoff,
    champion,
    addPlayer,
    removePlayer,
    editPlayer,
    startTournament,
    setSwissResult,
    completeSwissRound,
    startPlayoff,
    setPlayoffMatchResult,
    resetTournament,
    validateParticipantCount,
  };
}
