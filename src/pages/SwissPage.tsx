import React from 'react';
import { ThemeProvider } from "@/shared/theme-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"
import { PlayersTab } from '@/features/addPlayer/ui/PlayersTab';
import { SwissRoundsTab } from '@/features/swissTournament/ui/SwissRoundsTab';
import { StandingsTab } from '@/features/swissTournament/ui/StandingsTab';
import { SwissProvider } from '@/features/swissTournament/model/SwissContext';
import { Toaster } from 'sonner';

const SwissPage: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SwissProvider>
        <div className="w-full md:w-1/2 mx-auto p-4">
          <div className='w-full flex justify-between items-top my-5'>
            <div className=''>
              <h1 className='text-lg font-bold'>Swiss System Tournament</h1>
              <p className='text-base mt-2'>
                Ideal for Chess, but adaptable for Go, Checkers, and other games with black and white sides.
                Supports custom points for various games like football, tennis, darts, etc.
              </p>
            </div>
          </div>
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="rounds">Rounds</TabsTrigger>
              <TabsTrigger value="standings">Standings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="players">
              <PlayersTab />
            </TabsContent>
            
            <TabsContent value="rounds">
              <SwissRoundsTab />
            </TabsContent>
            
            <TabsContent value="standings">
              <StandingsTab />
            </TabsContent>
          </Tabs>
        </div>
        <Toaster position="bottom-right" />
      </SwissProvider>
    </ThemeProvider>
  );
};

export default SwissPage;
