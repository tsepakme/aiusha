import { describe, it, expect } from "vitest";
import {
  calculateRounds,
  runTournament,
  generateFirstRound,
  generateSwissRound,
  updateResults,
} from "./manageTournament";
import { initializePlayers } from "../../addPlayer/model/addPlayer";
import { MatchResult } from "../../../entities/tournament/model/tournament";

describe("calculateRounds", () => {
  it("returns ceil(log2(n)) for minimum rounds", () => {
    expect(calculateRounds(2)).toBe(1);
    expect(calculateRounds(4)).toBe(2);
    expect(calculateRounds(8)).toBe(3);
    expect(calculateRounds(3)).toBe(2);
    expect(calculateRounds(5)).toBe(3);
  });
});

describe("runTournament", () => {
  it("creates tournament with one round and paired players", () => {
    const t = runTournament([
      { name: "A", rating: 1000 },
      { name: "B", rating: 900 },
    ]);
    expect(t.players).toHaveLength(2);
    expect(t.rounds).toHaveLength(1);
    expect(t.rounds[0].matches).toHaveLength(1);
    expect(t.rounds[0].matches[0].player1.name).toBe("A");
    expect(t.rounds[0].matches[0].player2?.name).toBe("B");
    expect(t.rounds[0].matches[0].result).toBeUndefined();
  });

  it("handles odd number of players with bye", () => {
    const t = runTournament([
      { name: "A" },
      { name: "B" },
      { name: "C" },
    ]);
    expect(t.players).toHaveLength(3);
    expect(t.rounds[0].matches).toHaveLength(2); // one pair + one bye
    const byeMatch = t.rounds[0].matches.find((m) => !m.player2);
    expect(byeMatch).toBeDefined();
    expect(byeMatch!.player1.points).toBe(1);
  });
});

describe("generateFirstRound", () => {
  it("does not mutate input players", () => {
    const players = initializePlayers([{ name: "X" }, { name: "Y" }]);
    const before = JSON.stringify(players);
    generateFirstRound(players);
    expect(JSON.stringify(players)).toBe(before);
  });

  it("returns matches and players with updated colorHistory and opponents", () => {
    const players = initializePlayers([{ name: "A" }, { name: "B" }]);
    const { matches, players: outPlayers } = generateFirstRound(players);
    expect(matches).toHaveLength(1);
    expect(outPlayers[0].colorHistory).toEqual(["white"]);
    expect(outPlayers[1].colorHistory).toEqual(["black"]);
    expect(outPlayers[0].opponents).toContain(outPlayers[1].id);
    expect(outPlayers[1].opponents).toContain(outPlayers[0].id);
  });
});

describe("generateSwissRound", () => {
  it("does not mutate input players", () => {
    const t = runTournament([
      { name: "A" },
      { name: "B" },
      { name: "C" },
      { name: "D" },
    ]);
    const before = JSON.stringify(t.players);
    generateSwissRound(t.players, 5000);
    expect(JSON.stringify(t.players)).toBe(before);
  });

  it("returns matches and players array", () => {
    const t = runTournament([
      { name: "A" },
      { name: "B" },
      { name: "C" },
      { name: "D" },
    ]);
    const { matches, players: nextPlayers } = generateSwissRound(t.players);
    expect(matches.length).toBeGreaterThan(0);
    expect(nextPlayers).toHaveLength(4);
  });
});

describe("updateResults", () => {
  it("returns new tournament without mutating input", () => {
    const t = runTournament([{ name: "A" }, { name: "B" }]);
    const before = JSON.stringify(t);
    const updated = updateResults(t, 0, [MatchResult.WIN]);
    expect(JSON.stringify(t)).toBe(before);
    expect(updated).not.toBe(t);
    expect(updated.players).not.toBe(t.players);
  });

  it("applies WIN to player1 and updates points", () => {
    const t = runTournament([{ name: "A" }, { name: "B" }]);
    const updated = updateResults(t, 0, [MatchResult.WIN]);
    const p1 = updated.players.find((p) => p.name === "A")!;
    const p2 = updated.players.find((p) => p.name === "B")!;
    expect(p1.points).toBe(1);
    expect(p2.points).toBe(0);
    expect(updated.rounds[0].matches[0].result).toBe(MatchResult.WIN);
  });

  it("applies DRAW and updates both players", () => {
    const t = runTournament([{ name: "A" }, { name: "B" }]);
    const updated = updateResults(t, 0, [MatchResult.DRAW]);
    const p1 = updated.players.find((p) => p.name === "A")!;
    const p2 = updated.players.find((p) => p.name === "B")!;
    expect(p1.points).toBe(0.5);
    expect(p2.points).toBe(0.5);
  });

  it("returns same tournament when round index has no round", () => {
    const t = runTournament([{ name: "A" }, { name: "B" }]);
    const updated = updateResults(t, 99, []);
    expect(updated).toBe(t);
  });
});
