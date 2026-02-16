import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs";
import { RoundRobinProvider, useRoundRobinContext } from "@/features/roundRobinTournament/model/RoundRobinContext";
import { RoundRobinPlayersTab } from "@/features/roundRobinTournament/ui/RoundRobinPlayersTab";
import { RoundRobinScheduleTab } from "@/features/roundRobinTournament/ui/RoundRobinScheduleTab";
import { RoundRobinStandingsTab } from "@/features/roundRobinTournament/ui/RoundRobinStandingsTab";
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";

const RoundRobinPageHeader: React.FC = () => {
  const { phase, resetTournament } = useRoundRobinContext();
  const showReset = phase !== "setup";

  return (
    <div className="w-full flex flex-wrap justify-between items-start gap-4 my-5">
      <div>
        <h1 className="text-lg font-bold">Round Robin</h1>
        <p className="text-base mt-2 text-muted-foreground">
          Everyone plays everyone once. Min 3 participants. Results → Confirm round → standings update.
        </p>
      </div>
      {showReset && (
        <DeleteConfirmationDialog
          onConfirm={resetTournament}
          value="Start over"
          variant="outline"
          description="All tournament data will be deleted. You can add players and start a new tournament."
          confirmLabel="Start over"
        />
      )}
    </div>
  );
};

const RoundRobinPage: React.FC = () => {
  return (
    <RoundRobinProvider>
      <div className="w-full max-w-3xl mx-auto p-4">
        <RoundRobinPageHeader />
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <RoundRobinPlayersTab />
          </TabsContent>
          <TabsContent value="schedule">
            <RoundRobinScheduleTab />
          </TabsContent>
          <TabsContent value="standings">
            <RoundRobinStandingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </RoundRobinProvider>
  );
};

export default RoundRobinPage;
