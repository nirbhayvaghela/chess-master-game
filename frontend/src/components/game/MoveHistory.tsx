
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MoveHistory() {
  const moves = [
    { white: 'e4', black: 'e5', number: 1 },
    { white: 'Nf3', black: 'Nc6', number: 2 },
    { white: 'Bb5', black: 'a6', number: 3 },
    { white: 'Ba4', black: 'Nf6', number: 4 },
    { white: 'O-O', black: 'Be7', number: 5 },
    { white: 'd3', black: 'b5', number: 6 },
    { white: 'Bb3', black: 'd6', number: 7 },
    { white: 'c3', black: 'O-O', number: 8 },
  ];

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Move History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 px-4">
          <div className="space-y-1">
            {moves.map((move, index) => (
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
