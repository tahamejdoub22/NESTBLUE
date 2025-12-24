import { Task } from "@/interfaces/task.interface";
import { Avatar } from "@/components/atoms/avatar";
import { AvatarGroup } from "@/components/atoms/avatar-group";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, AlertCircle, Users } from "lucide-react";

export interface TaskListItemTemplateProps {
  task: Task;
  showProject?: boolean;
  projectName?: string;
  className?: string;
  onClick?: () => void;
  availableUsers?: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    status?: "online" | "offline" | "away" | "busy";
  }>;
}

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const statusColors: Record<Task["status"], string> = {
  todo: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  "in-progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  complete: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  backlog: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export function renderTaskListItem(props: TaskListItemTemplateProps) {
  const {
    task,
    showProject = false,
    projectName,
    className,
    onClick,
    availableUsers = [],
  } = props;

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "complete";

  // Get assignee user objects from availableUsers
  const assigneeUsers = availableUsers.filter((user) => {
    // Check if task.assignees contains user ID or name/email
    return (
      task.assignees?.some((assignee) => {
        if (typeof assignee === "string") {
          return (
            assignee === user.id ||
            assignee === user.name ||
            assignee === user.email
          );
        }
        return false;
      }) ||
      (task as any).assigneeIds?.includes(user.id)
    );
  });

  // Fallback: if no users found but assignees exist, show initials
  const hasAssignees = (task.assignees && task.assignees.length > 0) || assigneeUsers.length > 0;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold truncate">{task.title}</h4>
              <Badge
                variant="outline"
                className={cn("text-xs", priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", statusColors[task.status])}
              >
                {task.status}
              </Badge>
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasAssignees && (
              <div className="flex items-center gap-1.5">
                {assigneeUsers.length > 0 ? (
                  <>
                    <AvatarGroup size="xs" max={3}>
                      {assigneeUsers.slice(0, 3).map((user) => (
                        <Avatar
                          key={user.id}
                          src={user.avatarUrl}
                          fallback={user.name}
                          size="xs"
                          status={user.status}
                          className="ring-2 ring-background"
                        />
                      ))}
                    </AvatarGroup>
                    {assigneeUsers.length > 3 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{assigneeUsers.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {/* Fallback: show initials from assignee names */}
                    {task.assignees?.slice(0, 3).map((assignee, index) => (
                      <Avatar
                        key={index}
                        fallback={typeof assignee === "string" ? assignee.charAt(0).toUpperCase() : "?"}
                        size="xs"
                        className="ring-2 ring-background -ml-1.5 first:ml-0"
                      />
                    ))}
                    {task.assignees && task.assignees.length > 3 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{task.assignees.length - 3}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
            {!hasAssignees && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>Unassigned</span>
              </div>
            )}
            {showProject && projectName && (
              <Badge variant="outline" className="text-xs">
                {projectName}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                )}
              >
                {isOverdue ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                {/* Display as "12 Dec 2025" */}
                <span>{format(new Date(task.dueDate), "d MMM yyyy")}</span>
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {task.subtasks.filter((st) => st.completed).length}/
                {task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



