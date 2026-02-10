import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs";
import { OlympicPlayersTab } from "@/features/olympicTournament/ui/OlympicPlayersTab";
import { BracketTab } from "@/features/olympicTournament/ui/BracketTab";
import { OlympicProvider } from "@/features/olympicTournament/model/OlympicContext";

const OlympicPage: React.FC = () => {
  return (
    <OlympicProvider>
      <div className="w-full max-w-3xl mx-auto p-4">
        <div className="w-full flex justify-between items-top my-5">
          <div>
            <h1 className="text-lg font-bold">Olympic System (Single Elimination)</h1>
            <p className="text-base mt-2 text-muted-foreground">
              Single elimination bracket. Add players, start the bracket, then enter results;
              the winner of each match advances to the next round. Byes are added automatically if the number of players is not a power of 2.
            </p>
          </div>
        </div>
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <OlympicPlayersTab />
          </TabsContent>
          <TabsContent value="bracket">
            <BracketTab />
          </TabsContent>
        </Tabs>
      </div>
    </OlympicProvider>
  );
};

export default OlympicPage;
