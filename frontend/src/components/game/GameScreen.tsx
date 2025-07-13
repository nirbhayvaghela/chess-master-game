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
  // const [moveHistory, setMoveHistory] = useState([]);
  // const [capturedPiecesList, setCapturedPieceList] = useState({
  //   white: [],
  //   black: [],
  // });
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

  const getGameStatusBadge = () => {
    switch (gameStatus) {
      case "waiting":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-600"
          >
            Waiting for Players
          </Badge>
        );
      // case "playing":
      //   return (
      //     <Badge variant="secondary" className="bg-green-500/10 text-green-600">
      //       {currentTurn}'s Turn
      //     </Badge>
      //   );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            Game Completed
          </Badge>
        );
      case "draw":
        return (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
            Draw
          </Badge>
        );
      case "aborted":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600">
            Game Aborted
          </Badge>
        );
      default:
        return <Badge variant="secondary">{gameStatus}</Badge>;
    }
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

    const blackCaptures = [];
    const whiteCaptures = [];

    for (const moveString of data?.history || []) {
      const move = JSON.parse(moveString);
      addMove(move);
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
    setSpectatorList(data?.spectators || []);

    for (const message of data?.messages || []) {
      addMessage({
        message: message.message,
        timestamp: message.timestamp,
        sender: {
          username: message.sender.username,
          id: message.sender.id,
        },
      });
    }

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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">
                  Room Name: {data?.roomName}
                </h1>
                <div className="flex items-center gap-2 text-sm mt-1">
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>
                    {data?.player1?.username} vs {data?.player2?.username}
                  </span>
                  {playerColor && (
                    <Badge variant="outline" className="ml-2">
                      You: {playerColor}
                    </Badge>
                  )}
                  {isSpectator && (
                    <Badge variant="outline" className="ml-2">
                      Spectator
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getGameStatusBadge()}
              {/* <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              {isPlayer && (
                <Button variant="outline" size="icon">
                  <Flag className="h-4 w-4" />
                </Button>
              )} */}
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => setIsOpenConfirmDialog(true)}
              >
                <X className="h-4 w-4" />
                Leave Room
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chess Board */}
              <Card className="border-border">
                <CardContent className="p-6">
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
              <div className="grid md:grid-cols-2 gap-4">
                <MoveHistory />
                <CapturedPieces />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <SpectatorList
                roomDetails={data}
                roomSpcatators={data?.spectators}
                isPlayer={isPlayer}
              />
              <div className="h-96">
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
