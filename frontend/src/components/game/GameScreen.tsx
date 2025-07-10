import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChessBoard } from "./ChessBoard";
import { MoveHistory } from "./MoveHistory";
import { CapturedPieces } from "./CapturedPieces";
import { SpectatorList } from "./SpectatorList";
import { ChatPanel } from "./ChatPanel";
import { ArrowLeft, Settings, Flag, X } from "lucide-react";
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

export function GameScreen() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPiecesList, setCapturedPieceList] = useState({
    white: [],
    black: [],
  });
  const userData = LocalStorageGetItem("userData");
  const { data, isLoading } = useGetGameRoomDetails(Number(gameId));

  // const gameId = "ABC123";
  const currentTurn = "White";

  useSocketEvent("error", (res) => {
    toast.error(res.message);
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

  if (isLoading) {
    return <Loader className="w-screen h-screen" size="lg" />;
  }

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId: Number(gameId), userId: userData?.id });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/dashboard/${data?.roomCode}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button> */}
            <div>
              <h1 className="text-2xl font-bold">Game {gameId}</h1>
              <p className="text-muted-foreground">
                {data?.player1?.username} vs {data?.player2?.username}
              </p>
            </div>
          </div>

          <ConfirmDialog
            trigger={
              <Button
                variant="destructive"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Leave Room
              </Button>
            }
            title="Leave Room"
            description="Are you sure you want to leave this room? You will lose your current game progress."
            confirmText="Leave"
            cancelText="Cancel"
            onConfirm={handleLeaveRoom}
          />
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
                    <ChessBoard
                      roomDetails={data}
                      setCapturedPiecesList={setCapturedPieceList}
                      setMoveHistory={setMoveHistory}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Controls */}
            <div className="grid md:grid-cols-2 gap-4">
              <MoveHistory moveHistory={moveHistory} />
              <CapturedPieces capturedPiecesList={capturedPiecesList} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SpectatorList
              roomDetails={data}
              roomSpcatators={data?.spectators}
              isPlayer={
                userData?.id === data?.player1Id ||
                userData?.id === data?.player2Id
              }
            />
            <div className="h-96">
              <ChatPanel gameMessages={data?.messages} roomDetails={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
