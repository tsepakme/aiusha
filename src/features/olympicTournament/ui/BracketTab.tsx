import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select";
import { MatchResult } from "@/entities/tournament/model/tournament";
import type { EliminationMatch } from "@/entities/tournament/model/elimination";
import { useOlympicContext } from "../model/OlympicContext";
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";

function matchCanSetResult(m: EliminationMatch): boolean {
  return (m.player1 != null || m.player2 != null) && m.result === null;
}

function roundLabel(roundIndex: number, totalRounds: number): string {
  if (roundIndex === totalRounds - 1) return "Final";
  if (roundIndex === totalRounds - 2) return "Semi-final";
  return `Round ${roundIndex + 1}`;
}

export const BracketTab: React.FC = () => {
  const { bracket, isFinished, setMatchResult, resetBracket } =
    useOlympicContext();

  if (!bracket) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No bracket yet. Add players and start the bracket from the Players tab.</p>
      </div>
    );
  }

  const totalRounds = bracket.rounds.length;

  return (
    <div>
      <div className="space-y-8">
        {bracket.rounds.map((round, roundIndex) => (
          <div key={roundIndex}>
            <h3 className="text-lg font-medium mb-2">
              {roundLabel(roundIndex, totalRounds)}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Player 1</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Player 2</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {round.matches.map((match, matchIndex) => {
                  const p1 = match.player1?.name ?? "—";
                  const p2 = match.player2?.name ?? "—";
                  const canSet = matchCanSetResult(match) && !isFinished;

                  return (
                    <TableRow key={match.id}>
                      <TableCell>{p1}</TableCell>
                      <TableCell>
                        {canSet ? (
                          <Select
                            value={match.result ?? ""}
                            onValueChange={(value) =>
                              setMatchResult(
                                roundIndex,
                                matchIndex,
                                value as MatchResult
                              )
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={MatchResult.WIN}
                                aria-label="Player 1 wins"
                              >
                                1 — 0
                              </SelectItem>
                              <SelectItem
                                value={MatchResult.LOSS}
                                aria-label="Player 2 wins"
                              >
                                0 — 1
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : match.result === MatchResult.WIN ? (
                          "1 — 0"
                        ) : match.result === MatchResult.LOSS ? (
                          "0 — 1"
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
        ))}
      </div>

      <div className="mt-6">
        <DeleteConfirmationDialog
          onConfirm={resetBracket}
          value="Start new bracket"
          variant="default"
        />
      </div>
    </div>
  );
};
