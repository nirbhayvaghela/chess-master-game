import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Trophy,
  Gamepad2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/utils/constants/routes";
import { LocalStorageGetItem, LocalStorageRemoveItem } from "@/utils/helpers/storageHelper";

export const NavBar = () => {
  const navigate = useNavigate();
  const userData = LocalStorageGetItem("userData");

  const userStats = {
    username: "KnightMaster42",
    currentStreak: 3,
    gamesPlayed: 28,
    wins: 16,
    losses: 12,
    lastMatch: "ChessGuru91",
    lastResult: "WIN",
  };

  const handleLogout = () => {
    LocalStorageRemoveItem("userData");
    // cookie.remove("accessToken");
    // cookie.remove("refreshToken");
    navigate(routes.auth.signIn);
  };

  const handleProfile = () => {
    console.log("Opening profile...");
  };

  const handleSettings = () => {
    console.log("Opening settings...");
  };

  return (
    <div className="bg-secondary border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">ChessArena</span>
          </div>

          {/* User Stats - Center */}
          {/* <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="text-orange-500">🔥</div>
              <span className="text-secondary-foreground">
                Current Streak: {userStats.currentStreak}
              </span>
            </div>
            <div className="text-secondary-foreground">
              Games: {userStats.gamesPlayed}
            </div>
            <div className="text-green-500">Wins: {userStats.wins}</div>
            <div className="text-red-500">Losses: {userStats.losses}</div>
            <div className="text-secondary-foreground">
              Last vs {userStats.lastMatch}:
              <span className="text-green-500 ml-1 font-semibold">
                {userStats?.lastResult}
              </span>
            </div>
          </div> */}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-primary text-lg font-semibold">
              Welcome, {userData?.username}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 hover:bg-primary/10"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{userData?.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-full ">
                {/* <div className="px-2 py-1.5 text-sm font-medium text-primary">
                  {userData?.username}
                </div> */}
                {/* <div className="px-2 py-1 text-xs text-muted-foreground">
                  {userStats.wins}W - {userStats.losses}L •{" "}
                  {userStats.gamesPlayed} Games
                </div> */}

                {/* <DropdownMenuSeparator /> */}

                {/* <DropdownMenuItem
                  onClick={handleProfile}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem> */}

                {/* <DropdownMenuItem
                  onClick={handleSettings}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem> */}

                {/* <DropdownMenuItem className="cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Statistics</span>
                </DropdownMenuItem> */}

                {/* <DropdownMenuSeparator /> */}

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 "
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden mt-3 flex items-center justify-between text-xs text-secondary-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="text-orange-500">🔥</div>
              <span>{userStats.currentStreak}</span>
            </div>
            <div>Games: {userStats.gamesPlayed}</div>
            <div className="text-green-500">W: {userStats.wins}</div>
            <div className="text-red-500">L: {userStats.losses}</div>
          </div>
          <div className="text-right">
            <div>vs {userStats.lastMatch}</div>
            <div className="text-green-500 font-semibold">
              {userStats.lastResult}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
