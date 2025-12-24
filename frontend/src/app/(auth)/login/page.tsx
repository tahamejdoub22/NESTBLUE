"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Text } from "@/components/atoms/text";
import { Card } from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login({ email, password });
      toast.success("Login successful!");
      // Navigation is handled by useAuth hook
    } catch (error: any) {
      toast.error(error?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.12),transparent_50%)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse-soft animation-delay-300" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo/Brand Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 mb-2 shadow-lg shadow-primary/10 animate-bounce-in border border-primary/20">
            <img 
              src="/Artboard1.svg" 
              alt="Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="space-y-2">
            <Text variant="h1" className="mb-1 font-bold tracking-tight">
              Welcome Back
            </Text>
            <Text variant="body" color="muted" className="text-base">
              Sign in to your account to continue
            </Text>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 md:p-10 shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 dark:bg-card/90 animate-slide-up animation-delay-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                disabled={isLoggingIn}
                className="transition-all duration-200"
                size="lg"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                required
                disabled={isLoggingIn}
                className="transition-all duration-200"
                size="lg"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-all duration-200"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full group relative overflow-hidden"
              size="lg"
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoggingIn ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-medium tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              type="button" 
              className="w-full group hover:bg-accent/50 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
            >
              <svg className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
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
              <span className="font-medium">Google</span>
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              className="w-full group hover:bg-accent/50 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
            >
              <svg className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-medium">GitHub</span>
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <Text variant="body" color="muted" className="text-sm">
              Don't have an account?{" "}
              <Link 
                href="/register" 
                className="text-primary font-semibold hover:text-primary/80 transition-colors duration-200 hover:underline inline-flex items-center gap-1"
              >
                Sign up
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}

