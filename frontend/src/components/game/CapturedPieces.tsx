
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CapturedPieces({ capturedPiecesList }: { capturedPiecesList:any }) {
  // const capturedPiecesList.white = ['♟', '♞', '♝'];
  // const capturedByBlack = ['♙', '♘'];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Captured Pieces</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm text-muted-foreground mb-1">White captured</div>
          <div className="flex flex-wrap gap-1">
            {capturedPiecesList.white.map((piece:any, index:number) => (
              <span
                key={index}
                className="text-2xl bg-secondary/50 rounded p-1 w-8 h-8 flex items-center justify-center"
              >
                {piece}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Black captured</div>
          <div className="flex flex-wrap gap-1">
            {capturedPiecesList.black.map((piece:any, index:number) => (
              <span
                key={index}
                className="text-2xl bg-secondary/50 rounded p-1 w-8 h-8 flex items-center justify-center"
              >
                {piece}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
