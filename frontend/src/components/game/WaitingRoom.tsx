/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Share2,
  Users,
  Clock,
  Settings,
  X,
  ArrowLeft,
} from "lucide-react";
import { useGetGameRoomDetails } from "@/hooks/queries/useGameRoom";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../ui/loader";
import { routes } from "@/utils/constants/routes";
import { toast } from "sonner";
import socket from "@/lib/socket";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { ConfirmDialog } from "../ui-elements/Dialog";
import { formatTime } from "@/utils/helpers/generalHelpers";

interface WaitingRoomProps {
  gameCode?: string;
  gameName?: string;
  creatorName?: string;
  onGameStart?: () => void;
  onLeaveRoom?: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = () => {
  const { gameId } = useParams();
  const userData = LocalStorageGetItem("userData");
  const { data, isLoading } = useGetGameRoomDetails(Number(gameId));
  const [isLeaving, setIsLeaving] = useState(false);
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
  const [isPlayer2Joined, setIsPlayer2Joined] = useState(false);
  const [gameStartCountdown, setGameStartCountdown] = useState(0);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const navigate = useNavigate();

  const copyGameCode = () => {
    navigator.clipboard.writeText(data?.roomCode);
    toast.success("Game code copied! Share this code with your opponent");
  };

  const shareRoom = () => {
    const shareData = {
      title: "Chess Game Invitation",
      text: `Join my chess game! Use code: ${data?.roomCode}`,
      url: `${window.location.origin}/dashboard?roomCode=${data?.roomCode}`,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(
        `Join my chess game! Use code: ${data?.roomCode} at ${window.location.origin}`
      );
      toast.success("Invitation copied! Share this with your opponent");
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", {
      roomId: Number(gameId),
      userId: userData.id,
    });
    setIsLeaving(true);
  };

  // join Game events
  useSocketEvent("game-start", (res: any) => {
    console.log("Game started in waiting:", res);
    setIsPlayer2Joined(true);
    setIsGameStarting(true);
    setGameStartCountdown(15);
    toast.success(`Player 2 joined the Game! Game starting in 15 seconds...`);
  });

  // naviagate to dashvbaord for user who left the room(current-user)
  useSocketEvent("left-room", (res) => {
    toast.success(`Game is ${res.roomStatus}, You left the room.`);
    socket.disconnect();
    setIsLeaving(false);
    navigate(routes.dashboard);
  });

  // leave player-2 when player1(creator) left
  useSocketEvent("user-left", (res) => {
    toast.success(`Game is ${res.roomStatus}, ${res.username} left the room.`);
    socket.disconnect();
    if (res.isRoomCreatorLeft) {
      navigate(routes.dashboard);
    }
  });

  // room-access event
  useSocketEvent("room-access", (res) => {
    if (!res.accessStatus) {
      toast.error(res.message);
      navigate(routes.dashboard);
    }
  });

  useSocketEvent("error", (res) => {
    toast.error(res.message || "An error occurred.");
  });

  useEffect(() => {
    socket.emit("validate-room-access", { roomId: Number(gameId) });
  }, []);

