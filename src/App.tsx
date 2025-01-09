import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.scss';

const socket = io();

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [player, setPlayer] = useState<'X' | 'O' | null>(null);

  useEffect(() => {
    socket.on('move', (data: { board: string[], isXNext: boolean }) => {
      setBoard(data.board);
      setIsXNext(data.isXNext);
    });

    socket.on('player', (player: 'X' | 'O') => {
      setPlayer(player);
    });

    return () => {
      socket.off('move');
      socket.off('player');
    };
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board) || player !== (isXNext ? 'X' : 'O')) return;

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    socket.emit('move', { board: newBoard, isXNext: !isXNext });
  };

  const calculateWinner = (squares: string[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const status = winner ? `Winner: ${winner}` : `Next player: ${isXNext ? 'X' : 'O'}`;

  const renderSquare = (index: number) => (
    <button className="square" onClick={() => handleClick(index)}>
      {board[index]}
    </button>
  );

  return (
    <div className='greeting'>
      <h1>Hello world</h1>
      <h2>this web page is a testing ground where everything is just being tested</h2>
      <div className='game'>
        <h1>Tic-Tac-Toe</h1>
        <div className='status'>{status}</div>
        <div className='board'>
          <div className='board-row'>
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className='board-row'>
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className='board-row'>
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;