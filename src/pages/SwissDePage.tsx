import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs";
import { SwissDeProvider, useSwissDeContext } from "@/features/swissDeTournament/model/SwissDeContext";
import { SwissDePlayersTab } from "@/features/swissDeTournament/ui/SwissDePlayersTab";
import { SwissTab } from "@/features/swissDeTournament/ui/SwissTab";
import { PlayoffTab } from "@/features/swissDeTournament/ui/PlayoffTab";
import DeleteConfirmationDialog from "@/shared/components/DeleteConfirmationDialog";

const SwissDePageHeader: React.FC = () => {
  const { phase, resetTournament } = useSwissDeContext();
  const showReset = phase !== "setup";

  return (
    <div className="w-full flex flex-wrap justify-between items-start gap-4 my-5">
      <div>
        <h1 className="text-lg font-bold">Swiss Double Elimination</h1>
        <p className="text-base mt-2 text-muted-foreground">
          Swiss stage (first to 3 wins / 3 losses), then double elimination playoff.
          Min 8 participants (8, 16, 32, …).
        </p>
      </div>
      {showReset && (
        <DeleteConfirmationDialog
          onConfirm={resetTournament}
          value="Start over"
          variant="outline"
          description="All tournament data (players, Swiss stage, playoff) will be deleted. You can add players and start a new tournament."
          confirmLabel="Start over"
        />
      )}
    </div>
  );
};

const SwissDePage: React.FC = () => {
  return (
    <SwissDeProvider>
      <div className="w-full max-w-3xl mx-auto p-4">
        <SwissDePageHeader />
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="swiss">Swiss</TabsTrigger>
            <TabsTrigger value="playoff">Playoff</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <SwissDePlayersTab />
          </TabsContent>
          <TabsContent value="swiss">
            <SwissTab />
          </TabsContent>
          <TabsContent value="playoff">
            <PlayoffTab />
          </TabsContent>
        </Tabs>
      </div>
    </SwissDeProvider>
  );
};

export default SwissDePage;
