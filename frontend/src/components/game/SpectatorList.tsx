/* eslint-disable @typescript-eslint/no-explicit-any */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import socket from "@/lib/socket";
import { routes } from "@/utils/constants/routes";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { set } from "date-fns";
import { X, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SpectatorProp {
  roomDetails: any;
  roomSpcatators: Array<{
    id: number;
    username: string;
    email: string;
    inRoom: boolean;
  }>;
  isPlayer: boolean;
}

export function SpectatorList({ roomDetails, roomSpcatators, isPlayer }: SpectatorProp) {
  const [spectators, setSpectators] = useState(roomSpcatators);
  const navigate = useNavigate();
  const userData = LocalStorageGetItem("userData");
  const handleRemoveSpectator = (spectatorId: number) => {
    socket.emit("remove-spectator", { roomId: roomDetails.id, spectatorId, byUserId: userData.id });
  };

  // user joied event
  useSocketEvent("user-joined", (res) => {
    setSpectators((prev) => [
      ...prev,
      {
        ...res.user,
      },
    ]);
    if(userData.id !== res.user.id) {
      toast.success(`${res.user.username} has joined the game!`)
    }
  });

  // remove spectator events
  // inform to remover
  useSocketEvent("spectator-removed", (res) => {
    setSpectators((prev) => prev.filter((specator) => specator.id != res.spectatorId));
    toast.success(res.message || "Specator removed successfully.");
  })
  // inform to spectator, who have been removed
  useSocketEvent("removed-from-room", (res) => {
    toast.success(res.message || "you have been removed from room");
    socket.disconnect();
    navigate(routes.dashboard);
  }); 
  // spectator kicked off 
  useSocketEvent("spectator-kicked", (res) => {
    setSpectators((prev) => prev.filter((specator) => specator.id != res.spectatorId));
    toast.success(res.message || "spectator kicked off by player.")
  });  

  // left room
  // inform other user execpt to user who are left
  useSocketEvent("user-left", (res) => {
    setSpectators((prev) => prev.filter((specator) => specator.id != res.spectatorId));
    toast.success(res.message || "user left from room.")
  })
  // inform user who is leave 
  useSocketEvent("left-room", (res) => { 
    socket.disconnect();
    toast.success(res.message || "user left successfully.")
    navigate(routes.dashboard);
  });

  return ( 
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Spectators ({spectators.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-48 px-4">
          <div className="space-y-2">
            {spectators.map((spectator) => (
              <div
                key={spectator.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={spectator.username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {spectator.username.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {spectator.username}
                  </div>
                </div>

                {isPlayer && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-60 hover:opacity-100"
                    onClick={() => handleRemoveSpectator(spectator.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
