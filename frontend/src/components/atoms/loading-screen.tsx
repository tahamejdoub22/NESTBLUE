"use client";

import { TasksSkeleton } from "@/components/molecules/tasks-skeleton";
import { ProjectsSkeleton } from "@/components/molecules/projects-skeleton";
import { NotificationsSkeleton } from "@/components/molecules/notifications-skeleton";
import { MessagesSkeleton } from "@/components/molecules/messages-skeleton";
import { ProjectDetailSkeleton } from "@/components/molecules/project-detail-skeleton";
import { DashboardSkeleton } from "@/components/molecules/dashboard-skeleton";

interface LoadingScreenProps {
  type?: "tasks" | "projects" | "notifications" | "messages" | "project-detail" | "dashboard" | "default";
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ 
  type = "default",
  message = "Loading...", 
  fullScreen = false 
}: LoadingScreenProps) {
  // Return specific skeleton based on type
  switch (type) {
    case "tasks":
      return <TasksSkeleton />;
    case "projects":
      return <ProjectsSkeleton />;
    case "notifications":
      return <NotificationsSkeleton />;
    case "messages":
      return <MessagesSkeleton />;
    case "project-detail":
      return <ProjectDetailSkeleton />;
    case "dashboard":
      return <DashboardSkeleton />;
    default:
      // Default loading with logo (for auth guard, etc.)
      const containerClass = fullScreen 
        ? "min-h-screen flex items-center justify-center relative overflow-hidden p-4"
        : "flex items-center justify-center relative overflow-hidden p-4 min-h-[400px]";

      return (
        <div className={containerClass}>
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
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      );
  }
}

