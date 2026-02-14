
import type { SwissDETeam, DEBracket, DEMatch, DERound } from "./swissDe";

function emptyMatch(id: string): DEMatch {
  return { id, team1: null, team2: null, result: null };
}

export function getAllRounds(bracket: DEBracket): DERound[] {
  return [...bracket.winnerRounds, ...bracket.loserRounds];
}

export function buildDoubleEliminationBracket(
  seededTeams: SwissDETeam[],
  bracketResetEnabled: boolean = false
): DEBracket {
  const Q = seededTeams.length;
  if (Q < 2 || (Q & (Q - 1)) !== 0) {
    throw new Error("Q must be a power of 2");
  }

  let matchId = 0;
  const genId = () => `de-${matchId++}`;

  const firstRoundMatches: DEMatch[] = [];
  for (let i = 0; i < Q / 2; i++) {
    const t1 = seededTeams[i];
    const t2 = seededTeams[Q - 1 - i];
    firstRoundMatches.push({
      ...emptyMatch(genId()),
      team1: { ...t1 },
      team2: { ...t2 },
    });
  }
  const winnerRounds: DERound[] = [{ matches: firstRoundMatches, kind: "winner" }];

  const W = Math.log2(Q);
  let prevSize = Q / 2;
  for (let r = 1; r < W; r++) {
    prevSize = prevSize / 2;
    winnerRounds.push({
      matches: Array.from({ length: prevSize }, () => emptyMatch(genId())),
      kind: "winner",
    });
  }

  const numLBR0 = Q / 4;
  const loserRounds: DERound[] = [
    {
      matches: Array.from({ length: numLBR0 }, () => emptyMatch(genId())),
      kind: "loser",
    },
  ];
  if (Q === 4) {
    loserRounds.push({ matches: [emptyMatch(genId())], kind: "loser" });
  } else if (Q === 8) {
    loserRounds.push({
      matches: [emptyMatch(genId()), emptyMatch(genId())],
      kind: "loser",
    });
    loserRounds.push({ matches: [emptyMatch(genId())], kind: "loser" });
  }

  const grandFinal = emptyMatch(genId());
  const totalWRounds = winnerRounds.length;
  const totalLRounds = loserRounds.length;
  const gfRoundIndex = totalWRounds + totalLRounds;

  for (let m = 0; m < winnerRounds[0].matches.length; m++) {
    const match = winnerRounds[0].matches[m];
    const nextW = Math.floor(m / 2);
    match.nextWinner =
      winnerRounds.length > 1
        ? [1, nextW, m % 2]
        : [gfRoundIndex, 0, 0];
    match.nextLoser = [totalWRounds, Math.floor(m / 2), m % 2];
  }

  if (Q === 4 && winnerRounds.length >= 2) {
    winnerRounds[1].matches[0].nextWinner = [gfRoundIndex, 0, 0];
    winnerRounds[1].matches[0].nextLoser = [totalWRounds + 1, 0, 0];
  }
  if (Q === 8 && winnerRounds.length >= 3) {
    for (let m = 0; m < winnerRounds[1].matches.length; m++) {
      const match = winnerRounds[1].matches[m];
      match.nextWinner = [2, 0, m];
      match.nextLoser = [totalWRounds + 1, m, 0];
    }
    winnerRounds[2].matches[0].nextWinner = [gfRoundIndex, 0, 0];
    winnerRounds[2].matches[0].nextLoser = [totalWRounds + 2, 0, 0];
  }

  for (let m = 0; m < loserRounds[0].matches.length; m++) {
    loserRounds[0].matches[m].nextWinner = [totalWRounds + 1, m, 1];
  }
  if (Q === 4) {
    loserRounds[1].matches[0].nextWinner = [gfRoundIndex, 0, 1];
  } else if (Q === 8) {
    for (let m = 0; m < loserRounds[1].matches.length; m++) {
      loserRounds[1].matches[m].nextWinner = [totalWRounds + 2, 0, m];
    }
    loserRounds[2].matches[0].nextWinner = [gfRoundIndex, 0, 1];
  }

  return {
    winnerRounds,
    loserRounds,
    grandFinal,
    bracketResetEnabled,
  };
}

