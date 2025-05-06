import React from 'react';
import { StockfishBoard } from '@/features/stockfish/ui/StockfishBoard';

const StockfishPage: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className='w-full flex justify-between items-top my-5'>
        <div className=''>
          <h1 className='text-lg font-bold'>Stockfish Chess Engine</h1>
          <p className='text-base mt-2'>
            Analyze positions, play against the engine, or test your skills against one of the 
            strongest chess engines in the world.
          </p>
        </div>
      </div>
      
      <StockfishBoard />
    </div>
  );
};

export default StockfishPage;