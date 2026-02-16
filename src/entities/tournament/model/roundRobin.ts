/**
 * Round Robin tournament — see docs/TOURNAMENT_FORMAT_ROUND_ROBIN.md
 * BYE only as team2 === null. Stats always rebuilt from results (no increment).
 */

export type MatchResult = "team1" | "team2" | "draw" | null;

export type PointsConfig = {
  win: number;
  draw: number;
  loss: number;
};

export const DEFAULT_POINTS: PointsConfig = { win: 3, draw: 1, loss: 0 };

/** Base team (persisted). Stats are derived from results. */
export type RoundRobinTeamBase = {
  id: string;
  name: string;
  seed: number;
};

/** Team with stats (derived via rebuildStatsFromResults). */
export type RoundRobinTeam = RoundRobinTeamBase & {
  wins: number;
  losses: number;
  draws: number;
  points: number;
  opponents: string[];
};

export type Match = {
  id: string;
  team1: string;
  team2: string | null; // null = bye (only representation)
  result: MatchResult;
};

export type Round = {
  index: number;
  matches: Match[];
};

export type Phase = "setup" | "playing" | "finished";

const MIN_PARTICIPANTS = 3;

export function validateParticipantCount(n: number): { valid: boolean; message?: string } {
  if (n < MIN_PARTICIPANTS) return { valid: false, message: `Minimum ${MIN_PARTICIPANTS} participants` };
  return { valid: true };
}

/** Generate schedule: circle method. Odd N → one match per round has team2 = null (bye). */
export function generateSchedule(
  teamIds: string[],
  getSeed: (id: string) => number
): Round[] {
  const sortedIds = [...teamIds].sort((a, b) => getSeed(a) - getSeed(b));
  const n = sortedIds.length;
  if (n < MIN_PARTICIPANTS) return [];

  if (n % 2 === 0) {
    const rounds: Round[] = [];
    const rotation = [...sortedIds];
    for (let round = 0; round < n - 1; round++) {
      const matches: Match[] = [];
      for (let i = 0; i < n / 2; i++) {
        const a = rotation[i];
        const b = rotation[n - 1 - i];
        matches.push({
          id: `rr-${round}-${i}`,
          team1: a,
          team2: b,
          result: null,
        });
      }
      rounds.push({ index: round, matches });
      rotation.splice(1, 0, rotation.pop()!);
    }
    return rounds;
  }

  // Odd N: (N+1) slots, one slot is "bye" (null). Rounds = N.
  const rotation: (string | null)[] = [...sortedIds, null];
  const len = rotation.length; // N+1
  const rounds: Round[] = [];
  for (let round = 0; round < n; round++) {
    const matches: Match[] = [];
    for (let i = 0; i < len / 2; i++) {
      const a = rotation[i];
      const b = rotation[len - 1 - i];
      if (a === null && b === null) continue;
      if (a === null) {
        matches.push({ id: `rr-${round}-${i}`, team1: b!, team2: null, result: null });
      } else if (b === null) {
        matches.push({ id: `rr-${round}-${i}`, team1: a!, team2: null, result: null });
      } else {
        matches.push({ id: `rr-${round}-${i}`, team1: a, team2: b, result: null });
      }
    }
    rounds.push({ index: round, matches });
    rotation.splice(1, 0, rotation.pop()!);
  }
  return rounds;
}

/** Full rebuild of stats from confirmed rounds + results. No increment. */
export function rebuildStatsFromResults(
  initialTeams: RoundRobinTeamBase[],
  rounds: Round[],
  results: Record<number, Record<number, MatchResult>>,
  confirmedRounds: number[],
  config: PointsConfig
): RoundRobinTeam[] {
  const stats = new Map<string, { wins: number; losses: number; draws: number; opponents: string[] }>();
  for (const t of initialTeams) {
    stats.set(t.id, { wins: 0, losses: 0, draws: 0, opponents: [] });
  }

  for (const r of confirmedRounds) {
    const round = rounds[r];
    if (!round) continue;
    const roundResults = results[r] ?? {};
    for (let m = 0; m < round.matches.length; m++) {
      const match = round.matches[m];
      const res = roundResults[m];

      if (match.team2 === null) {
        const s = stats.get(match.team1);
        if (s) s.wins += 1;
      } else if (res === "team1" || res === "team2" || res === "draw") {
        const s1 = stats.get(match.team1);
        const s2 = stats.get(match.team2);
        if (s1) s1.opponents.push(match.team2);
        if (s2) s2.opponents.push(match.team1);
        if (res === "team1") {
          if (s1) s1.wins += 1;
          if (s2) s2.losses += 1;
        } else if (res === "team2") {
          if (s2) s2.wins += 1;
          if (s1) s1.losses += 1;
        } else {
          if (s1) s1.draws += 1;
          if (s2) s2.draws += 1;
        }
      }
    }
  }

  return initialTeams.map((t) => {
    const s = stats.get(t.id) ?? { wins: 0, losses: 0, draws: 0, opponents: [] };
    const points = s.wins * config.win + s.draws * config.draw + s.losses * config.loss;
    return { ...t, ...s, points };
  });
}

