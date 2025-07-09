
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Users, Trophy, Zap } from "lucide-react";
import { routes } from "@/utils/constants/routes";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-6">
              <Crown className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ChessMaster
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the ultimate chess gaming platform. Play with friends, join tournaments, 
              and master the art of strategic thinking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate(routes.auth.signIn)}
                className="text-lg px-8 py-6"
              >
                Start Playing
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate(routes.dashboard)}
                className="text-lg px-8 py-6"
              >
                Quick Match
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose ChessMaster?</h2>
          <p className="text-muted-foreground">
            The most advanced chess platform with cutting-edge features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Multiplayer Gaming</h3>
              <p className="text-muted-foreground">
                Play with friends or challenge players from around the world in real-time matches.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Experience smooth gameplay with our optimized game engine and real-time synchronization.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Tournaments</h3>
              <p className="text-muted-foreground">
                Compete in daily tournaments and climb the leaderboards to prove your skills.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Master Chess?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of players and start your chess journey today.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate(routes.auth.signIn)}
            className="text-lg px-8 py-6"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
};

