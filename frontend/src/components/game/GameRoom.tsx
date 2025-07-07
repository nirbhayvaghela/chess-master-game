import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useCreateGameRoom } from "@/hooks/queries/useGameRoom";
import { routes } from "@/utils/constants/routes";

export function GameRoom() {
  const [gameCode, setGameCode] = useState("ABC123");
  const [gameName, setGameName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  const createGameRoomMutation = useCreateGameRoom();

  const generateGameCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameCode(code);
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast({
      title: "Game code copied!",
      description: "Share this code with your opponent",
    });
  };

  const handleCreateGame = async () => {
    const gameData = {
      code: gameCode,
      ...(gameName && { name: gameName }), 
    };

    const response = await createGameRoomMutation.mutateAsync(gameData);
    if (response.data.data.gameRoom.player1Id) {
      // navigate(`/game/${response.code || gameCode}`);
      navigate(routes.waitingRoom(response.data.data.gameRoom.id));
    }
  };

  const handleJoinGame = () => {
    if (!joinCode) return;

    // For now, navigate directly. You can add join game API call here later
    navigate(`/game/${joinCode}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Game Room</h1>
          <p className="text-muted-foreground">
            Create a new game or join an existing one
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Game Options
              </CardTitle>
              <CardDescription>Set up your chess match</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="create">Create Game</TabsTrigger>
                  <TabsTrigger value="join">Join Game</TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="game-name">Game Name (Optional)</Label>
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
                    >
                      Join Game
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border">
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
          </Card>
        </div>
      </div>
    </div>
  );
}
