import { UserActivity } from "@/interfaces/dashboard.interface";
import { ActivityFeed } from "@/components/molecules/activity-feed";
import { cn } from "@/lib/utils";

export interface UserActivitySectionTemplateProps {
  activities: UserActivity[];
  className?: string;
}

export function renderUserActivitySection(props: UserActivitySectionTemplateProps) {
  const {
    activities,
    className,
  } = props;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ActivityFeed activities={activities} maxItems={8} />
    </div>
  );
}



