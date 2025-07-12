import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChessGameStore } from "@/store";

// optional: mapping shorthand piece to full name or emoji
const pieceMap: Record<string, string> = {
  p: "♙ Pawn",
  n: "♘ Knight",
  b: "♗ Bishop",
  r: "♖ Rook",
  q: "♕ Queen",
  k: "♔ King",
};

export function MoveHistory() {
  const { moveHistory } = useChessGameStore();

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Move History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 px-4">
          <div className="space-y-1">
            {[...moveHistory].reverse().map((moveRaw, index) => {
              let move;
              try {
                move =
                  typeof moveRaw === "string" ? JSON.parse(moveRaw) : moveRaw;
              } catch {
                return null;
              }

              return (
                <div
                  key={index}
                  className="flex flex-col gap-1 p-2 rounded hover:bg-accent/50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-6">
                      {moveHistory.length - index}.
                    </span>
                    <span className="font-mono w-12 text-center bg-secondary/50 rounded px-1">
                      {move.san}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {move.from} → {move.to}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground pl-8">
                    Piece: {pieceMap[move.piece] || move.piece}
                    {move.captured && (
                      <>
                        {" "}
                        | Captured: {pieceMap[move.captured] || move.captured}
                      </>
                    )}
                    {move.promotion && (
                      <>
                        {" "}
                        | Promoted to:{" "}
                        {pieceMap[move.promotion] || move.promotion}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