  // Game start countdown timer
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (isGameStarting && gameStartCountdown > 0) {
      countdownTimer = setTimeout(() => {
        setGameStartCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isGameStarting && gameStartCountdown === 0) {
      // Navigate to game room when countdown reaches 0
      navigate(routes.game(Number(gameId)));
    }

    return () => {
      if (countdownTimer) {
        clearTimeout(countdownTimer);
      }
    };
  }, [isGameStarting, gameStartCountdown, navigate, gameId]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      if (data?.roomCode && userData.id) {
        socket.emit("join-room", {
          code: data?.roomCode,
          userId: userData.id,
        });
      }
    }

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(routes.dashboard)}
                className="hover:bg-secondary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {isGameStarting
                    ? "Game Starting Soon!"
                    : "Waiting for Player"}
                </h1>
                <p className="text-muted-foreground">
                  Game Room: {data?.roomCode}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              // disabled={isGameStarting}
              className="flex items-center gap-2"
              onClick={() => setIsOpenConfirmDialog(true)}
            >
              <X className="h-4 w-4" />
              Leave Room
            </Button>
          </div>

          {/* Game Start Countdown Banner */}
          {isGameStarting && isPlayer2Joined && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold text-green-800">
                      🎉 Both players ready! Game starting in...
                    </h2>
                  </div>
                  <div className="text-6xl font-bold text-green-600 font-mono">
                    {gameStartCountdown}
                  </div>
                  <p className="text-green-700">
                    Get ready for an exciting chess match!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Game Info Card */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Game Information
                </CardTitle>
                <CardDescription>
                  {data?.roomName || `${data?.player1?.username}'s Game`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Game Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Game Code</label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-secondary rounded-lg font-mono text-lg text-center">
                      {data.roomCode}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyGameCode}
                      disabled={isGameStarting}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Share Button */}
                <Button
                  onClick={shareRoom}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                  disabled={isGameStarting}
                >
                  <Share2 className="h-4 w-4" />
                  Share Game Link
                </Button>

                {/* Waiting Time */}
                {/* <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {isGameStarting ? "Game Starting" : "Waiting Time"}
                  </span>
                </div>
                <span className="font-mono text-lg">
                  {isGameStarting
                    ? `${gameStartCountdown}s`
                    : formatTime(waitingTime)}
                </span>
              </div> */}
              </CardContent>
            </Card>

            {/* Players Card */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Players ({isGameStarting && data?.player2?.id ? "2" : "1"}/2)
                </CardTitle>
                <CardDescription>
                  {isGameStarting
                    ? "Both players ready - game starting!"
                    : isGameStarting && data?.player2?.id
                    ? "Player 2 has joined!"
                    : "Waiting for an opponent to join"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Player 1 (Creator) */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {data.player1.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{data.player1.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Room Creator
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Player 1</Badge>
                    <Badge variant="outline">You</Badge>
                  </div>
                </div>

                {/* Player 2 Slot */}
                <div
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    isGameStarting && data?.player2?.id
                      ? "bg-green-50 border-green-200"
                      : "border-dashed border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isGameStarting && data?.player2?.id
                          ? "bg-green-500 text-white"
                          : "bg-muted border-2 border-dashed border-muted-foreground/30"
                      }`}
                    >
                      {isGameStarting && data?.player2?.id ? "✓" : "?"}
                    </div>
                    <div>
                      <div className="font-medium">
                        {isGameStarting && data?.player2?.id
                          ? "Player 2 Joined!"
                          : "Waiting for player..."}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isGameStarting
                          ? "Ready to play!"
                          : isGameStarting && data?.player2?.id
                          ? "Game will start soon..."
                          : "Share the game code"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isGameStarting ? "default" : "secondary"}>
                      Player 2
                    </Badge>
                    {isGameStarting && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Status Message */}
                <div
                  className={`text-center p-4 rounded-lg ${
                    isGameStarting
                      ? "bg-green-50 border border-green-200"
                      : "bg-muted"
                  }`}
                >
                  <div
                    className={`text-sm ${
                      isGameStarting
                        ? "text-green-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isGameStarting
                      ? `🚀 Game starting in ${gameStartCountdown} seconds! Get ready to play!`
                      : isGameStarting
                      ? "🎉 Player 2 has joined! Preparing to start the game..."
                      : "🕐 Share the game code with your opponent or send them the link"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          {!isGameStarting && (
            <Card className="mt-8 border-border">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="font-medium">How to invite a player:</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                        1
                      </div>
                      <span>
                        Copy the game code: <strong>{data.roomCode}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                        2
                      </div>
                      <span>Share it with your opponent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                        3
                      </div>
                      <span>Wait for them to join</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={isOpenConfirmDialog}
        title="Leave Room"
        description="Are you sure you want to leave this room? You will lose your current game progress."
        isLoading={isLeaving}
        onClose={() => setIsOpenConfirmDialog(false)}
        onConfirm={handleLeaveRoom}
      />
    </>
  );
};

export default WaitingRoom;
