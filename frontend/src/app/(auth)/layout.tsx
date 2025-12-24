"use client";

import { AuthGuard } from "@/components/auth/auth-guard";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthGuard requireAuth={false}>
      {children}
    </AuthGuard>
  );
}



