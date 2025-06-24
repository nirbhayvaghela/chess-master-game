
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Eye } from "lucide-react";

export function SpectatorList() {
  const spectators = [
    { id: 1, name: "Alice Johnson", avatar: "", isHost: false },
    { id: 2, name: "Bob Smith", avatar: "", isHost: false },
    { id: 3, name: "Carol Davis", avatar: "", isHost: false },
    { id: 4, name: "David Wilson", avatar: "", isHost: false },
  ];

  const isHost = true; // This would come from props or context

  const handleRemoveSpectator = (spectatorId: number) => {
    console.log(`Removing spectator ${spectatorId}`);
  };

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
                  <AvatarImage src={spectator.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {spectator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {spectator.name}
                  </div>
                </div>
                
                {isHost && (
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
