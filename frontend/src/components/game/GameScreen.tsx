import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChessBoard } from "./ChessBoard";
import { MoveHistory } from "./MoveHistory";
import { CapturedPieces } from "./CapturedPieces";
import { SpectatorList } from "./SpectatorList";
import { ChatPanel } from "./ChatPanel";
import { X } from "lucide-react";
import { FiClipboard, FiCheck } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useGetGameRoomDetails } from "@/hooks/queries/useGameRoom";
import Loader from "../ui/loader";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { toast } from "sonner";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { routes } from "@/utils/constants/routes";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { ConfirmDialog } from "../ui-elements/Dialog";
import { useChessGameStore } from "@/store";

const getGameStatusBadge = (gameStatus: string) => {
  switch (gameStatus) {
    case "waiting":
      return (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
          Waiting for Players
        </Badge>
      );

    case "in_progress":
    case "playing":
      return (
        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
          Game in Progress
        </Badge>
      );

    case "win":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-600"
        >
          You Win! 🎉
        </Badge>
      );

    case "lose":
      return (
        <Badge variant="secondary" className="bg-red-500/10 text-red-600">
          You Lost 😔
        </Badge>
      );

    case "draw":
      return (
        <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
          Draw
        </Badge>
      );

    case "stalemate":
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
          Stalemate
        </Badge>
      );

    case "completed":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
          Game Completed
        </Badge>
      );

    case "aborted":
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-600">
          Game Aborted
        </Badge>
      );

    default:
      return (
        <Badge variant="secondary" className="bg-gray-300 text-gray-700">
          {gameStatus}
        </Badge>
      );
  }
};

export function GameScreen() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const {
    setSpectatorList,
    addMove,
    setMoveHistory,
    setCapturedPieces,
    setMessages,
    addMessage,
  } = useChessGameStore();
  const [gameStatus, setGameStatus] = useState("waiting"); // waiting, playing, completed, draw
  const userData = LocalStorageGetItem("userData");
  const { data, isLoading } = useGetGameRoomDetails(Number(gameId));
  // Determine player colors and roles
  const isPlayer1 = userData?.id === data?.player1Id;
  const isPlayer2 = userData?.id === data?.player2Id;
  const isPlayer = isPlayer1 || isPlayer2;
  const isSpectator = !isPlayer;
  const playerColor = isPlayer1 ? "White" : isPlayer2 ? "Black" : null;

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId: Number(gameId), userId: userData?.id });
    setIsLeaving(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Socket event handlers
  useSocketEvent("error", (res) => {
    toast.error(res.message || "An error occurred.");
  });

  // room-access event
  useSocketEvent("room-access", (res) => {
    if (!res.accessStatus) {
      toast.error(res.message);
      navigate(routes.dashboard);
    }
  });

  useSocketEvent("left-room", (res) => {
    toast.success(
      `You have left the room successfully. Game is ${res.roomStatus}.`
    );
    navigate(routes.dashboard);
  });

  useSocketEvent("user-left", (res) => {
    toast.success(
      `${res.username} has left the room. Game is ${res.roomStatus}.`
    );
    if (res.isPlayerLeft) {
      navigate(routes.dashboard);
    }
  });

  useEffect(() => {
    socket.emit("validate-room-access", { roomId: Number(gameId) });

    // Initialize game status based on room data
    if (data?.status) {
      setGameStatus(data.status);
    }
  }, [gameId, data?.status]);

  useEffect(() => {
    if (data?.roomCode && userData?.id) {
      if (!socket.connected) {
        socket.connect();
        console.log("Socket connected");
        console.log("joining room");
        socket.emit("join-room", {
          code: data.roomCode,
          userId: userData.id,
        });
      }
    }

    if (data?.history.length === 0) {
      setMoveHistory([]);
      setCapturedPieces({ white: [], black: [] });
    }
    if (data?.messages.length === 0) setMessages([]);

    const moveHistory = [];
    const messages = [];
    const blackCaptures = [];
    const whiteCaptures = [];

    for (const moveString of data?.history || []) {
      const move = JSON.parse(moveString);
      moveHistory.push(move);
      if (move.captured) {
        console.log(move.color === "b");
        if (move.color === "b") {
          // Black captured a white piece
          blackCaptures.push(move);
        } else {
          // White captured a black piece
          whiteCaptures.push(move);
        }
      }
    }

    for (const message of data?.messages || []) {
      messages.push({
        message: message.message,
        timestamp: message.timestamp,
        sender: {
          username: message.sender.username,
          id: message.sender.id,
        },
      });
    }

    setMoveHistory(moveHistory);
    setSpectatorList(data?.spectators || []);
    setMessages(messages);
    setCapturedPieces({
      white: whiteCaptures,
      black: blackCaptures,
    });

    // return () => {
    //   if (socket.connected) {
    //     socket.disconnect();
    //   }
    // };
  }, [data]);

  if (isLoading) {
    return <Loader className="w-screen h-screen" size="lg" />;
  }

  return (
    <>
      <div className="min-h-screen bg-background p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold break-words">
                  Room Name: {data?.roomName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground">Room code:</span>
                  <span className="font-semibold text-white">
                    {data?.roomCode}
                  </span>
                  <button
                    onClick={() => handleCopy(data?.roomCode)}
                    className="flex items-center gap-1 px-1 py-0.5 text-xs rounded-md border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                  >
                    {copied ? (
                      <>
                        <FiCheck className="text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <FiClipboard />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="break-all">
                    {data?.player1?.username} vs {data?.player2?.username}
                  </span>
                  {playerColor && (
                    <Badge variant="outline" className="text-xs">
                      You: {playerColor}
                    </Badge>
                  )}
                  {isSpectator && (
                    <Badge variant="outline" className="text-xs">
                      Spectator
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {getGameStatusBadge(gameStatus)}
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => setIsOpenConfirmDialog(true)}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Leave Room</span>
                <span className="xs:hidden">Leave</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Chess Board */}
              <Card className="border-border">
                <CardContent className="p-2 sm:p-4 md:p-6">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl">
                      <ChessBoard
                        roomDetails={data}
                        currentUserId={userData?.id}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Game Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <MoveHistory />
                <CapturedPieces />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 sm:space-y-4">
              <SpectatorList
                roomDetails={data}
                roomSpcatators={data?.spectators}
                isPlayer={isPlayer}
              />
              <div className="h-64 sm:h-80 lg:h-96">
                <ChatPanel roomDetails={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isOpenConfirmDialog}
        title="Leave Room"
        description={
          isPlayer
            ? "Are you sure you want to leave this room? You will lose your current game progress."
            : "Are you sure you want to leave this room?"
        }
        isLoading={isLeaving}
        onClose={() => setIsOpenConfirmDialog(false)}
        onConfirm={handleLeaveRoom}
      />
    </>
  );
}
