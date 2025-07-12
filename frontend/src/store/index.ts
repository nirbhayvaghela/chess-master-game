import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types
interface MoveHistoryItem {
  before: string;
  after: string;
  color: "w" | "b";
  piece: string;
  from: string;
  to: string;
  san: string;
  lan: string;
  captured?: string;
}

interface CapturedPieces {
  white: MoveHistoryItem[];
  black: MoveHistoryItem[];
}

interface Spectator {
  username: string;
  id: number;
  email: string;
}

interface ChessGameState {
  // State
  fen: string;
  moveHistory: MoveHistoryItem[];
  capturedPieces: CapturedPieces;
  spectatorList: Spectator[];

  // Actions
  addMove: (move: MoveHistoryItem) => void;
  setFen: (fen: string) => void;
  setMoveHistory: (history: MoveHistoryItem[]) => void;
  clearMoveHistory: () => void;

  setCapturedPieces: (pieces: CapturedPieces) => void;
  updateCapturedPiecesToStore: (
    capturedWhite: MoveHistoryItem[],
    capturedBlack: MoveHistoryItem[]
  ) => void;
  clearCapturedPieces: () => void;

  addSpectator: (spectator: Spectator) => void;
  removeSpectator: (spectatorId: number) => void;
  setSpectatorList: (spectators: Spectator[]) => void;
  clearSpectatorList: () => void;

  // Reset all game state
  resetGameState: () => void;
}

const initialCapturedPieces: CapturedPieces = {
  white: [],
  black: [],
};

export const useChessGameStore = create<ChessGameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      fen: "",
      moveHistory: [],
      capturedPieces: initialCapturedPieces,
      spectatorList: [],

      // Move history actions
      addMove: (move) =>
        set(
          (state) => ({
            moveHistory: [...state.moveHistory, move],
          }),
          false,
          "addMove"
        ),

      setFen: (fen) => set({ fen }, false, "setFen"),

      setMoveHistory: (history) =>
        set({ moveHistory: history }, false, "setMoveHistory"),

      clearMoveHistory: () =>
        set({ moveHistory: [] }, false, "clearMoveHistory"),

      // Captured pieces actions
      setCapturedPieces: (pieces) =>
        set({ capturedPieces: pieces }, false, "setCapturedPieces"),

      updateCapturedPiecesToStore: (capturedWhite, capturedBlack) =>
        set(
          {
            capturedPieces: {
              white: capturedWhite,
              black: capturedBlack,
            },
          },
          false,
          "updateCapturedPiecesToStore"
        ),

      clearCapturedPieces: () =>
        set(
          { capturedPieces: initialCapturedPieces },
          false,
          "clearCapturedPieces"
        ),

      // Spectator actions
      addSpectator: (spectator) =>
        set(
          (state) => {
            // Check if spectator already exists
            const exists = state.spectatorList.some(
              (s) => s.id === spectator.id
            );
            if (exists) return state;

            return {
              spectatorList: [...state.spectatorList, spectator],
            };
          },
          false,
          "addSpectator"
        ),

      removeSpectator: (spectatorId) =>
        set(
          (state) => ({
            spectatorList: state.spectatorList.filter(
              (s) => s.id !== spectatorId
            ),
          }),
          false,
          "removeSpectator"
        ),

      setSpectatorList: (spectators) =>
        set({ spectatorList: spectators }, false, "setSpectatorList"),

      clearSpectatorList: () =>
        set({ spectatorList: [] }, false, "clearSpectatorList"),

      // Reset all game state
      resetGameState: () =>
        set(
          {
            moveHistory: [],
            capturedPieces: initialCapturedPieces,
            spectatorList: [],
          },
          false,
          "resetGameState"
        ),
    }),
    {
      name: "chess-game-store", // Name for devtools
    }
  )
);
