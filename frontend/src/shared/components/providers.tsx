"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

// Global scroll restoration handler
function ScrollRestorationHandler() {
  useEffect(() => {
    // Disable browser's automatic scroll restoration globally
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);
  
  return null;
}

// Suppress harmless browser extension errors
function ExtensionErrorSuppressor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Override console.error to filter out extension-related errors
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Filter out harmless browser extension errors
      if (
        message.includes("runtime.lastError") ||
        message.includes("Could not establish connection") ||
        message.includes("Receiving end does not exist") ||
        message.includes("Extension context invalidated")
      ) {
        // Silently ignore these extension errors
        return;
      }
      
      // Call original console.error for all other errors
      originalError.apply(console, args);
    };

    // Also handle unhandled promise rejections from extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || "";
      if (
        reason.includes("runtime.lastError") ||
        reason.includes("Could not establish connection") ||
        reason.includes("Receiving end does not exist")
      ) {
        event.preventDefault(); // Prevent error from showing in console
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      // Restore original console.error on cleanup
      console.error = originalError;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ScrollRestorationHandler />
        <ExtensionErrorSuppressor />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}



