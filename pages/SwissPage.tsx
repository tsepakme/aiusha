import React, { useState } from 'react';

type Player = {
  id: number;
  name: string;
  points: number;
}

const SwissPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [rounds, setRounds] = useState<number[][][]>([]);

  const addPlayer = () => {
    if (newPlayer.trim()) {
      setPlayers([...players, { id: players.length, name: newPlayer, points: 0 }]);
      setNewPlayer('');
    }
  };

  const generatePairings = () => {
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    const newRound: number[][] = [];
    for (let i = 0; i < sortedPlayers.length; i += 2) {
      if (i + 1 < sortedPlayers.length) {
        newRound.push([sortedPlayers[i].id, sortedPlayers[i + 1].id]);
      } else {
        newRound.push([sortedPlayers[i].id]);
      }
    }
    setRounds([...rounds, newRound]);
  };

  return (
    <div className="swiss-page">
      <h1>Swiss System Pairings</h1>
      <input
        type="text"
        value={newPlayer}
        onChange={(e) => setNewPlayer(e.target.value)}
        placeholder="Add a new player"
      />
      <button onClick={addPlayer}>Add Player</button>
      <button onClick={generatePairings}>Generate Pairings</button>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.name} - {player.points} points</li>
        ))}
      </ul>
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex}>
          <h2>Round {roundIndex + 1}</h2>
          <ul>
            {round.map((pair, pairIndex) => (
              <li key={pairIndex}>
                {pair.map((playerId) => players.find((p) => p.id === playerId)?.name).join(' vs ')}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SwissPage;