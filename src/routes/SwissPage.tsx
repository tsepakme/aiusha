import React, { useState } from 'react';

type Player = {
  id: number;
  name: string;
  rating?: number;
  points: number;
  buchholz: number;
  opponents: number[];
  colorHistory: string[];
};

type Match = {
  player1: Player;
  player2?: Player;
  result?: number;
  player1Color: string;
  player2Color?: string;
};

type Round = {
  matches: Match[];
};

type Tournament = {
  players: Player[];
  rounds: Round[];
};

function initializePlayers(namesAndRatings: { name: string; rating?: number }[]): Player[] {
  return namesAndRatings.map((data, index) => ({
    id: index + 1,
    name: data.name,
    rating: data.rating,
    points: 0,
    buchholz: 0,
    opponents: [],
    colorHistory: []
  })).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

function generateFirstRound(players: Player[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      player1: players[i],
      player2: players[i + 1],
      player1Color: 'white',
      player2Color: 'black'
    });
    players[i].colorHistory.push('white');
    players[i + 1].colorHistory.push('black');
  }
  return matches;
}

function generateSwissRound(players: Player[]): Match[] {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points || b.buchholz - a.buchholz);
  const matches: Match[] = [];
  const unmatched: Player[] = [];

  while (sortedPlayers.length > 0) {
    const player = sortedPlayers.shift()!;
    const opponent = sortedPlayers.find(p => !player.opponents.includes(p.id));

    if (opponent) {
      const player1Color = player.colorHistory[player.colorHistory.length - 1] === 'white' ? 'black' : 'white';
      const player2Color = player1Color === 'white' ? 'black' : 'white';

      matches.push({ player1: player, player2: opponent, player1Color, player2Color });
      sortedPlayers.splice(sortedPlayers.indexOf(opponent), 1);
      player.opponents.push(opponent.id);
      opponent.opponents.push(player.id);
      player.colorHistory.push(player1Color);
      opponent.colorHistory.push(player2Color);
    } else {
      unmatched.push(player);
    }
  }

  if (unmatched.length > 0) {
    const outsider = unmatched.pop()!;
    outsider.points += 1;
    matches.push({ player1: outsider, player1Color: 'white', result: 1 });
  }

  return matches;
}

function updateResults(matches: Match[], results: number[]): void {
  matches.forEach((match, index) => {
    const result = results[index];
    if (result === 1) {
      match.player1.points += 1;
    } else if (result === -1 && match.player2) {
      match.player2.points += 1;
    } else if (result === 0 && match.player2) {
      match.player1.points += 0.5;
      match.player2.points += 0.5;
    }
  });

  updateBuchholz(matches);
}

function updateBuchholz(matches: Match[]): void {
  const playerMap = new Map<number, Player>();

  matches.forEach(match => {
    playerMap.set(match.player1.id, match.player1);
    if (match.player2) {
      playerMap.set(match.player2.id, match.player2);
    }
  });

  playerMap.forEach(player => {
    player.buchholz = player.opponents.reduce((sum, opponentId) => {
      const opponent = playerMap.get(opponentId);
      return sum + (opponent ? opponent.points : 0);
    }, 0);
  });
}

function calculateRounds(numPlayers: number): number {
  return Math.ceil(Math.log2(numPlayers));
}

function runTournament(namesAndRatings: { name: string; rating?: number }[]): Tournament {
  const players = initializePlayers(namesAndRatings);
  const tournament: Tournament = { players, rounds: [] };

  const firstRoundMatches = generateFirstRound(players);
  tournament.rounds.push({ matches: firstRoundMatches });

  return tournament;
}

const SwissTournament: React.FC = () => {
  const [players, setPlayers] = useState<{ name: string; rating?: number }[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerRating, setPlayerRating] = useState<string>('');
  const [isFinished, setIsFinished] = useState(false);
  const [roundResults, setRoundResults] = useState<number[][]>([]);

  const addPlayer = () => {
    setPlayers([...players, { name: playerName, rating: playerRating ? parseInt(playerRating) : undefined }]);
    setPlayerName('');
    setPlayerRating('');
  };

  const startTournament = () => {
    const newTournament = runTournament(players);
    setTournament(newTournament);
    setRoundResults(newTournament.rounds.map(() => []));
  };

  const handleResultChange = (roundIndex: number, matchIndex: number, result: number) => {
    const newRoundResults = [...roundResults];
    newRoundResults[roundIndex][matchIndex] = result;
    setRoundResults(newRoundResults);
  };

  const finishRound = (roundIndex: number) => {
    if (tournament) {
      const newTournament = { ...tournament };
      updateResults(newTournament.rounds[roundIndex].matches, roundResults[roundIndex]);
      setTournament(newTournament);
    }
  };

  const nextRound = () => {
    if (tournament && tournament.rounds.length < calculateRounds(tournament.players.length)) {
      finishRound(tournament.rounds.length - 1);
      const newTournament = { ...tournament };
      const newRoundMatches = generateSwissRound(newTournament.players);
      newTournament.rounds.push({ matches: newRoundMatches });
      setTournament(newTournament);
      setRoundResults([...roundResults, []]);
    }
  };

  const finishTournament = () => {
    finishRound(tournament!.rounds.length - 1);
    setIsFinished(true);
  };

  return (
    <div>
      <h1>Swiss System Tournament</h1>

      {!tournament && (
        <div>
          <h2>Add Players</h2>
          <input
            type="text"
            placeholder="Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Player Rating (optional)"
            value={playerRating}
            onChange={(e) => setPlayerRating(e.target.value)}
          />
          <button onClick={addPlayer}>Add Player</button>
        </div>
      )}

      {!tournament && (
        <div>
          <h2>Players</h2>
          <ul>
            {players.map((player, index) => (
              <li key={index}>
                {player.name} {player.rating ? `(Rating: ${player.rating})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!tournament && <button onClick={startTournament}>Start Tournament</button>}

      {tournament && (
        <div>
          <h2>Results</h2>
          {tournament.rounds.map((round, roundIndex) => (
            <div key={roundIndex}>
              <h3>Round {roundIndex + 1}</h3>
              <ul>
                {round.matches.map((match, matchIndex) => (
                  <li key={matchIndex}>
                    {match.player1.name} ({match.player1Color}) vs {match.player2?.name || 'Bye'} ({match.player2Color || 'N/A'}) -{' '}
                    {match.player2 ? (
                      <select onChange={(e) => handleResultChange(roundIndex, matchIndex, parseInt(e.target.value))}>
                        <option value="">Select Result</option>
                        <option value="1">{match.player1.name} Wins</option>
                        <option value="-1">{match.player2?.name} Wins</option>
                        <option value="0">Draw</option>
                      </select>
                    ) : (
                      'Win by default'
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {tournament.rounds.length < calculateRounds(tournament.players.length) && (
            <button onClick={nextRound}>Next Round</button>
          )}

          {tournament.rounds.length === calculateRounds(tournament.players.length) && !isFinished && (
            <button onClick={finishTournament}>Finish Tournament</button>
          )}

          {isFinished && (
            <div>
              <h3>Final Standings</h3>
              <ul>
                {tournament.players
                  .sort((a, b) => b.points - a.points || b.buchholz - a.buchholz)
                  .map((player) => (
                    <li key={player.id}>
                      {player.name} - Points: {player.points}, Buchholz: {player.buchholz}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwissTournament;