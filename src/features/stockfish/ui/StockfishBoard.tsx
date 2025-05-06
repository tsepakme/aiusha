import React, { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { Button } from "@/shared/components/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/tooltip";
import { Separator } from '@/shared/components/separator';
import { Loader2, RotateCcw, Copy } from 'lucide-react';

export const StockfishBoard: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [thinking, setThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [engineLevel, setEngineLevel] = useState('20');
  const [depth, setDepth] = useState('15');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [bestMoveArrow, setBestMoveArrow] = useState<[Square, Square] | null>(null);
  
  // Reference to the Stockfish worker
  const stockfishRef = useRef<Worker | null>(null);
  
  // Initialize Stockfish worker
  useEffect(() => {
    // Create the worker
    const worker = new Worker('/stockfish.js');
    stockfishRef.current = worker;
    
    // Set up the event listener for messages from the worker
    worker.addEventListener('message', (e) => {
      const message = e.data;
      
      // Parse evaluation info
      if (message.includes('info depth') && message.includes('score cp')) {
        const scoreMatch = message.match(/score cp (-?\d+)/);
        const depthMatch = message.match(/depth (\d+)/);
        
        if (scoreMatch && depthMatch) {
          const score = parseInt(scoreMatch[1]) / 100;
          const currentDepth = parseInt(depthMatch[1]);
          
          // Only update for the requested depth or final result
          if (currentDepth >= parseInt(depth)) {
            setEvaluation(score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2));
            setThinking(false);
          }
        }
      }
      
      // Parse checkmate info
      if (message.includes('info depth') && message.includes('score mate')) {
        const mateMatch = message.match(/score mate (\d+)/);
        if (mateMatch) {
          setEvaluation(`Mate in ${mateMatch[1]}`);
          setThinking(false);
        }
      }
      
      // Parse best move info
      if (message.includes('bestmove')) {
        const moveMatch = message.match(/bestmove ([a-h][1-8][a-h][1-8])/);
        if (moveMatch) {
          const move = moveMatch[1];
          const from = move.substring(0, 2) as Square;
          const to = move.substring(2, 4) as Square;
          setBestMoveArrow([from, to]);
        }
      }
    });
    
    // Configure the engine
    worker.postMessage('uci');
    worker.postMessage('isready');
    setEngineOptions(worker, engineLevel);
    
    return () => {
      worker.terminate();
    };
  }, []);
  
  // Update engine settings when level changes
  useEffect(() => {
    if (stockfishRef.current) {
      setEngineOptions(stockfishRef.current, engineLevel);
    }
  }, [engineLevel]);
  
  // Set engine options based on level
  const setEngineOptions = (worker: Worker, level: string) => {
    // Reset any previous settings
    worker.postMessage('setoption name Skill Level value 20');
    worker.postMessage('setoption name UCI_LimitStrength value false');
    
    // Set new level
    const levelNum = parseInt(level);
    if (levelNum < 20) {
      worker.postMessage(`setoption name Skill Level value ${level}`);
      worker.postMessage('setoption name UCI_LimitStrength value true');
      
      // Map skill level 0-20 to ELO 1000-2800
      const elo = 1000 + (levelNum * 90);
      worker.postMessage(`setoption name UCI_Elo value ${elo}`);
    }
  };
  
  // Function to evaluate the current position
  const evaluatePosition = () => {
    if (!stockfishRef.current) return;
    
    setThinking(true);
    stockfishRef.current.postMessage(`position fen ${fen}`);
    stockfishRef.current.postMessage(`go depth ${depth}`);
  };
  
  // Function to make the engine play the best move
  const makeEngineBestMove = () => {
    if (!stockfishRef.current || game.isGameOver()) return;
    
    setThinking(true);
    stockfishRef.current.postMessage(`position fen ${fen}`);
    stockfishRef.current.postMessage(`go depth ${depth}`);
    
    // Listen for the best move and make it
    const handler = (e: MessageEvent) => {
      const message = e.data;
      if (message.includes('bestmove')) {
        const moveMatch = message.match(/bestmove ([a-h][1-8][a-h][1-8])/);
        if (moveMatch) {
          const move = moveMatch[1];
          const from = move.substring(0, 2) as Square;
          const to = move.substring(2, 4) as Square;
          
          makeMove({ from, to });
          setBestMoveArrow(null);
          setThinking(false);
          
          // Remove this event listener after making the move
          stockfishRef.current?.removeEventListener('message', handler);
        }
      }
    };
    
    stockfishRef.current.addEventListener('message', handler);
  };
  
  // Function to handle user moves
  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });
      
      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setFen(newGame.fen());
        setMoveHistory([...moveHistory, move.san]);
        setBestMoveArrow(null);
        setEvaluation(null);
        return true;
      }
    } catch {
      return false;
    }
    
    return false;
  };
  
  // Function for programmatic moves
  const makeMove = ({ from, to }: { from: Square; to: Square }) => {
    try {
      const move = game.move({
        from,
        to,
        promotion: 'q' // Always promote to queen for simplicity
      });
      
      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setFen(newGame.fen());
        setMoveHistory([...moveHistory, move.san]);
        return true;
      }
    } catch {
      return false;
    }
    
    return false;
  };
  
  // Function to reset the game
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setEvaluation(null);
    setBestMoveArrow(null);
  };
  
  // Function to flip the board
  const flipBoard = () => {
    setOrientation(orientation === 'white' ? 'black' : 'white');
  };
  
  // Function to copy FEN to clipboard
  const copyFen = () => {
    navigator.clipboard.writeText(fen);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chess board column */}
      <div className="lg:col-span-2 flex flex-col items-center">
        <div className="w-full max-w-[600px]">
          <Chessboard 
            id="stockfish-board" 
            position={fen} 
            boardWidth={Math.min(600, window.innerWidth - 40)}
            onPieceDrop={onDrop}
            boardOrientation={orientation}
            areArrowsAllowed={true}
            customArrows={bestMoveArrow ? [bestMoveArrow] : []}
            customArrowColor="rgba(255, 0, 0, 0.5)"
          />
        </div>
        
        <div className="mt-4 w-full max-w-[600px] flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button onClick={resetGame} variant="outline" size="sm">
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={flipBoard} variant="outline" size="sm">
              Flip Board
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={copyFen} variant="outline" size="sm">
                    <Copy className="mr-1 h-4 w-4" />
                    Copy FEN
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy the current position's FEN string</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={evaluatePosition} disabled={thinking}>
              {thinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Evaluate Position
            </Button>
            <Button onClick={makeEngineBestMove} disabled={thinking || game.isGameOver()}>
              {thinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Engine Move
            </Button>
          </div>
        </div>
        
        {/* Game status and evaluation */}
        <div className="mt-4 w-full max-w-[600px]">
          <div className="p-3 border rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Game Status: 
                  <span className={`ml-2 ${game.isCheckmate() ? 'text-red-500' : ''}`}>
                    {game.isCheckmate() ? 'Checkmate!' : 
                     game.isDraw() ? 'Draw!' :
                     game.isCheck() ? 'Check!' : 'Ongoing'}
                  </span>
                </p>
                <p className="text-sm mt-1">Turn: 
                  <span className="ml-2 font-medium">
                    {game.turn() === 'w' ? 'White' : 'Black'}
                  </span>
                </p>
              </div>
              {evaluation && (
                <div className="text-right">
                  <p className="text-sm">Evaluation:</p>
                  <p className={`text-lg font-bold ${
                    evaluation.includes('Mate') ? 'text-red-500' :
                    parseFloat(evaluation) > 0 ? 'text-green-600' : 
                    parseFloat(evaluation) < 0 ? 'text-red-600' : ''
                  }`}>
                    {evaluation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls and move history column */}
      <div className="lg:col-span-1">
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-medium mb-4">Engine Settings</h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="engine-level" className="block text-sm font-medium mb-1">
                Engine Strength
              </label>
              <Select
                value={engineLevel}
                onValueChange={setEngineLevel}
              >
                <SelectTrigger id="engine-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Beginner (Elo ~1450)</SelectItem>
                  <SelectItem value="10">Intermediate (Elo ~1900)</SelectItem>
                  <SelectItem value="15">Advanced (Elo ~2350)</SelectItem>
                  <SelectItem value="20">Maximum (Elo ~2800+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="search-depth" className="block text-sm font-medium mb-1">
                Search Depth
              </label>
              <Select
                value={depth}
                onValueChange={setDepth}
              >
                <SelectTrigger id="search-depth">
                  <SelectValue placeholder="Select depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Fast (10)</SelectItem>
                  <SelectItem value="15">Normal (15)</SelectItem>
                  <SelectItem value="20">Deep (20)</SelectItem>
                  <SelectItem value="25">Very Deep (25)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Higher depth gives better analysis but takes longer.
              </p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h2 className="text-lg font-medium mb-3">Move History</h2>
            {moveHistory.length > 0 ? (
              <div className="border rounded-md p-3 h-[300px] overflow-y-auto">
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <div className="font-medium">#</div>
                  <div className="font-medium">White</div>
                  <div className="font-medium">Black</div>
                  
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                    <React.Fragment key={i}>
                      <div>{i + 1}.</div>
                      <div>{moveHistory[i * 2]}</div>
                      <div>{moveHistory[i * 2 + 1] || ''}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No moves yet.</p>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h2 className="text-lg font-medium mb-2">Position FEN</h2>
            <div className="flex">
              <input 
                type="text" 
                value={fen} 
                readOnly 
                className="w-full text-xs p-2 border rounded-md font-mono bg-muted"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};