import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs";
import { RoundRobinProvider } from '@/features/manageRoundRobin/model/RoundRobinContext';
import { RRPlayersTab } from '@/features/manageRoundRobin/ui/RRPlayersTab';
import { RoundRobinRoundsTab } from '@/features/manageRoundRobin/ui/RoundRobinRoundsTab';
import { RoundRobinStandingsTab } from '@/features/manageRoundRobin/ui/RoundRobinStandingsTab';

const RoundRobinPage: React.FC = () => {
  return (
    <RoundRobinProvider>
      <div className="w-full md:w-1/2 mx-auto p-4">
        <div className='w-full flex justify-between items-top my-5'>
          <div className=''>
            <h1 className='text-lg font-bold'>Round-Robin Tournament</h1>
            <p className='text-base mt-2'>
              In a round-robin tournament, each participant plays against every other participant. 
              This system is common in chess championships, football leagues, and many other sports.
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
            <RRPlayersTab />
          </TabsContent>

          <TabsContent value="rounds">
            <RoundRobinRoundsTab />
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