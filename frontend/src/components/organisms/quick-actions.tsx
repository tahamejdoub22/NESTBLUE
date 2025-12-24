"use client";

import { renderQuickActions } from "@/template/component/organisms/quick-actions.template";

export interface QuickActionsProps {
  onCreateTask?: () => void;
  onCreateProject?: () => void;
  onInviteMember?: () => void;
  className?: string;
}

export function QuickActions(props: QuickActionsProps) {
  return renderQuickActions(props);
}

