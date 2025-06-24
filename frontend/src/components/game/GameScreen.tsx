
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChessBoard } from "./ChessBoard";
import { MoveHistory } from "./MoveHistory";
import { CapturedPieces } from "./CapturedPieces";
import { SpectatorList } from "./SpectatorList";
import { ChatPanel } from "./ChatPanel";
import { ArrowLeft, Settings, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GameScreen() {
  const navigate = useNavigate();
  const gameId = "ABC123"; // This would come from URL params
  const currentTurn = "White";
  const player1 = "Alice Johnson";
  const player2 = "Bob Smith";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Game {gameId}</h1>
              <p className="text-muted-foreground">{player1} vs {player2}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {currentTurn}'s Turn
            </Badge>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Flag className="h-4 w-4" />
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
                    <ChessBoard />
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
            <SpectatorList />
            <div className="h-96">
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
