import React, { useState } from 'react';

type Player = {
  id: number;
  name: string;
  rating?: number; // Рейтинг необязательный
  points: number; // Очки
  buchholz: number; // Сумма очков противников
  opponents: number[]; // ID противников
};

type Match = {
  player1: Player;
  player2?: Player; // Может быть undefined, если бай
  result?: number; // 1 = победа игрока 1, 0 = ничья, -1 = победа игрока 2
};

type Round = {
  matches: Match[];
};

type Tournament = {
  players: Player[];
  rounds: Round[];
};

// Инициализация игроков
function initializePlayers(namesAndRatings: { name: string; rating?: number }[]): Player[] {
  return namesAndRatings.map((data, index) => ({
    id: index + 1,
    name: data.name,
    rating: data.rating,
    points: 0,
    buchholz: 0, // Изначально Бухгольц равен 0
    opponents: []
  })).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); // Сортируем по рейтингу (если есть)
}

// Формирование пар для первого раунда
function generateFirstRound(players: Player[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      player1: players[i],
      player2: players[i + 1]
    });
  }
  return matches;
}

// Формирование пар для последующих раундов
function generateSwissRound(players: Player[]): Match[] {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points || b.buchholz - a.buchholz); // Сортируем по очкам, затем по Бухгольцу
  const matches: Match[] = [];
  const unmatched: Player[] = [];

  while (sortedPlayers.length > 0) {
    const player = sortedPlayers.shift()!;
    const opponent = sortedPlayers.find(p => !player.opponents.includes(p.id));

    if (opponent) {
      matches.push({ player1: player, player2: opponent });
      sortedPlayers.splice(sortedPlayers.indexOf(opponent), 1);
      player.opponents.push(opponent.id);
      opponent.opponents.push(player.id);
    } else {
      unmatched.push(player);
    }
  }

  // Если остались игроки без пары
  unmatched.forEach(player => matches.push({ player1: player }));

  return matches;
}

// Обновление результатов матчей
function updateResults(matches: Match[], results: number[]): void {
  matches.forEach((match, index) => {
    const result = results[index]; // 1, 0 или -1
    if (result === 1) {
      match.player1.points += 1;
    } else if (result === -1 && match.player2) {
      match.player2.points += 1;
    } else if (result === 0 && match.player2) {
      match.player1.points += 0.5;
      match.player2.points += 0.5;
    }
  });

  // Обновляем Бухгольц после каждого раунда
  updateBuchholz(matches);
}

// Обновление значений Бухгольца
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

// Создание турнира
function runTournament(namesAndRatings: { name: string; rating?: number }[], rounds: number): Tournament {
  const players = initializePlayers(namesAndRatings);
  const tournament: Tournament = { players, rounds: [] };

  for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
    const matches = roundIndex === 0
      ? generateFirstRound(players)
      : generateSwissRound(players);

    tournament.rounds.push({ matches });

    // Здесь вы можете запросить результаты для каждого матча вручную
    const results = matches.map(() => Math.floor(Math.random() * 3) - 1); // Генерация случайных результатов
    updateResults(matches, results);
  }

  return tournament;
}

// initializePlayers, generateFirstRound, generateSwissRound, updateResults

const SwissTournament: React.FC = () => {
  const [players, setPlayers] = useState<{ name: string; rating?: number }[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<number>(3); // Количество раундов
  const [playerName, setPlayerName] = useState('');
  const [playerRating, setPlayerRating] = useState<string>('');

  const addPlayer = () => {
    setPlayers([...players, { name: playerName, rating: playerRating ? parseInt(playerRating) : undefined }]);
    setPlayerName('');
    setPlayerRating('');
  };

  const startTournament = () => {
    const newTournament = runTournament(players, rounds);
    setTournament(newTournament);
  };

  return (
    <div>
      <h1>Swiss System Tournament</h1>

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

      <div>
        <h2>Settings</h2>
        <label>
          Number of Rounds:
          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
          />
        </label>
        <button onClick={startTournament}>Start Tournament</button>
      </div>

      {tournament && (
        <div>
          <h2>Results</h2>
          {tournament.rounds.map((round, roundIndex) => (
            <div key={roundIndex}>
              <h3>Round {roundIndex + 1}</h3>
              <ul>
                {round.matches.map((match, matchIndex) => (
                  <li key={matchIndex}>
                    {match.player1.name} vs {match.player2?.name || 'Bye'} -{' '}
                    {match.result === 1
                      ? `${match.player1.name} Wins`
                      : match.result === -1
                        ? `${match.player2?.name} Wins`
                        : match.result === 0
                          ? 'Draw'
                          : 'Pending'}
                  </li>
                ))}
              </ul>
            </div>
          ))}

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
  );
};

export default SwissTournament;
