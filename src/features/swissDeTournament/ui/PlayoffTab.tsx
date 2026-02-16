import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select";
import { Button } from "@/shared/components/button";
import { useSwissDeContext } from "../model/SwissDeContext";

export const PlayoffTab: React.FC = () => {
  const {
    playoffBracket,
    phase,
    champion,
    canStartPlayoff,
    startPlayoff,
    setPlayoffMatchResult,
  } = useSwissDeContext();

  if (!playoffBracket) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-center py-4">
          {phase === "swiss"
            ? "Finish the Swiss stage (all teams 3W or 3L), then start the playoff below or from the Swiss tab."
            : "Start the tournament from the Players tab."}
        </p>
        {canStartPlayoff && (
          <div className="flex justify-center">
            <Button type="button" onClick={() => startPlayoff()}>Start playoff</Button>
          </div>
        )}
      </div>
    );
  }

  const canSetResult = phase === "playoff";

  const setResult = (
    location:
      | { roundKind: "winner"; roundIndex: number; matchIndex: number }
      | { roundKind: "loser"; roundIndex: number; matchIndex: number }
      | { roundKind: "grandFinal" },
    result: "team1" | "team2"
  ) => {
    setPlayoffMatchResult(location, result);
  };

  type MatchRow = { team1: { name: string } | null; team2: { name: string } | null; result: "team1" | "team2" | null };
  const renderRound = (
    title: string,
    roundIndex: number,
    kind: "winner" | "loser",
    matches: MatchRow[]
  ) => (
    <div key={title}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Team 1</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Team 2</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((m, matchIndex) => {
            const p1 = m.team1?.name ?? "—";
            const p2 = m.team2?.name ?? "—";
            const hasResult = m.result !== null;
            const canSet = canSetResult && !hasResult && (m.team1 || m.team2);

            return (
              <TableRow key={`${roundIndex}-${matchIndex}`}>
                <TableCell>{p1}</TableCell>
                <TableCell>
                  {canSet ? (
                    <Select
                      value={m.result ?? ""}
                      onValueChange={(v) =>
                        setResult(
                          { roundKind: kind, roundIndex, matchIndex },
                          v as "team1" | "team2"
                        )
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team1">1 — 0</SelectItem>
                        <SelectItem value="team2">0 — 1</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : hasResult ? (
                    m.result === "team1" ? "1 — 0" : "0 — 1"
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{p2}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
  return (
    <div className="space-y-8">
      {playoffBracket.winnerRounds.map((r: { matches: MatchRow[] }, i: number) =>
        renderRound(`Winner Bracket — Round ${i + 1}`, i, "winner", r.matches)
      )}
      {playoffBracket.loserRounds.map((r: { matches: MatchRow[] }, i: number) =>
        renderRound(`Loser Bracket — Round ${i + 1}`, i, "loser", r.matches)
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">Grand Final</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>WB Champion</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>LB Champion</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{playoffBracket.grandFinal.team1?.name ?? "—"}</TableCell>
              <TableCell>
                {canSetResult &&
                playoffBracket.grandFinal.result === null &&
                (playoffBracket.grandFinal.team1 || playoffBracket.grandFinal.team2) ? (
                  <Select
                    value={playoffBracket.grandFinal.result ?? ""}
                    onValueChange={(v) =>
                      setResult({ roundKind: "grandFinal" }, v as "team1" | "team2")
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team1">1 — 0</SelectItem>
                      <SelectItem value="team2">0 — 1</SelectItem>
                    </SelectContent>
                  </Select>
                ) : playoffBracket.grandFinal.result !== null ? (
                  playoffBracket.grandFinal.result === "team1" ? "1 — 0" : "0 — 1"
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{playoffBracket.grandFinal.team2?.name ?? "—"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
