import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/table";
import { useRoundRobinContext } from "../model/RoundRobinContext";

export const RoundRobinStandingsTab: React.FC = () => {
  const { standings, phase, isComplete, champion } = useRoundRobinContext();

  if (phase === "setup") {
    return (
      <p className="text-muted-foreground text-center py-4">
        Start the tournament from the Players tab to see standings.
      </p>
    );
  }

  if (standings.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No standings yet. Confirm rounds in the Schedule tab.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>W</TableCell>
            <TableCell>D</TableCell>
            <TableCell>L</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Buchholz</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((t, i) => (
            <TableRow key={t.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.wins}</TableCell>
              <TableCell>{t.draws}</TableCell>
              <TableCell>{t.losses}</TableCell>
              <TableCell>{t.points}</TableCell>
              <TableCell>
                {t.opponents.length > 0
                  ? standings
                      .filter((s) => t.opponents.includes(s.id))
                      .reduce((sum, s) => sum + s.points, 0)
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
