"use client";

import { AppLayout } from "@/components/layouts/app-layout";
import { AuthGuard } from "@/components/auth/auth-guard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}
