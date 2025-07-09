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
// import { useNavigate } from 'react-router-dom';
// import { toast } from '@/hooks/use-toast';

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
  const [waitingTime, setWaitingTime] = useState(0);
  const [isPlayer2Joined, setIsPlayer2Joined] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Simulate waiting time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setWaitingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
    })

  };

  // join Game events
  useSocketEvent("game-start", (res: any) => {
    if (res.roomStatus === "in_progress") {
      toast.success(`Player 2 joined the Game, Game will be start soon!.`);
      navigate(routes.game(res.room.id));
    }
  });

  // leave room event
  useSocketEvent("left-room", (res) => {
    if(res.roomStatus === "aborted") {
      toast.success(`Game is aborted, ${res.username} left the room.`);
      socket.disconnect();
      navigate(routes.dashboard);
    }
  });

  // room-access event
  useSocketEvent("room-access", (res) => {
    if (!res.accessStatus) {
      toast.error(res.message);
      navigate(routes.dashboard);
    }
  })

  useSocketEvent("error", (res) => {
    toast.error(res.message || "An error occurred.");
  })

  useEffect(() => {
    socket.emit("validate-room-access", { roomId: Number(gameId) });
  },[])
  
  if (isLoading) {
    return <Loader className="w-screen h-screen" size="lg" />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top">
          {toastMessage}
        </div>
      )}

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
                Waiting for Player
              </h1>
              <p className="text-muted-foreground">
                Game Room: {data?.roomCode}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleLeaveRoom}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Leave Room
          </Button>
        </div>

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
                  <Button variant="outline" size="icon" onClick={copyGameCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Share Button */}
              <Button
                onClick={shareRoom}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Share2 className="h-4 w-4" />
                Share Game Link
              </Button>

              {/* Waiting Time */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Waiting Time</span>
                </div>
                <span className="font-mono text-lg">
                  {formatTime(waitingTime)}
                </span>
              </div>

              {/* Game Settings */}
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Game Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="secondary">10 min</Badge>
                  <Badge variant="secondary">Rated</Badge>
                  <Badge variant="secondary">Public</Badge>
                  <Badge variant="secondary">Standard</Badge>
                </div>
              </div> */}
            </CardContent>
          </Card>

          {/* Players Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Players (1/2)
              </CardTitle>
              <CardDescription>Waiting for an opponent to join</CardDescription>
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
                className={`flex items-center justify-between p-4 rounded-lg border-2 border-dashed transition-all ${
                  isPlayer2Joined
                    ? "bg-green-50 border-green-200"
                    : "border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isPlayer2Joined
                        ? "bg-green-500 text-white"
                        : "bg-muted border-2 border-dashed border-muted-foreground/30"
                    }`}
                  >
                    {isPlayer2Joined ? "?" : "?"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {isPlayer2Joined
                        ? "Player Joined!"
                        : "Waiting for player..."}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isPlayer2Joined
                        ? "Starting game..."
                        : "Share the game code"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isPlayer2Joined ? "default" : "secondary"}>
                    Player 2
                  </Badge>
                  {isPlayer2Joined && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {isPlayer2Joined
                    ? "🎉 Get ready! The game will start shortly..."
                    : "🕐 Share the game code with your opponent or send them the link"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
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
      </div>
    </div>
  );
};

export default WaitingRoom;
