import React, { useState } from 'react';
import './SwissPage.scss';

type Player = {
  id: number;
  name: string;
  rating?: number;
  points: number;
  buchholzT: number;
  // buchholzCut1: number;
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
    buchholzT: 0,
    // buchholzCut1: 0,
    opponents: [],
    colorHistory: []
  })).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

function generateFirstRound(players: Player[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < players.length; i += 2) {
    if (players[i + 1]) {
      matches.push({
        player1: players[i],
        player2: players[i + 1],
        player1Color: 'white',
        player2Color: 'black'
      });
      players[i].colorHistory.push('white');
      players[i + 1].colorHistory.push('black');
    } else {
      matches.push({
        player1: players[i],
        player1Color: 'white',
        result: 1
      });
      players[i].points += 1;
    }
  }
  return matches;
}

function generateSwissRound(players: Player[]): Match[] {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points || b.buchholzT - a.buchholzT);
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

  // updateBuchholzCut1(matches);
  updateBuchholzT(matches);
}

function updateBuchholzT(matches: Match[]): void {
  const playerMap = new Map<number, Player>();

  // Populate the playerMap with all players
  matches.forEach(match => {
    playerMap.set(match.player1.id, match.player1);
    if (match.player2) {
      playerMap.set(match.player2.id, match.player2);
    }
  });

  // Calculate Buchholz score for each player
  playerMap.forEach(player => {
    player.buchholzT = player.opponents.reduce((sum, opponentId) => {
      const opponent = playerMap.get(opponentId);
      return sum + (opponent ? opponent.points : 0);
    }, 0);
  });
}

// function updateBuchholzCut1(matches: Match[]): void {
//   const playerMap = new Map<number, Player>();

//   matches.forEach(match => {
//     playerMap.set(match.player1.id, match.player1);
//     if (match.player2) {
//       playerMap.set(match.player2.id, match.player2);
//     }
//   });

//   playerMap.forEach(player => {
//     const opponentPoints = player.opponents.map(opponentId => {
//       const opponent = playerMap.get(opponentId);
//       return opponent ? opponent.points : 0;
//     });

//     if (opponentPoints.length > 0) {
//       const minOpponentPoints = Math.min(...opponentPoints);
//       player.buchholzCut1 = player.buchholzT - minOpponentPoints;
//     } else {
//       player.buchholzCut1 = player.buchholzT;
//     }
//   });
// }

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
    if (tournament) {
      const currentRoundResults = roundResults[tournament.rounds.length - 1];
      const allResultsEntered = currentRoundResults.every(result => result !== undefined && result !== null);

      if (!allResultsEntered) {
        alert('Please enter all results before proceeding to the next round.');
        return;
      }

      if (tournament.rounds.length < calculateRounds(tournament.players.length)) {
        finishRound(tournament.rounds.length - 1);
        const newTournament = { ...tournament };
        const newRoundMatches = generateSwissRound(newTournament.players);
        newTournament.rounds.push({ matches: newRoundMatches });
        setTournament(newTournament);
        setRoundResults([...roundResults, []]);
      }
    }
  };

  const finishTournament = () => {
    finishRound(tournament!.rounds.length - 1);
    setIsFinished(true);
  };

  const startNewTournament = () => {
    setPlayers([]);
    setTournament(null);
    setPlayerName('');
    setPlayerRating('');
    setIsFinished(false);
    setRoundResults([]);
  };

  return (
    <div className="swiss-tournament">
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
                  .sort((a, b) => b.points - a.points || b.buchholzT - a.buchholzT)
                  .map((player) => (
                    <li key={player.id}>
                      {player.name} - Points: {player.points}, BucT: {player.buchholzT}
                    </li>
                  ))}
              </ul>
              <button onClick={startNewTournament}>Start New Tournament</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwissTournament;