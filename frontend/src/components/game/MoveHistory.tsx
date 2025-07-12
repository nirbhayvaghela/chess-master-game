import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MoveHistory({ moveHistory }: { moveHistory }) {
  console.log(moveHistory, "move history in move history component");
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Move History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 px-4">
          <div className="space-y-1">
            {moveHistory.map((move, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors text-sm"
              >
                <span className="text-muted-foreground w-6">
                  {move.number}.
                </span>
                <span className="font-mono w-12 text-center bg-secondary/50 rounded px-1">
                  {move.white}
                </span>
                <span className="font-mono w-12 text-center bg-secondary/50 rounded px-1">
                  {move.black}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
