import { MatchResult } from "@/entities/tournament/model/tournament";
import {
  EliminationBracket,
  generateEliminationBracket,
  setEliminationMatchResult,
  isBracketFinished,
  getChampion,
} from "@/entities/tournament/model/elimination";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { toast } from "sonner";

type PlayerInput = { name: string; rating?: number };

const STORAGE_KEY_PLAYERS = "olympic_players";
const STORAGE_KEY_BRACKET = "olympic_bracket";

export const useOlympic = () => {
  const [players, setPlayers, removePlayers] = useLocalStorage<PlayerInput[]>(
    STORAGE_KEY_PLAYERS,
    []
  );
  const [bracket, setBracket, removeBracket] =
    useLocalStorage<EliminationBracket | null>(STORAGE_KEY_BRACKET, null);

  const addPlayer = (name: string, rating?: string) => {
    if (!name.trim()) return false;
    setPlayers([
      ...players,
      {
        name: name.trim(),
        rating: rating ? parseInt(rating, 10) : undefined,
      },
    ]);
    return true;
  };

  const removePlayer = (index: number) => {
    if (index < 0 || index >= players.length) return false;
    setPlayers(players.filter((_, i) => i !== index));
    return true;
  };

  const editPlayer = (index: number, name: string, rating?: string) => {
    if (index < 0 || index >= players.length) return false;
    if (!name.trim()) return false;
    const next = [...players];
    next[index] = {
      name: name.trim(),
      rating: rating ? parseInt(rating, 10) : undefined,
    };
    setPlayers(next);
    return true;
  };

  const startBracket = (playersOverride?: PlayerInput[]) => {
    const list = playersOverride ?? players;
    if (list.length < 2) {
      toast.error("Add at least 2 players to start");
      return false;
    }
    const newBracket = generateEliminationBracket(list);
    setBracket(newBracket);
    toast.success("Bracket created");
    return true;
  };

  const setMatchResult = (
    roundIndex: number,
    matchIndex: number,
    result: MatchResult
  ) => {
    if (!bracket) return;
    const next = setEliminationMatchResult(
      bracket,
      roundIndex,
      matchIndex,
      result
    );
    setBracket(next);
    if (isBracketFinished(next)) {
      const champion = getChampion(next);
      if (champion) toast.success(`${champion.name} wins the tournament!`);
    }
  };

  const resetBracket = () => {
    try {
      removePlayers();
      removeBracket();
      setPlayers([]);
      setBracket(null);
      toast.success("Olympic bracket reset");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to reset");
      return false;
    }
  };

  const isFinished = bracket ? isBracketFinished(bracket) : false;
  const champion = bracket ? getChampion(bracket) : null;

  return {
    players,
    bracket,
    isFinished,
    champion,
    addPlayer,
    removePlayer,
    editPlayer,
    startBracket,
    setMatchResult,
    resetBracket,
  };
};
