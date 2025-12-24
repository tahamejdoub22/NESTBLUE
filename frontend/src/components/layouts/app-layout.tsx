"use client";

import { useState } from "react";
import { Sidebar } from "@/components/organisms/sidebar";
import { Navbar } from "@/components/organisms/navbar";
import { CommandMenu } from "@/components/organisms/command-menu";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/atoms";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <div
          className={cn(
            "flex flex-col min-h-screen transition-all duration-300",
            sidebarCollapsed ? "md:ml-16" : "md:ml-72"
          )}
        >
          <Navbar
            onMenuClick={() => setMobileSidebarOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>

        {/* Command Menu (Ctrl/Cmd + K) */}
        <CommandMenu />
      </div>
    </TooltipProvider>
  );
}
