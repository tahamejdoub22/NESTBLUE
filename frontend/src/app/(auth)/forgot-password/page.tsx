"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Text } from "@/components/atoms/text";
import { Card } from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      setEmailSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
                Check Your Email
              </Text>
              <Text variant="body" color="muted" className="text-base">
                We've sent a password reset link to your email
              </Text>
            </div>
          </div>

          {/* Success Card */}
          <Card className="p-8 md:p-10 shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 dark:bg-card/90 animate-slide-up animation-delay-100">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 border-2 border-success/20 animate-bounce-in">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              </div>

              <div className="space-y-2">
                <Text variant="h3" className="font-bold">Email Sent!</Text>
                <Text variant="body" color="muted" className="text-sm">
                  We've sent a password reset link to <strong className="text-foreground">{email}</strong>
                </Text>
              </div>

              <div className="rounded-xl bg-muted/30 p-5 text-left border border-border/50 animate-fade-in animation-delay-200">
                <Text variant="caption" className="font-semibold mb-3 text-foreground">
                  Didn't receive the email?
                </Text>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Check your spam or junk folder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Make sure you entered the correct email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Wait a few minutes and try again</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full group hover:bg-accent/50 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  Back to Reset
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Back to Login
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
              Forgot Password?
            </Text>
            <Text variant="body" color="muted" className="text-base">
              No worries, we'll send you reset instructions
            </Text>
          </div>
        </div>

        {/* Reset Card */}
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
                disabled={loading}
                className="transition-all duration-200"
                size="lg"
              />
              <Text variant="caption" color="muted" className="text-xs flex items-center gap-1.5 mt-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Enter the email address associated with your account
              </Text>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full group relative overflow-hidden"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? "Sending..." : "Send Reset Link"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary font-semibold hover:text-primary/80 transition-colors duration-200 hover:underline group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

