"use client";

import { renderUserActivitySection } from "@/template/component/organisms/user-activity-section.template";
import { UserActivity } from "@/interfaces/dashboard.interface";

export interface UserActivitySectionProps {
  activities: UserActivity[];
  className?: string;
}

export function UserActivitySection(props: UserActivitySectionProps) {
  return renderUserActivitySection(props);
}

