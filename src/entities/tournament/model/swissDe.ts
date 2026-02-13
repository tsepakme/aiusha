export const SWISS_CONFIG = {
  maxWins: 3,
  maxLosses: 3,
  minParticipants: 8,
  maxRounds: 5,
} as const;

export type SwissDEStage = "swiss" | "winner" | "loser" | "eliminated";

export type SwissDETeam = {
  id: number | string;
  name: string;
  rating?: number;
  wins: number;
  losses: number;
  buchholz: number;
  opponents: (number | string)[];
  seed?: number;
  stage: SwissDEStage;
};

export type SwissDEMatch = {
  id: string;
  team1: SwissDETeam;
  team2: SwissDETeam | null;
  result: "team1" | "team2" | null;
};

export type SwissDERound = {
  matches: SwissDEMatch[];
};

export type DEMatch = {
  id: string;
  team1: SwissDETeam | null;
  team2: SwissDETeam | null;
  result: "team1" | "team2" | null;
  nextWinner?: [number, number, number];
  nextLoser?: [number, number, number];
};

export type DEBracketKind = "winner" | "loser" | "grandFinal";

export type DERound = {
  matches: DEMatch[];
  kind: DEBracketKind;
};

export type DEBracket = {
  winnerRounds: DERound[];
  loserRounds: DERound[];
  grandFinal: DEMatch;
  grandFinalReset?: DEMatch | null;
  bracketResetEnabled: boolean;
};

export function isPowerOf2(n: number): boolean {
  return n >= 1 && (n & (n - 1)) === 0;
}

export function validateParticipantCount(n: number): { valid: boolean; message?: string } {
  if (n < SWISS_CONFIG.minParticipants)
    return { valid: false, message: `Minimum ${SWISS_CONFIG.minParticipants} participants` };
  if (!isPowerOf2(n))
    return { valid: false, message: "Number of participants must be a power of 2 (8, 16, 32, …)" };
  return { valid: true };
}

export function createInitialTeams(
  players: { name: string; rating?: number }[]
): SwissDETeam[] {
  return players.map((p, i) => ({
    id: i + 1,
    name: p.name,
    rating: p.rating,
    wins: 0,
    losses: 0,
    buchholz: 0,
    opponents: [],
    stage: "swiss",
  }));
}

function cloneTeam(t: SwissDETeam): SwissDETeam {
  return { ...t, opponents: [...t.opponents] };
}

function cloneTeams(teams: SwissDETeam[]): SwissDETeam[] {
  return teams.map(cloneTeam);
}

