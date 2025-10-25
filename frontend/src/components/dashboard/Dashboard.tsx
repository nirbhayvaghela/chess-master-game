"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardDetails } from "@/hooks/queries/useDashboard";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import Loader from "../ui/loader";

export function DashboardCard() {
  const userData = LocalStorageGetItem("userData");
  const { data: dashboardData, isLoading } = useGetDashboardDetails();
  if (isLoading) return <Loader />;

  return (
    <Card className="mx-auto max-w-5xl bg-background border border-border rounded-xl shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-primary">
          Welcome, {userData?.username || ""}!
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-6 text-sm text-white">
        {/* <div className="space-y-1">
          <p className="text-muted-foreground">Current Streak</p>
          <p className="text-lg font-bold text-yellow-300">{streak} 🔥</p>
        </div> */}
        <div className="space-y-1">
          <p className="text-muted-foreground">Games Played</p>
          <p className="text-lg font-bold">{dashboardData?.gamesPlayed}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Wins</p>
          <p className="text-lg font-bold text-green-400">{dashboardData?.gamesWon}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Losses</p>
          <p className="text-lg font-bold text-red-400">{dashboardData?.gamesLoose}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Last Match vs</p>
          <p className="text-lg font-bold">{dashboardData?.lastMatchWithDetails?.username}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Result</p>
          <p
            className={`text-lg font-bold ${
              dashboardData?.lastMatchWithDetails?.result === "win"
                ? "text-green-400"
                : dashboardData?.lastMatchWithDetails?.result === "loss"
                ? "text-red-400"
                : "text-yellow-300"
            }`}
          >
            {dashboardData?.lastMatchWithDetails?.result}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
