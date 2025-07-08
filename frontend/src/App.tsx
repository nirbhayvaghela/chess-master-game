import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";
import { PrivateLayout } from "./components/layout/PrivateLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { routes } from "./utils/constants/routes";
import Index from "./pages";
import WaitingRoom from "./components/game/WaitingRoom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path={routes.landingPage} element={<Index />} />
            <Route path={routes.auth.signIn} element={<Auth />} />
          </Route>

          {/* Private routes */}
          <Route element={<PrivateLayout />}>
            <Route path={routes.dashboard} element={<Dashboard />} />
            <Route path="/dashboard/:roomCode" element={<Dashboard />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="/game/waiting/:gameId" element={<WaitingRoom />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