function groupByScore(teams: SwissDETeam[]): Map<number, (number | string)[]> {
  const map = new Map<number, (number | string)[]>();
  for (const t of teams) {
    if (t.wins >= SWISS_CONFIG.maxWins || t.losses >= SWISS_CONFIG.maxLosses) continue;
    const score = t.wins - t.losses;
    if (!map.has(score)) map.set(score, []);
    map.get(score)!.push(t.id);
  }
  return map;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pairWithinGroup(
  teamIds: (number | string)[],
  opponents: Map<number | string, Set<number | string>>
): { pairs: [number | string, number | string][]; unpaired: (number | string)[] } {
  const pairs: [number | string, number | string][] = [];
  const used = new Set<number | string>();
  const list = shuffle(teamIds);

  for (const id1 of list) {
    if (used.has(id1)) continue;
    const opp1 = opponents.get(id1) ?? new Set();
    let found: number | string | null = null;
    for (const id2 of list) {
      if (id2 === id1 || used.has(id2) || opp1.has(id2)) continue;
      found = id2;
      break;
    }
    if (found != null) {
      pairs.push([id1, found]);
      used.add(id1);
      used.add(found);
    }
  }

  const unpaired = list.filter((id) => !used.has(id));
  return { pairs, unpaired };
}

function pairUnpairedPool(
  unpairedIds: (number | string)[],
  opponents: Map<number | string, Set<number | string>>
): { pairs: [number | string, number | string][]; unpaired: (number | string)[] } {
  const pairs: [number | string, number | string][] = [];
  const used = new Set<number | string>();
  const list = shuffle(unpairedIds);

  for (const id1 of list) {
    if (used.has(id1)) continue;
    const opp1 = opponents.get(id1) ?? new Set();
    let found: number | string | null = null;
    for (const id2 of list) {
      if (id2 === id1 || used.has(id2) || opp1.has(id2)) continue;
      found = id2;
      break;
    }
    if (found != null) {
      pairs.push([id1, found]);
      used.add(id1);
      used.add(found);
    }
  }

  let unpaired = list.filter((id) => !used.has(id));
  if (unpaired.length >= 2) {
    for (let i = 0; i < unpaired.length; i++) {
      const id1 = unpaired[i];
      if (used.has(id1)) continue;
      for (let j = i + 1; j < unpaired.length; j++) {
        const id2 = unpaired[j];
        if (used.has(id2)) continue;
        pairs.push([id1, id2]);
        used.add(id1);
        used.add(id2);
        break;
      }
    }
    unpaired = list.filter((id) => !used.has(id));
  }
  return { pairs, unpaired };
}

export function pairSwissRound(teams: SwissDETeam[]): { round: SwissDERound; teams: SwissDETeam[] } {
  const cloned = cloneTeams(teams);
  const byId = new Map(cloned.map((t) => [t.id, t]));
  const opponents = new Map<number | string, Set<number | string>>();
  for (const t of cloned) {
    opponents.set(t.id, new Set(t.opponents));
  }

  const scoreGroups = groupByScore(cloned);
  const allPairs: [number | string, number | string][] = [];
  let allUnpaired: (number | string)[] = [];

  for (const [_score, ids] of scoreGroups) {
    const { pairs, unpaired } = pairWithinGroup(ids, opponents);
    for (const p of pairs) {
      allPairs.push(p);
      const [id1, id2] = p;
      byId.get(id1)!.opponents.push(id2);
      byId.get(id2)!.opponents.push(id1);
    }
    allUnpaired = allUnpaired.concat(unpaired);
  }

  if (allUnpaired.length > 0) {
    const { pairs: floatPairs, unpaired: stillUnpaired } = pairUnpairedPool(allUnpaired, opponents);
    for (const p of floatPairs) {
      allPairs.push(p);
      const [id1, id2] = p;
      byId.get(id1)!.opponents.push(id2);
      byId.get(id2)!.opponents.push(id1);
    }
    allUnpaired = stillUnpaired;
  }

  const matches: SwissDEMatch[] = [];
  let matchId = 0;

  for (const [id1, id2] of allPairs) {
    const t1 = byId.get(id1)!;
    const t2 = byId.get(id2)!;
    matches.push({
      id: `swiss-${matchId++}`,
      team1: t1,
      team2: t2,
      result: null,
    });
  }

  if (allUnpaired.length === 1) {
    const byeId = allUnpaired[0];
    const t = byId.get(byeId)!;
    matches.push({
      id: `swiss-${matchId++}`,
      team1: t,
      team2: null,
      result: "team1", // bye = win
    });
    t.wins += 1;
  } else if (allUnpaired.length > 1) {
    const byeId = shuffle(allUnpaired)[0];
    const t = byId.get(byeId)!;
    matches.push({
      id: `swiss-${matchId++}`,
      team1: t,
      team2: null,
      result: "team1",
    });
    t.wins += 1;
  }

  return { round: { matches }, teams: cloned };
}

export function applySwissRoundResults(
  teams: SwissDETeam[],
  round: SwissDERound,
  results: ("team1" | "team2" | null)[]
): SwissDETeam[] {
  const cloned = cloneTeams(teams);
  const byId = new Map(cloned.map((t) => [t.id, t]));

  round.matches.forEach((m, i) => {
    if (m.team2 === null) return;
    const res = results[i] ?? null;
    if (res === "team1") {
      const t1 = byId.get(m.team1.id);
      if (t1) {
        t1.wins += 1;
        if (m.team2) {
          const t2 = byId.get(m.team2.id);
          if (t2) t2.losses += 1;
        }
      }
    } else if (res === "team2" && m.team2) {
      const t2 = byId.get(m.team2.id);
      const t1 = byId.get(m.team1.id);
      if (t2) t2.wins += 1;
      if (t1) t1.losses += 1;
    }
  });

  for (const t of cloned) {
    let sum = 0;
    for (const oppId of t.opponents) {
      const opp = byId.get(oppId);
      if (opp) sum += opp.wins;
    }
    t.buchholz = sum;
  }

  for (const t of cloned) {
    if (t.wins >= SWISS_CONFIG.maxWins) t.stage = "winner";
    else if (t.losses >= SWISS_CONFIG.maxLosses) t.stage = "eliminated";
  }

  return cloned;
}

export function getQualifiedTeams(teams: SwissDETeam[]): SwissDETeam[] {
  const qualified = teams.filter((t) => t.wins >= SWISS_CONFIG.maxWins);
  return qualified.sort((a, b) => b.buchholz - a.buchholz);
}

export function assignSeeds(qualified: SwissDETeam[]): SwissDETeam[] {
  const cloned = cloneTeams(qualified);
  cloned.forEach((t, i) => {
    t.seed = i + 1;
  });
  return cloned;
}

export function isSwissComplete(teams: SwissDETeam[]): boolean {
  return teams.every(
    (t) => t.wins >= SWISS_CONFIG.maxWins || t.losses >= SWISS_CONFIG.maxLosses
  );
}
