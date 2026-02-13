import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import { Button } from "@/shared/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select";
import { useSwissDeContext } from "../model/SwissDeContext";
import { isSwissComplete, SWISS_CONFIG } from "@/entities/tournament/model/swissDe";

export const SwissTab: React.FC = () => {
  const {
    teams,
    swissRounds,
    swissResults,
    phase,
    canStartPlayoff,
    setSwissResult,
    completeSwissRound,
    startPlayoff,
  } = useSwissDeContext();

  if (phase === "setup" || !teams) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Add players and start the tournament from the Players tab.
      </p>
    );
  }

  const currentRoundIndex = swissRounds.length - 1;
  const currentRound = swissRounds[currentRoundIndex];
  const results = swissResults[currentRoundIndex] ?? [];
  const swissDone = isSwissComplete(teams);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Standings (W–L)</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Wins</TableCell>
              <TableCell>Losses</TableCell>
              <TableCell>Buchholz</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...teams]
              .sort((a, b) => b.wins - a.wins || b.buchholz - a.buchholz)
              .map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.wins}</TableCell>
                  <TableCell>{t.losses}</TableCell>
                  <TableCell>{t.buchholz}</TableCell>
                  <TableCell>
                    {t.wins >= SWISS_CONFIG.maxWins && (
                      <span className="text-green-600 dark:text-green-400">Qualified</span>
                    )}
                    {t.losses >= SWISS_CONFIG.maxLosses && t.wins < SWISS_CONFIG.maxWins && (
                      <span className="text-red-600 dark:text-red-400">Out</span>
                    )}
                    {t.wins < SWISS_CONFIG.maxWins && t.losses < SWISS_CONFIG.maxLosses && (
                      <span className="text-muted-foreground">Active</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {currentRound && phase === "swiss" && (
        <>
          <div>
            <h3 className="text-lg font-medium mb-2">Round {currentRoundIndex + 1}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Team 1</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Team 2</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRound.matches.map((m, matchIndex) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.team1.name}</TableCell>
                    <TableCell>
                      {m.team2 === null ? (
                        "Bye (1–0)"
                      ) : (
                        <Select
                          value={results[matchIndex] ?? ""}
                          onValueChange={(v) =>
                            setSwissResult(currentRoundIndex, matchIndex, v as "team1" | "team2")
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
                      )}
                    </TableCell>
                    <TableCell>{m.team2?.name ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => completeSwissRound(currentRoundIndex)}
              variant="default"
            >
              Complete round
            </Button>
            {swissDone && canStartPlayoff && (
              <Button type="button" onClick={() => startPlayoff()} variant="secondary">
                Start playoff
              </Button>
            )}
          </div>
        </>
      )}

      {phase === "swiss" && swissDone && !canStartPlayoff && (
        <p className="text-muted-foreground">Swiss complete. Start playoff from the Playoff tab.</p>
      )}
    </div>
  );
};