export function getBuchholz(team: RoundRobinTeam, allTeams: RoundRobinTeam[]): number {
  const byId = new Map(allTeams.map((t) => [t.id, t]));
  return team.opponents.reduce((sum, id) => sum + (byId.get(id)?.points ?? 0), 0);
}

/** Head-to-head: positive if a beat b (a wins), negative if b beat a, 0 if draw or no match. */
export function getHeadToHead(
  a: RoundRobinTeam,
  b: RoundRobinTeam,
  rounds: Round[],
  results: Record<number, Record<number, MatchResult>>
): number {
  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r];
    const roundResults = results[r] ?? {};
    for (let m = 0; m < round.matches.length; m++) {
      const match = round.matches[m];
      const res = roundResults[m];
      if (match.team2 === null) continue;
      const t1 = match.team1;
      const t2 = match.team2;
      if ((t1 === a.id && t2 === b.id) || (t1 === b.id && t2 === a.id)) {
        if (res === "team1") return t1 === a.id ? 1 : -1;
        if (res === "team2") return t2 === a.id ? 1 : -1;
        return 0;
      }
    }
  }
  return 0;
}

/** Standings: 1 points, 2 buchholz, 3 head-to-head only if group size === 2, 4 seed. */
export function getStandings(
  teams: RoundRobinTeam[],
  _rounds: Round[],
  _results: Record<number, Record<number, MatchResult>>,
  getBuchholzFn: (t: RoundRobinTeam) => number,
  getHeadToHeadFn: (a: RoundRobinTeam, b: RoundRobinTeam) => number
): RoundRobinTeam[] {
  const byPointsBuchholz = (a: RoundRobinTeam, b: RoundRobinTeam) => {
    if (b.points !== a.points) return b.points - a.points;
    return getBuchholzFn(b) - getBuchholzFn(a);
  };

  const sorted = [...teams].sort((a, b) => {
    const cmp = byPointsBuchholz(a, b);
    if (cmp !== 0) return cmp;
    return a.seed - b.seed;
  });

  const groups: RoundRobinTeam[][] = [];
  let current: RoundRobinTeam[] = [];
  for (const t of sorted) {
    if (
      current.length === 0 ||
      (byPointsBuchholz(current[0], t) === 0 && getBuchholzFn(current[0]) === getBuchholzFn(t))
    ) {
      current.push(t);
    } else {
      if (current.length > 0) groups.push(current);
      current = [t];
    }
  }
  if (current.length > 0) groups.push(current);

  const result: RoundRobinTeam[] = [];
  for (const group of groups) {
    if (group.length === 2) {
      const h2h = getHeadToHeadFn(group[0], group[1]);
      if (h2h > 0) result.push(group[1], group[0]);
      else if (h2h < 0) result.push(group[0], group[1]);
      else result.push(...group.sort((a, b) => a.seed - b.seed));
    } else {
      result.push(...group.sort((a, b) => a.seed - b.seed));
    }
  }
  return result;
}

export function isTournamentComplete(
  rounds: Round[],
  results: Record<number, Record<number, MatchResult>>
): boolean {
  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r];
    const roundResults = results[r] ?? {};
    for (let m = 0; m < round.matches.length; m++) {
      const match = round.matches[m];
      const res = roundResults[m];
      if (match.team2 === null) continue;
      if (res === null) return false;
    }
  }
  return true;
}

export function getChampion(standings: RoundRobinTeam[]): RoundRobinTeam | null {
  return standings.length > 0 ? standings[0] : null;
}
