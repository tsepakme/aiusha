import { Player } from "@/entities/player/model/player";
import { MatchResult } from "./tournament";

/** Single match in an elimination bracket (player1/2 may be null for TBD or bye). */
export type EliminationMatch = {
  id: string;
  player1: Player | null;
  player2: Player | null;
  result: MatchResult | null;
};

export type BracketRound = {
  matches: EliminationMatch[];
};

export type NextSlot = { round: number; match: number; slot: "player1" | "player2" };
export type EliminationBracket = {
  rounds: BracketRound[];
  nextSlot?: Record<string, NextSlot>;
};

const BYE_PLAYER: Player = {
  id: "bye",
  name: "Bye",
  points: 0,
  buc1: 0,
  bucT: 0,
  opponents: [],
  colorHistory: [],
  resultHistory: [],
  result: undefined,
};

/** Next power of 2 >= n (e.g. 5 -> 8). */
export function nextPowerOf2(n: number): number {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** Create a minimal player for bracket (id, name, rating). */
function toBracketPlayer(
  data: { name: string; rating?: number },
  index: number
): Player {
  return {
    ...BYE_PLAYER,
    id: index + 1,
    name: data.name,
    rating: data.rating,
  };
}

/**
 * Build initial elimination bracket. Pairs players in first round; fills with byes if needed.
 * Pure: returns new bracket, does not mutate inputs.
 */
export function generateEliminationBracket(
  players: { name: string; rating?: number }[]
): EliminationBracket {
  const n = players.length;
  if (n < 2) return { rounds: [], nextSlot: {} };
  const bracketPlayers: Player[] = players.map(toBracketPlayer);
  const numPairsR0 = Math.floor(n / 2);
  const numByesR0 = n - 2 * numPairsR0;
  const firstRound: EliminationMatch[] = [];
  for (let i = 0; i < numPairsR0; i++) {
    firstRound.push({
      id: `0-${i}`,
      player1: bracketPlayers[i * 2],
      player2: bracketPlayers[i * 2 + 1],
      result: null,
    });
  }
  const byePlayerR0 = numByesR0 > 0 ? bracketPlayers[2 * numPairsR0] : null;
  // adv = number of people advancing to next round (winners + byes)
  let adv = numPairsR0 + numByesR0;
  const roundMeta: { matches: number }[] = [{ matches: numPairsR0 }];
  while (adv > 1) {
    const matches = Math.floor(adv / 2);
    const byes = adv - 2 * matches;
    roundMeta.push({ matches });
    adv = matches + byes;
  }
  const rounds: BracketRound[] = [{ matches: firstRound }];
  for (let r = 1; r < roundMeta.length; r++) {
    const count = roundMeta[r].matches;
    rounds.push({
      matches: Array.from({ length: count }, (_, i) => ({
        id: `${r}-${i}`,
        player1: null,
        player2: null,
        result: null,
      })),
    });
  }
  let roundsWithBye = rounds;
  if (byePlayerR0 && rounds.length >= 2) {
    roundsWithBye = rounds.map((r, ri) =>
      ri === 1
        ? {
            matches: r.matches.map((m, mi) =>
              mi === 0 ? { ...m, player1: byePlayerR0 } : m
            ),
          }
        : r
    );
  }
  const slotOrder: NextSlot[] = [];
  for (let r = 1; r < roundsWithBye.length; r++) {
    for (let m = 0; m < roundsWithBye[r].matches.length; m++) {
      const mat = roundsWithBye[r].matches[m];
      if (mat.player1 === null) slotOrder.push({ round: r, match: m, slot: "player1" });
      if (mat.player2 === null) slotOrder.push({ round: r, match: m, slot: "player2" });
    }
  }
  const nextSlot: Record<string, NextSlot> = {};
  let idx = 0;
  for (let r = 0; r < roundsWithBye.length - 1; r++) {
    for (let m = 0; m < roundsWithBye[r].matches.length; m++) {
      nextSlot[`${r}-${m}`] = slotOrder[idx] ?? { round: roundsWithBye.length - 1, match: 0, slot: "player2" };
      idx++;
    }
  }
  return { rounds: roundsWithBye, nextSlot };
}

/** Get winner of a match (null if no result or draw). */
function getWinner(
  match: EliminationMatch,
  result: MatchResult
): Player | null {
  if (result === MatchResult.WIN) return match.player1;
  if (result === MatchResult.LOSS) return match.player2 ?? null;
  return null;
}

/**
 * Apply match result and advance winner to next round. Pure.
 */
export function setEliminationMatchResult(
  bracket: EliminationBracket,
  roundIndex: number,
  matchIndex: number,
  result: MatchResult
): EliminationBracket {
  const round = bracket.rounds[roundIndex];
  if (!round || matchIndex >= round.matches.length) return bracket;

  const match = round.matches[matchIndex];
  const winner = getWinner(match, result);
  if (!winner) return bracket;

  const key = `${roundIndex}-${matchIndex}`;
  const next = (bracket.nextSlot && bracket.nextSlot[key]) ?? {
    round: roundIndex + 1,
    match: Math.floor(matchIndex / 2),
    slot: (matchIndex % 2 === 0 ? "player1" : "player2") as "player1" | "player2",
  };

  if (next.round >= bracket.rounds.length) {
    const newRounds = bracket.rounds.map((r, ri) =>
      ri === roundIndex
        ? { matches: r.matches.map((m, mi) => (mi === matchIndex ? { ...m, result } : m)) }
        : r
    );
    return { ...bracket, rounds: newRounds };
  }

  const nextRound = bracket.rounds[next.round];
  if (!nextRound || next.match >= nextRound.matches.length) {
    const newRounds = bracket.rounds.map((r, ri) =>
      ri === roundIndex
        ? { matches: r.matches.map((m, mi) => (mi === matchIndex ? { ...m, result } : m)) }
        : r
    );
    return { ...bracket, rounds: newRounds };
  }

  const nextMatch = nextRound.matches[next.match];
  const updatedNextMatch = { ...nextMatch, [next.slot]: winner };

  const newRounds = bracket.rounds.map((r, ri) => {
    if (ri === roundIndex) {
      return { matches: r.matches.map((m, mi) => (mi === matchIndex ? { ...m, result } : m)) };
    }
    if (ri === next.round) {
      return { matches: r.matches.map((m, mi) => (mi === next.match ? updatedNextMatch : m)) };
    }
    return r;
  });

  return { ...bracket, rounds: newRounds };
}

/** Check if bracket is complete (final has a result). */
export function isBracketFinished(bracket: EliminationBracket): boolean {
  const lastRound = bracket.rounds[bracket.rounds.length - 1];
  if (!lastRound?.matches[0]) return false;
  return lastRound.matches[0].result !== null;
}

/** Get champion (winner of final) if bracket is finished. */
export function getChampion(bracket: EliminationBracket): Player | null {
  if (!isBracketFinished(bracket)) return null;
  const finalMatch = bracket.rounds[bracket.rounds.length - 1].matches[0];
  return finalMatch.result === MatchResult.WIN
    ? finalMatch.player1
    : finalMatch.player2;
}
