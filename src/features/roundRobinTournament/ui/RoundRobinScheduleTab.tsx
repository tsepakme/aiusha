import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import { Button } from "@/shared/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import { useRoundRobinContext } from "../model/RoundRobinContext";
import type { MatchResult } from "@/entities/tournament/model/roundRobin";

export const RoundRobinScheduleTab: React.FC = () => {
  const {
    rounds,
    initialTeams,
    results,
    phase,
    setResult,
    confirmRound,
    isRoundConfirmed,
  } = useRoundRobinContext();

  if (phase === "setup" || !rounds || !initialTeams) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Add at least 3 players and start the tournament from the Players tab.
      </p>
    );
  }

  const byId = new Map(initialTeams.map((t) => [t.id, t]));

  return (
    <div className="space-y-8">
      {rounds.map((round) => {
        const confirmed = isRoundConfirmed(round.index);
        const roundResults = results[round.index] ?? {};
        const allEntered = round.matches.every(
          (m, i) =>
            m.team2 === null ||
            roundResults[i] === "team1" ||
            roundResults[i] === "team2" ||
            roundResults[i] === "draw"
        );
        const canConfirm = !confirmed && allEntered;

        return (
          <div key={round.index}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Round {round.index + 1}</h3>
              {confirmed ? (
                <span className="text-sm text-muted-foreground">Confirmed</span>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={!canConfirm}
                  onClick={() => confirmRound(round.index)}
                  title={
                    !allEntered
                      ? "Enter result for every match"
                      : undefined
                  }
                >
                  Confirm round
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Team 1</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Team 2</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {round.matches.map((match, matchIndex) => {
                  const name1 = byId.get(match.team1)?.name ?? match.team1;
                  const name2 =
                    match.team2 === null ? "Bye" : (byId.get(match.team2)?.name ?? match.team2);
                  const res = roundResults[matchIndex];

                  return (
                    <TableRow key={match.id}>
                      <TableCell>{name1}</TableCell>
                      <TableCell>
                        {match.team2 === null ? (
                          "1 — 0 (bye)"
                        ) : confirmed ? (
                          res === "team1"
                            ? "1 — 0"
                            : res === "team2"
                              ? "0 — 1"
                              : "½ — ½"
                        ) : (
                          <Select
                            value={res ?? ""}
                            onValueChange={(v) =>
                              setResult(round.index, matchIndex, (v || null) as MatchResult)
                            }
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="team1">1 — 0</SelectItem>
                              <SelectItem value="team2">0 — 1</SelectItem>
                              <SelectItem value="draw">½ — ½</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>{name2}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};
