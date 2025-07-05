// utils/chessState.js
import { Chess } from "chess.js";
import redisClient from ".";

interface LoadGame {
  (roomId: string): Promise<Chess>;
}

interface SaveGame {
  (roomId: string, game: Chess): Promise<void>;
}

const loadGame: LoadGame = async function (roomId) {
  try {
    const fen: string | null = await redisClient.get(`room:${roomId}:fen`);
    const game: Chess = new Chess();
    if (fen) game.load(fen);
    return game;
  } catch (error) {
    console.error("Error loading game state from Redis:", error);
    throw new Error("Failed to load game state");
  }
};

const saveGame: SaveGame = async (roomId, game) => {
  try {
    await redisClient.set(`room:${roomId}:fen`, game.fen());
    await redisClient.rPush(`room:${roomId}:history`, ...game.history());
  } catch (error) {
    console.error("Error saving game state to Redis:", error);
    throw new Error("Failed to save game state");
  }
};

export { loadGame, saveGame };
