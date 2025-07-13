"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";

type DashboardProps = {
  username: string;
  streak: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  lastOpponent: string;
  lastResult: "win" | "loss" | "draw";
};

export function DashboardCard({
  username,
  streak,
  gamesPlayed,
  wins,
  losses,
  lastOpponent,
  lastResult,
}: DashboardProps) {

  return (
    <Card className="mx-auto max-w-5xl bg-background border border-border rounded-xl shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-primary">
          Welcome, {username}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-6 text-sm text-white">
        <div className="space-y-1">
          <p className="text-muted-foreground">Current Streak</p>
          <p className="text-lg font-bold text-yellow-300">{streak} 🔥</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Games Played</p>
          <p className="text-lg font-bold">{gamesPlayed}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Wins</p>
          <p className="text-lg font-bold text-green-400">{wins}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Losses</p>
          <p className="text-lg font-bold text-red-400">{losses}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Last Match vs</p>
          <p className="text-lg font-bold">{lastOpponent}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Result</p>
          <p
            className={`text-lg font-bold ${
              lastResult === "win"
                ? "text-green-400"
                : lastResult === "loss"
                ? "text-red-400"
                : "text-yellow-300"
            }`}
          >
            {lastResult.toUpperCase()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
