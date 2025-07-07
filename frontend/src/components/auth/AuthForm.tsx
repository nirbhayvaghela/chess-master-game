import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SignInSchemaType, SignUpSchemaType } from "@/schemas/auth.schema";
import { useSignIn, useSignUp } from "@/hooks/queries/useAuth";
import { toast } from "sonner";
import cookie from "js-cookie";

export function AuthForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  // Form state for sign in
  const [signInData, setSignInData] = useState({
    emailOrUsername: "",
    password: "",
  });

  // Form state for sign up
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // API hooks
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const signInPayload: SignInSchemaType = {
      emailOrUsername: signInData.emailOrUsername,
      password: signInData.password,
    };

    const result = await signInMutation.mutateAsync(signInPayload);
    if(result.data.data.user.accessToken) {
      navigate("/dashboard");
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (signUpData.password !== signUpData.confirmPassword) {
      console.error("Passwords don't match");
      return;
    }

    const signUpPayload: SignUpSchemaType = {
      username: signUpData.username,
      email: signUpData.email,
      password: signUpData.password,
    };

    const res = await signUpMutation.mutateAsync(signUpPayload);
    console.log(res,"res")
    toast.success("Account created successfully, please sign in.");
    setActiveTab("signin");
  };

  // const handleSocialLogin = (provider: string) => {
  //   console.log(`Login with ${provider}`);
  //   navigate("/dashboard");
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">ChessMaster</h1>
          <p className="text-muted-foreground">
            Strategic chess gaming platform
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "signin" | "signup")}
              defaultValue="signin"
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email-username">
                      Email or Username
                    </Label>
                    <Input
                      id="signin-email-username"
                      type="text"
                      placeholder="Enter your email or username"
                      value={signInData.emailOrUsername}
                      onChange={(e) =>
                        setSignInData((prev) => ({
                          ...prev,
                          emailOrUsername: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                  {signInMutation.isError && (
                    <p className="text-sm text-destructive">
                      Sign in failed. Please check your credentials.
                    </p>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signUpData.username}
                      onChange={(e) =>
                        setSignUpData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signUpMutation.isPending}
                  >
                    {signUpMutation.isPending
                      ? "Creating account..."
                      : "Sign Up"}
                  </Button>
                  {signUpMutation.isError && (
                    <p className="text-sm text-destructive">
                      Sign up failed. Please try again.
                    </p>
                  )}
                  {signUpData.password !== signUpData.confirmPassword &&
                    signUpData.confirmPassword && (
                      <p className="text-sm text-destructive">
                        Passwords don't match.
                      </p>
                    )}
                </form>
              </TabsContent>
            </Tabs>

            {/* <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('github')}
                  className="w-full"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