function getWinner(m: DEMatch, result: "team1" | "team2"): SwissDETeam | null {
  return result === "team1" ? m.team1 : m.team2;
}

function getLoser(m: DEMatch, result: "team1" | "team2"): SwissDETeam | null {
  return result === "team1" ? m.team2 : m.team1;
}

type MatchLocation =
  | { roundKind: "winner" | "loser"; roundIndex: number; matchIndex: number }
  | { roundKind: "grandFinal" };

function getMatch(bracket: DEBracket, loc: MatchLocation): DEMatch | null {
  if (loc.roundKind === "grandFinal") return bracket.grandFinal;
  if (loc.roundKind === "winner")
    return bracket.winnerRounds[loc.roundIndex]?.matches[loc.matchIndex] ?? null;
  return bracket.loserRounds[loc.roundIndex]?.matches[loc.matchIndex] ?? null;
}

export function setDEMatchResult(
  bracket: DEBracket,
  location: MatchLocation,
  result: "team1" | "team2"
): DEBracket {
  const match = getMatch(bracket, location);
  if (!match) return bracket;
  const winner = getWinner(match, result);
  const loser = getLoser(match, result);
  if (!winner) return bracket;

  const deepCloneMatch = (m: DEMatch): DEMatch => ({
    ...m,
    team1: m.team1 ? { ...m.team1 } : null,
    team2: m.team2 ? { ...m.team2 } : null,
  });
  const cloneRound = (r: DERound): DERound => ({
    ...r,
    matches: r.matches.map(deepCloneMatch),
  });

  const newWinnerRounds = bracket.winnerRounds.map(cloneRound);
  const newLoserRounds = bracket.loserRounds.map(cloneRound);
  const newGrandFinal = deepCloneMatch(bracket.grandFinal);

  const findAndSet = (
    roundIndex: number,
    matchIndex: number,
    slot: 0 | 1,
    team: SwissDETeam
  ) => {
    if (roundIndex < newWinnerRounds.length) {
      const r = newWinnerRounds[roundIndex];
      const mat = r.matches[matchIndex];
      if (mat) (slot === 0 ? (mat.team1 = team) : (mat.team2 = team));
    } else if (roundIndex < newWinnerRounds.length + newLoserRounds.length) {
      const idx = roundIndex - newWinnerRounds.length;
      const r = newLoserRounds[idx];
      const mat = r.matches[matchIndex];
      if (mat) (slot === 0 ? (mat.team1 = team) : (mat.team2 = team));
    } else {
      (slot === 0 ? (newGrandFinal.team1 = team) : (newGrandFinal.team2 = team));
    }
  };

  const setResult = (m: DEMatch, res: "team1" | "team2") => {
    m.result = res;
  };

  if (location.roundKind === "grandFinal") {
    setResult(newGrandFinal, result);
  } else if (location.roundKind === "winner") {
    const m = newWinnerRounds[location.roundIndex].matches[location.matchIndex];
    setResult(m, result);
  } else {
    const m = newLoserRounds[location.roundIndex].matches[location.matchIndex];
    setResult(m, result);
  }

  if (match.nextWinner) {
    const [ri, mi, sl] = match.nextWinner;
    findAndSet(ri, mi, sl as 0 | 1, winner);
  }
  if (match.nextLoser && loser) {
    const [ri, mi, sl] = match.nextLoser;
    findAndSet(ri, mi, sl as 0 | 1, loser);
  }

  return {
    ...bracket,
    winnerRounds: newWinnerRounds,
    loserRounds: newLoserRounds,
    grandFinal: newGrandFinal,
  };
}

export function isDEBracketComplete(bracket: DEBracket): boolean {
  return bracket.grandFinal.result !== null;
}

export function getDEChampion(bracket: DEBracket): SwissDETeam | null {
  if (bracket.grandFinal.result === null) return null;
  return bracket.grandFinal.result === "team1"
    ? bracket.grandFinal.team1
    : bracket.grandFinal.team2;
}
