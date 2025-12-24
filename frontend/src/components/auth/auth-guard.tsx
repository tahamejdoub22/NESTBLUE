"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAuthUser } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useCurrentAuthUser();
  const [mounted, setMounted] = useState(false);

  // Only run on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Not authenticated, redirect to login
        router.push("/login");
      } else if (!requireAuth && isAuthenticated) {
        // Already authenticated, redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [mounted, isLoading, isAuthenticated, requireAuth, router]);

  // During SSR or initial mount, render children to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  // Show loading state only on client
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        {/* Subtle background like auth splash */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />
        
        <div className="relative z-10 text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 mb-2 shadow-lg shadow-primary/10 border border-primary/20 animate-pulse">
            <img
              src="/Artboard1.svg"
              alt="Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth required but not authenticated, don't render children (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If auth not required but authenticated, don't render children (will redirect)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

