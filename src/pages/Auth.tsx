import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const Auth = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { loginEmail, loginPassword });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup:", { signupName, signupEmail, signupPassword });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-muted-foreground">
                    Sign in to your account to continue
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <a href="#" className="text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                  >
                    Sign In
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button variant="outline" className="w-full">
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      Facebook
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                  <p className="text-muted-foreground">
                    Join us and start shopping today
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-sm">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-1 rounded" required />
                      <span className="text-muted-foreground">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                  >
                    Create Account
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">
                        Or sign up with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button variant="outline" className="w-full">
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      Facebook
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;