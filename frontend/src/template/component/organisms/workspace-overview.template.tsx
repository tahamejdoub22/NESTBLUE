import { WorkspaceOverview as WorkspaceOverviewType } from "@/interfaces/dashboard.interface";
import { StatCard } from "@/components/molecules/stat-card";
import { FolderKanban, Users, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceOverviewTemplateProps {
  data: WorkspaceOverviewType;
  className?: string;
}

export function renderWorkspaceOverview(props: WorkspaceOverviewTemplateProps) {
  const { data, className } = props;

  return (
    <div className={cn("stagger-children", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 2xl:gap-8">
        <StatCard
          title="Total Projects"
          value={data.totalProjects}
          icon={FolderKanban}
          change={
            data.totalProjects > 0
              ? { value: 12, trend: "up" }
              : undefined
          }
        />
        <StatCard
          title="Active Sprints"
          value={data.activeSprints}
          icon={Target}
          description={data.activeSprints > 0 ? "Currently running" : "No active sprints"}
        />
        <StatCard
          title="Team Members"
          value={data.teamMembers}
          icon={Users}
          change={{ value: 5, trend: "up" }}
        />
        <StatCard
          title="Health Score"
          value={`${data.healthScore}%`}
          icon={TrendingUp}
          change={{
            value: data.healthTrend === "up" ? 5 : data.healthTrend === "down" ? -3 : 0,
            trend: data.healthTrend,
          }}
          description={
            data.healthScore >= 80
              ? "Excellent"
              : data.healthScore >= 60
                ? "Good"
                : "Needs attention"
          }
          variant="gradient"
        />
      </div>
    </div>
  );
}



