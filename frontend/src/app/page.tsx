"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAuthUser } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentAuthUser();

  useEffect(() => {
    // Redirect immediately without showing loading screen
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [router, isAuthenticated, isLoading]);

  // Return null to avoid showing any UI during redirect
  return null;
}
