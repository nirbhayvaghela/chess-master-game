import { DashboardCard } from "@/components/dashboard/Dashboard";
import { GameRoom } from "@/components/game/GameRoom";

const userData = {
  username: "KnightMaster42",
  streak: 3,
  gamesPlayed: 28,
  wins: 16,
  losses: 12,
  lastOpponent: "ChessGuru91",
  lastResult: "win" as "win" | "loss" | "draw",
};

const Dashboard = () => {
  return (
    <div className="mt-10">
      <DashboardCard {...userData} />
      <GameRoom />
    </div>
  );
};

export default Dashboard;
