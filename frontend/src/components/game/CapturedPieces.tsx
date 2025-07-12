/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChessGameStore } from "@/store";

const pieceToUnicode = {
  p: { w: "♙", b: "♟" },
  n: { w: "♘", b: "♞" },
  b: { w: "♗", b: "♝" },
  r: { w: "♖", b: "♜" },
  q: { w: "♕", b: "♛" },
  k: { w: "♔", b: "♚" },
};

const groupCaptured = (moves: any[], color: "white" | "black") => {
  const map = new Map<string, number>();
  for (const move of moves) {
    if (!move.captured) continue;

    // Determine the piece that was captured
    const capturedColor = color === "white" ? "b" : "w"; // captured by white = black's piece
    const symbol =
      pieceToUnicode[move.captured]?.[capturedColor] ?? move.captured;

    map.set(symbol, (map.get(symbol) || 0) + 1);
  }
  return Array.from(map.entries()); // [[♟, 2], [♞, 1]]
};

export function CapturedPieces() {
  const { capturedPieces } = useChessGameStore();
  console.log(capturedPieces,"final state");
  const whiteCaptures = groupCaptured(capturedPieces.white, "white");
  const blackCaptures = groupCaptured(capturedPieces.black, "black");

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Captured Pieces</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* White captured black's pieces */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            White captured
          </div>
          <div className="flex flex-wrap gap-2">
            {whiteCaptures.map(([piece, count], index) => (
              <span
                key={index}
                className="text-xl bg-secondary/50 rounded px-2 py-1 flex items-center justify-center"
              >
                {piece}{" "}
                {count > 1 && <span className="ml-1 text-xs">×{count}</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Black captured white's pieces */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            Black captured
          </div>
          <div className="flex flex-wrap gap-2">
            {blackCaptures.map(([piece, count], index) => (
              <span
                key={index}
                className="text-xl bg-secondary/50 rounded px-2 py-1 flex items-center justify-center"
              >
                {piece}{" "}
                {count > 1 && <span className="ml-1 text-xs">×{count}</span>}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
