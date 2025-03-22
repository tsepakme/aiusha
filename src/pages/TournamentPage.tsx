import React from 'react';
import { ThemeProvider } from "@/shared/theme-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"
import { ModeToggle } from '@/shared/components/mode-toggle';
import { PlayersTab } from '@/features/addPlayer/ui/PlayersTab';
import { TournamentRoundsTab } from '@/features/manageTournament/ui/TournamentRoundsTab';
import { StandingsTab } from '@/features/manageTournament/ui/StandingsTab';
import { useTournament } from '@/features/manageTournament/model/useTournament';
import { Toaster } from 'sonner';

const TournamentPage: React.FC = () => {
  const {
    players,
    tournament,
    isFinished,
    roundResults,
    addPlayer,
    removePlayer,
    startTournament,
    handleResultChange,
    nextRound,
    finishTournament,
    resetTournament
  } = useTournament();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="w-full md:w-1/2 mx-auto p-4">
        <div className='w-full flex justify-between items-top my-5'>
          <div className=''>
            <h1 className='text-lg font-bold'>Swiss System Tournament</h1>
            <p className='text-base mt-2'>
              Ideal for Chess, but adaptable for Go, Checkers, and other games with black and white sides.
              Supports custom points for various games like football, tennis, darts, etc.
            </p>
          </div>
          <div>
            <ModeToggle />
          </div>
        </div>
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>          
          <TabsContent value="players">
            <PlayersTab 
              players={players}
              tournament={tournament}
              onAddPlayer={addPlayer}
              onRemovePlayer={removePlayer}
              onStartTournament={startTournament}
              onResetPlayers={resetTournament}
            />
          </TabsContent>          
          <TabsContent value="rounds">
            <TournamentRoundsTab 
              tournament={tournament}
              roundResults={roundResults}
              isFinished={isFinished}
              onResultChange={handleResultChange}
              onNextRound={nextRound}
              onFinishTournament={finishTournament}
              onResetTournament={resetTournament}
            />
          </TabsContent>          
          <TabsContent value="standings">
            <StandingsTab 
              tournament={tournament}
              isFinished={isFinished}
              onResetTournament={resetTournament}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
};

export default TournamentPage;
