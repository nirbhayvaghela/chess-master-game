import { DashboardCard } from "@/components/dashboard/Dashboard";
import { GameRoom } from "@/components/game/GameRoom";

const Dashboard = () => {

  return (
    <div className="mt-10">
      <DashboardCard  />
      <GameRoom />
    </div>
  );
};

export default Dashboard;
