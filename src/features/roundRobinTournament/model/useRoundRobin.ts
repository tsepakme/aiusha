import { useMemo } from "react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { toast } from "sonner";
import {
  type RoundRobinTeamBase,
  type RoundRobinTeam,
  type MatchResult,
  type Round,
  DEFAULT_POINTS,
  validateParticipantCount,
  generateSchedule,
  rebuildStatsFromResults,
  getBuchholz,
  getHeadToHead,
  getStandings,
  isTournamentComplete,
  getChampion,
} from "@/entities/tournament/model/roundRobin";

type PlayerInput = { name: string; rating?: number };

const STORAGE_PLAYERS = "round_robin_players";
const STORAGE_INITIAL_TEAMS = "round_robin_initial_teams";
const STORAGE_ROUNDS = "round_robin_rounds";
const STORAGE_RESULTS = "round_robin_results";
const STORAGE_CONFIRMED = "round_robin_confirmed";

export function useRoundRobin() {
  const [players, setPlayers, removePlayers] = useLocalStorage<PlayerInput[]>(
    STORAGE_PLAYERS,
    []
  );
  const [initialTeams, setInitialTeams, removeInitialTeams] =
    useLocalStorage<RoundRobinTeamBase[] | null>(STORAGE_INITIAL_TEAMS, null);
  const [rounds, setRounds, removeRounds] = useLocalStorage<Round[] | null>(
    STORAGE_ROUNDS,
    null
  );
  const [results, setResults, removeResults] = useLocalStorage<
    Record<number, Record<number, MatchResult>>
  >(STORAGE_RESULTS, {});
  const [confirmedRounds, setConfirmedRounds, removeConfirmed] =
    useLocalStorage<number[]>(STORAGE_CONFIRMED, []);

  const config = DEFAULT_POINTS;

  const teamsWithStats = useMemo((): RoundRobinTeam[] => {
    if (!initialTeams || !rounds) return [];
    return rebuildStatsFromResults(
      initialTeams,
      rounds,
      results,
      confirmedRounds,
      config
    );
  }, [initialTeams, rounds, results, confirmedRounds]);

  const standings = useMemo(() => {
    if (teamsWithStats.length === 0) return [];
    const getBuchholzFn = (t: RoundRobinTeam) => getBuchholz(t, teamsWithStats);
    const getHeadToHeadFn = (a: RoundRobinTeam, b: RoundRobinTeam) =>
      getHeadToHead(a, b, rounds ?? [], results);
    return getStandings(
      teamsWithStats,
      rounds ?? [],
      results,
      getBuchholzFn,
      getHeadToHeadFn
    );
  }, [teamsWithStats, rounds, results]);

  const isComplete = useMemo(
    () => (rounds ? isTournamentComplete(rounds, results) : false),
    [rounds, results]
  );
  const champion = useMemo(
    () => (isComplete ? getChampion(standings) : null),
    [isComplete, standings]
  );

  const phase: "setup" | "playing" | "finished" = !rounds
    ? "setup"
    : isComplete
      ? "finished"
      : "playing";

  const addPlayer = (name: string, rating?: string) => {
    if (!name.trim()) return false;
    setPlayers([
      ...players,
      { name: name.trim(), rating: rating ? parseInt(rating, 10) : undefined },
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
    const base: RoundRobinTeamBase[] = list.map((p, i) => ({
      id: `rr-${i + 1}-${Date.now()}`,
      name: p.name,
      seed: i + 1,
    }));
    const teamIds = base.map((t) => t.id);
    const getSeed = (id: string) => base.find((t) => t.id === id)?.seed ?? 0;
    const schedule = generateSchedule(teamIds, getSeed);
    setInitialTeams(base);
    setRounds(schedule);
    setResults({});
    setConfirmedRounds([]);
    toast.success("Round Robin started");
    return true;
  };

  const setResult = (roundIndex: number, matchIndex: number, result: MatchResult) => {
    setResults((prev) => {
      const round = { ...(prev[roundIndex] ?? {}) };
      round[matchIndex] = result;
      return { ...prev, [roundIndex]: round };
    });
  };

  const confirmRound = (roundIndex: number) => {
    if (!rounds || rounds[roundIndex] === undefined) return false;
    if (confirmedRounds.includes(roundIndex)) return false;
    const round = rounds[roundIndex];
    const roundResults = results[roundIndex] ?? {};
    const allEntered = round.matches.every(
      (m, i) =>
        m.team2 === null ||
        roundResults[i] === "team1" ||
        roundResults[i] === "team2" ||
        roundResults[i] === "draw"
    );
    if (!allEntered) {
      toast.error("Enter result for every match (bye is automatic)");
      return false;
    }
    setConfirmedRounds((prev) => [...prev, roundIndex].sort((a, b) => a - b));
    if (roundIndex === rounds.length - 1) toast.success("Tournament complete!");
    else toast.success("Round confirmed");
    return true;
  };

  const resetTournament = () => {
    removePlayers();
    removeInitialTeams();
    removeRounds();
    removeResults();
    removeConfirmed();
    setPlayers([]);
    setInitialTeams(null);
    setRounds(null);
    setResults({});
    setConfirmedRounds([]);
    toast.success("Tournament reset");
  };

  const isRoundConfirmed = (roundIndex: number) => confirmedRounds.includes(roundIndex);

  return {
    players,
    initialTeams,
    rounds,
    results,
    confirmedRounds,
    teamsWithStats,
    standings,
    phase,
    isComplete,
    champion,
    config,
    addPlayer,
    removePlayer,
    editPlayer,
    startTournament,
    setResult,
    confirmRound,
    resetTournament,
    isRoundConfirmed,
    validateParticipantCount,
  };
}
