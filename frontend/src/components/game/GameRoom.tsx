import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Users, Clock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateGameRoom } from "@/hooks/queries/useGameRoom";
import { routes } from "@/utils/constants/routes";
import socket from "@/lib/socket";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { toast } from "sonner";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import Cookies from "js-cookie";
import { stat } from "fs";

export function GameRoom() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const userData = LocalStorageGetItem("userData");
  const [gameCode, setGameCode] = useState(
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [isJoining, setIsJoining] = useState(false);
  const [gameName, setGameName] = useState("");
  const [joinCode, setJoinCode] = useState(roomCode || "");
  const navigate = useNavigate();

  const createGameRoomMutation = useCreateGameRoom();

  const generateGameCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameCode(code);
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast("Game code copied!", {
      description: "Share this code with your opponent",
    });
  };

  const handleCreateGame = async () => {
    const gameData = {
      code: gameCode,
      ...(gameName && { name: gameName }),
    };

    const response = await createGameRoomMutation.mutateAsync(gameData);
    const room = response.data.data.gameRoom;

    if (room.player1Id) {
      if (!socket.connected) {
        socket.auth.token = Cookies.get("accessToken") || "";
        socket.connect();
      }

      socket.emit("join-room", { code: room.roomCode, userId: userData.id });
    }
  };

  const handleJoinGame = () => {
    if (!joinCode) return;

    if (!socket.connected) {
      socket.auth.token = Cookies.get("accessToken") || "";
      socket.connect();
    }

    socket.emit("join-room", { code: joinCode, userId: userData.id });
    setIsJoining(true);
  };

  useSocketEvent("joined-room", (res) => {
    console.log(res, "user-joiend redirect him");
    setIsJoining(false);
    toast.success(`You have joined room as a ${res.role} successfully.`);
    navigate(
      res.role === "spectator"
        ? routes.game(res.room.id)
        : routes.waitingRoom(res.room.id)
    );
  });

  useSocketEvent("error", (res) => {
    toast.success(res.message || "An error occurred while joining the room.");
  });

  useSocketEvent("room-full", (res) => {
    toast.error(res.message || "This room is full. Please try another one.");
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Game Room</h1>
          <p className="text-muted-foreground">
            Create a new game or join an existing one
          </p>
        </div>

        {/* <div className="grid lg:grid-cols-1 gap-8 "> */}
        <div className="flex justify-center items-center">
          <Card className="border-border min-w-[30vw] min-h-[30vh]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Game Options
              </CardTitle>
              <CardDescription>Set up your chess match</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="join" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="join">Join Game</TabsTrigger>
                  <TabsTrigger value="create">Create Game</TabsTrigger>
                </TabsList>

                <TabsContent value="join" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="join-code">Game Code</Label>
                      <Input
                        id="join-code"
                        value={joinCode}
                        onChange={(e) =>
                          setJoinCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter 6-digit game code"
                        maxLength={6}
                      />
                    </div>

                    <Button
                      onClick={handleJoinGame}
                      className="w-full"
                      disabled={!joinCode}
                      isLoading={isJoining}
                    >
                      Join Game
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="game-name">Game Name</Label>
                      <Input
                        id="game-name"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        placeholder="Enter game name"
                        disabled={createGameRoomMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Game Code</Label>
                      <div className="flex gap-2">
                        <Input value={gameCode} readOnly className="bg-muted" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyGameCode}
                          disabled={createGameRoomMutation.isPending}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={generateGameCode}
                          disabled={createGameRoomMutation.isPending}
                        >
                          New Code
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateGame}
                      className="w-full"
                      disabled={createGameRoomMutation.isPending}
                    >
                      {createGameRoomMutation.isPending
                        ? "Creating Game..."
                        : "Create Game"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Quick Match
              </CardTitle>
              <CardDescription>
                Find a random opponent instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Blitz (5 min)</div>
                    <div className="text-sm text-muted-foreground">
                      Fast-paced games
                    </div>
                  </div>
                  <Button variant="outline">Find Match</Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Rapid (10 min)</div>
                    <div className="text-sm text-muted-foreground">
                      Balanced gameplay
                    </div>
                  </div>
                  <Button variant="outline">Find Match</Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Classical (30 min)</div>
                    <div className="text-sm text-muted-foreground">
                      Deep thinking time
                    </div>
                  </div>
                  <Button variant="outline">Find Match</Button>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
