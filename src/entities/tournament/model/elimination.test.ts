import { describe, it, expect } from "vitest";
import { MatchResult } from "./tournament";
import {
  nextPowerOf2,
  generateEliminationBracket,
  setEliminationMatchResult,
  isBracketFinished,
  getChampion,
} from "./elimination";

describe("nextPowerOf2", () => {
  it("returns 1 for n<=1", () => {
    expect(nextPowerOf2(0)).toBe(1);
    expect(nextPowerOf2(1)).toBe(1);
  });
  it("returns next power of 2", () => {
    expect(nextPowerOf2(2)).toBe(2);
    expect(nextPowerOf2(3)).toBe(4);
    expect(nextPowerOf2(5)).toBe(8);
    expect(nextPowerOf2(8)).toBe(8);
  });
});

describe("generateEliminationBracket", () => {
  it("creates correct rounds for 4 players", () => {
    const b = generateEliminationBracket([
      { name: "A" },
      { name: "B" },
      { name: "C" },
      { name: "D" },
    ]);
    expect(b.rounds).toHaveLength(2); // round 0: 2 matches, round 1: 1 match (final)
    expect(b.rounds[0].matches).toHaveLength(2);
    expect(b.rounds[1].matches).toHaveLength(1);
    expect(b.rounds[0].matches[0].player1?.name).toBe("A");
    expect(b.rounds[0].matches[0].player2?.name).toBe("B");
    expect(b.rounds[1].matches[0].player1).toBeNull();
    expect(b.rounds[1].matches[0].player2).toBeNull();
  });

  it("one bye for 3 players: 1 pair in round 0, bye advances to round 1", () => {
    const b = generateEliminationBracket([{ name: "A" }, { name: "B" }, { name: "C" }]);
    expect(b.rounds[0].matches).toHaveLength(1);
    expect(b.rounds[0].matches[0].player1?.name).toBe("A");
    expect(b.rounds[0].matches[0].player2?.name).toBe("B");
    expect(b.rounds[1].matches[0].player1?.name).toBe("C");
  });

  it("9 players: 4 pairs in round 0, 1 player with bye (autoprogress)", () => {
    const b = generateEliminationBracket(
      Array.from({ length: 9 }, (_, i) => ({ name: `P${i + 1}` }))
    );
    expect(b.rounds[0].matches).toHaveLength(4);
    expect(b.rounds[0].matches.some((m) => m.player1?.name === "Bye" || m.player2?.name === "Bye")).toBe(false);
    expect(b.nextSlot).toBeDefined();
  });
});

describe("setEliminationMatchResult and advancement", () => {
  it("advances winner to next round and sets champion when final is set", () => {
    let b = generateEliminationBracket([
      { name: "A" },
      { name: "B" },
      { name: "C" },
      { name: "D" },
    ]);
    expect(b.rounds[1].matches[0].player1).toBeNull();
    b = setEliminationMatchResult(b, 0, 0, MatchResult.WIN); // A beats B
    b = setEliminationMatchResult(b, 0, 1, MatchResult.WIN); // C beats D
    expect(b.rounds[1].matches[0].player1?.name).toBe("A");
    expect(b.rounds[1].matches[0].player2?.name).toBe("C");
    expect(isBracketFinished(b)).toBe(false);
    b = setEliminationMatchResult(b, 1, 0, MatchResult.WIN); // A beats C
    expect(isBracketFinished(b)).toBe(true);
    expect(getChampion(b)?.name).toBe("A");
  });
});
