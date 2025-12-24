// src/components/organisms/sprint-board.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { SprintViewTabs, ViewType } from "@/components/molecules/sprint-view-tabs";
import { SprintGroupControls } from "@/components/molecules/sprint-group-controls";
import { SprintBoardView } from "@/components/molecules/sprint-board-view";
import { SprintListView } from "@/components/molecules/sprint-list-view";
import { SprintTableView } from "@/components/molecules/sprint-table-view";
import { SprintCalendarView } from "@/components/molecules/sprint-calendar-view";
import { SprintGanttView } from "@/components/molecules/sprint-gantt-view";
import { TaskFormModal } from "@/components/molecules/tasks/task-form-modal";
import { InviteTeamModal } from "@/components/molecules/invite-team-modal";
import { Plus, Users, FileText } from "lucide-react";
import { Task, TaskStatus, TaskPriority, TaskColumn } from "@/interfaces/task.interface";
import { generateUniqueId } from "@/lib/utils";
import { Card, CardContent } from "@/components/atoms/card";
import { useTasks } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import { useProject } from "@/hooks/use-projects";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useSprint, useSprintTasks } from "@/hooks/use-sprints";
import type { TaskFormData } from "@/core/schemas/task-schema";
import { toast } from "sonner";

// Legacy type aliases for backward compatibility
export type SprintTask = Task;
export type SprintColumn = TaskColumn;
export type { TaskStatus, TaskPriority };

interface SprintBoardProps {
  projectName?: string;
  projectId?: string;
  initialTasks?: SprintTask[];
  sprintId?: string; // Optional sprint ID to filter tasks
}

const SprintBoard = ({
  projectName = "Project",
  projectId,
  initialTasks = [],
  sprintId
}: SprintBoardProps) => {
  const [view, setView] = useState<ViewType>("list");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus | undefined>(undefined);

  // Use tasks hook for backend integration
  // When sprintId is provided, use sprint tasks hook instead for better cache management
  const { tasks: projectTasks, createTask, updateTask, deleteTask, isCreating, isUpdating, isDeleting } = useTasks(projectId);
  const { tasks: sprintTasks, refetch: refetchSprintTasks } = useSprintTasks(sprintId || "");
  
  // Use users hook for backend integration
  const { users: backendUsers } = useUsers();
  
  // Get project data for date restrictions
  const { project } = useProject(projectId || "");
  
  // Get sprint data for date restrictions when in sprint context
  const { sprint: currentSprint } = useSprint(sprintId || "");
  
  // Get project members for invite modal
  const { members, inviteMembers, isInviting } = useProjectMembers(projectId || "");

  // Use sprint tasks when sprintId is provided, otherwise use project tasks or initialTasks
  // This ensures we're using the correct query cache
  let tasks: SprintTask[] = [];
  if (sprintId) {
    // Use sprint tasks directly when in sprint context
    tasks = sprintTasks || [];
  } else if (projectId) {
    // Use project tasks when only projectId is provided
    tasks = projectTasks || [];
  } else {
    // Fall back to initialTasks when no projectId or sprintId
    tasks = initialTasks || [];
  }

  // Derive columns from tasks
  const columns: SprintColumn[] = [
    {
      id: "todo",
      title: "TO DO",
      color: "bg-blue-500",
      tasks: tasks.filter(task => task.status === "todo")
    },
    {
      id: "in-progress",
      title: "IN PROGRESS",
      color: "bg-yellow-500",
      tasks: tasks.filter(task => task.status === "in-progress")
    },
    {
      id: "complete",
      title: "COMPLETE",
      color: "bg-green-500",
      tasks: tasks.filter(task => task.status === "complete")
    },
    {
      id: "backlog",
      title: "BACKLOG",
      color: "bg-gray-500",
      tasks: tasks.filter(task => task.status === "backlog")
    }
  ];

  // Open task modal for creating/editing
  const openTaskModal = (task?: Task, defaultStatus?: TaskStatus) => {
    if (task) {
      setEditingTask(task);
      setDefaultTaskStatus(undefined);
    } else {
      setEditingTask(null);
      setDefaultTaskStatus(defaultStatus);
    }
    setIsTaskModalOpen(true);
  };

  // Handle task form submission
  const handleTaskSubmit = async (data: TaskFormData) => {
    try {
      // Convert dates to ISO strings for backend
      const taskData = {
        ...data,
        dueDate: data.dueDate ? (data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate) : undefined,
        startDate: data.startDate ? (data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate) : undefined,
        projectId: projectId || data.projectId,
        // Use sprintId prop if provided (when in sprint context), otherwise use from form data or existing task
        sprintId: sprintId || data.sprintId || (editingTask ? ((editingTask as any).sprintId || editingTask.sprintId) : undefined),
      };

      if (editingTask) {
        await updateTask({ uid: editingTask.uid, data: taskData });
        toast.success("Task updated successfully");
        setEditingTask(null);
      } else {
        await createTask(taskData);
        toast.success("Task created successfully");
        // Manually refetch sprint tasks if we're in sprint context
        if (sprintId) {
          refetchSprintTasks();
        }
      }
      setIsTaskModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save task");
    }
  };

  // Handle inline task creation (from SprintListView)
  const handleInlineTaskCreate = async (taskData: Omit<SprintTask, "uid" | "identifier">) => {
    if (!projectId) {
      toast.error("Project ID is required to create tasks");
      return;
    }
    
    try {
      // Convert task data to backend format
      const backendTaskData: TaskFormData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assigneeIds: (taskData as any).assigneeIds || [],
        dueDate: taskData.dueDate,
        startDate: taskData.startDate,
        estimatedCost: taskData.estimatedCost,
        projectId: projectId,
        sprintId: sprintId, // Include sprintId when creating tasks from sprint detail page
      };
      
      await createTask(backendTaskData);
      toast.success("Task created successfully");
      // Manually refetch sprint tasks if we're in sprint context
      if (sprintId) {
        refetchSprintTasks();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create task");
    }
  };

  // Legacy addTask function for backward compatibility (opens modal)
  const addTask = (taskOrColumnId?: TaskStatus | Omit<SprintTask, "uid" | "identifier">) => {
    if (typeof taskOrColumnId === "string") {
      // Column ID provided - open modal with default status
      openTaskModal(undefined, taskOrColumnId);
    } else if (taskOrColumnId && typeof taskOrColumnId === "object") {
      // Task object provided - open modal for editing
      openTaskModal(taskOrColumnId as Task);
    } else {
      // No parameter - open modal for new task
      openTaskModal();
    }
  };

  // Update tasks handler for child components
  // Note: For full backend integration, individual task updates should go through updateTask
  const handleTaskUpdate = (updatedTasks: SprintTask[]) => {
    // This is for local state updates if needed
    // Backend updates should use updateTask mutation directly
  };

  // Handle drag and drop - update task status in backend
  const handleDragEnd = async (taskIdentifier: string, newStatus: TaskStatus) => {
    if (!projectId) {
      // If no projectId, this might be a local-only view, allow local update
      return;
    }
    
    const taskToUpdate = tasks.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (taskToUpdate && taskToUpdate.uid) {
      try {
        await updateTask({ 
          uid: taskToUpdate.uid, 
          data: { status: newStatus } 
        });
        toast.success("Task moved successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to move task");
        console.error("Drag and drop error:", error);
      }
    } else {
      console.warn("Task not found for drag and drop:", taskIdentifier);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Text variant="h2" className="text-xl sm:text-2xl font-semibold tracking-tight">
            {projectName}
          </Text>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {projectId && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
              className="border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all"
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          )}
          <Button 
            size="sm"
            onClick={() => openTaskModal()}
            className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <SprintViewTabs view={view} onViewChange={setView} />

      {/* Group Controls */}
      <SprintGroupControls onAddTask={() => addTask()} />

      {/* Empty State */}
      {tasks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <Text variant="h3" weight="semibold" className="mb-2">
              No tasks yet
            </Text>
            <Text variant="body-sm" color="muted" className="text-center mb-4 max-w-md">
              Get started by creating your first task for this project
            </Text>
            <Button onClick={() => openTaskModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Render appropriate view */}
      {tasks.length > 0 && (
        <>
          {view === "board" && (
            <SprintBoardView
              columns={columns.map(col => ({
                ...col,
                onAddTask: () => addTask(col.id)
              }))}
              onAddTask={addTask}
              onDragEnd={handleDragEnd}
              onTaskUpdate={handleTaskUpdate}
              tasks={tasks}
              availableUsers={backendUsers}
              minDate={project?.startDate ? new Date(project.startDate) : undefined}
              maxDate={project?.endDate ? new Date(project.endDate) : undefined}
              onTaskStatusChange={async (taskId, status) => {
                await updateTask({ uid: taskId, data: { status: status as any } });
                toast.success("Task status updated");
              }}
              onTaskPriorityChange={async (taskId, priority) => {
                await updateTask({ uid: taskId, data: { priority: priority as any } });
                toast.success("Task priority updated");
              }}
              onTaskAssigneesChange={async (taskId, userIds) => {
                await updateTask({ uid: taskId, data: { assigneeIds: userIds } });
                toast.success("Task assignees updated");
              }}
              onTaskDateChange={async (taskId, date) => {
                await updateTask({ uid: taskId, data: { dueDate: date ? date.toISOString() : undefined } });
                toast.success("Task date updated");
              }}
              onTaskDelete={async (taskId) => {
                await deleteTask(taskId);
                toast.success("Task deleted successfully");
              }}
              projectId={projectId}
              sprintId={sprintId}
            />
          )}

          {view === "list" && (
            <SprintListView
              tasks={tasks}
              onAddTask={handleInlineTaskCreate}
              onTaskUpdate={handleTaskUpdate}
              availableUsers={backendUsers}
              projectId={projectId}
              onTaskStatusChange={async (taskId, status) => {
                await updateTask({ uid: taskId, data: { status: status as any } });
                toast.success("Task status updated");
              }}
              onTaskPriorityChange={async (taskId, priority) => {
                await updateTask({ uid: taskId, data: { priority: priority as any } });
                toast.success("Task priority updated");
              }}
              onTaskAssigneesChange={async (taskId, userIds) => {
                await updateTask({ uid: taskId, data: { assigneeIds: userIds } });
                toast.success("Task assignees updated");
              }}
              onTaskDateChange={async (taskId, date) => {
                await updateTask({ uid: taskId, data: { dueDate: date ? date.toISOString() : undefined } });
                toast.success("Task date updated");
              }}
              onTaskDelete={async (taskId) => {
                await deleteTask(taskId);
                toast.success("Task deleted successfully");
              }}
              minDate={
                sprintId && currentSprint?.startDate
                  ? new Date(currentSprint.startDate)
                  : project?.startDate
                  ? new Date(project.startDate)
                  : undefined
              }
              maxDate={
                sprintId && currentSprint?.endDate
                  ? new Date(currentSprint.endDate)
                  : project?.endDate
                  ? new Date(project.endDate)
                  : undefined
              }
              sprintId={sprintId}
            />
          )}

          {view === "table" && (
            <SprintTableView
              tasks={tasks}
              availableUsers={backendUsers}
              onTaskUpdate={handleTaskUpdate}
              onTaskStatusChange={async (taskId, status) => {
                await updateTask({ uid: taskId, data: { status: status as any } });
                toast.success("Task status updated");
              }}
              onTaskPriorityChange={async (taskId, priority) => {
                await updateTask({ uid: taskId, data: { priority: priority as any } });
                toast.success("Task priority updated");
              }}
              onTaskAssigneesChange={async (taskId, userIds) => {
                await updateTask({ uid: taskId, data: { assigneeIds: userIds } });
                toast.success("Task assignees updated");
              }}
              onTaskDateChange={async (taskId, date) => {
                await updateTask({ uid: taskId, data: { dueDate: date ? date.toISOString() : undefined } });
                toast.success("Task date updated");
              }}
              onTaskDelete={async (taskId) => {
                await deleteTask(taskId);
                toast.success("Task deleted successfully");
              }}
              minDate={project?.startDate ? new Date(project.startDate) : undefined}
              maxDate={project?.endDate ? new Date(project.endDate) : undefined}
              projectId={projectId}
            />
          )}

          {view === "calendar" && (
            <SprintCalendarView
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onAddTask={handleInlineTaskCreate}
              availableUsers={backendUsers}
              onTaskStatusChange={async (taskId, status) => {
                await updateTask({ uid: taskId, data: { status: status as any } });
                toast.success("Task status updated");
              }}
              onTaskPriorityChange={async (taskId, priority) => {
                await updateTask({ uid: taskId, data: { priority: priority as any } });
                toast.success("Task priority updated");
              }}
              onTaskAssigneesChange={async (taskId, userIds) => {
                await updateTask({ uid: taskId, data: { assigneeIds: userIds } });
                toast.success("Task assignees updated");
              }}
              onTaskDateChange={async (taskId, date) => {
                await updateTask({ uid: taskId, data: { dueDate: date ? date.toISOString() : undefined } });
                toast.success("Task date updated");
              }}
              onTaskDelete={async (taskId) => {
                await deleteTask(taskId);
                toast.success("Task deleted successfully");
              }}
              minDate={project?.startDate ? new Date(project.startDate) : undefined}
              maxDate={project?.endDate ? new Date(project.endDate) : undefined}
              projectId={projectId}
            />
          )}

          {view === "gantt" && (
            <SprintGanttView
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onAddTask={handleInlineTaskCreate}
              availableUsers={backendUsers}
              onTaskStatusChange={async (taskId, status) => {
                await updateTask({ uid: taskId, data: { status: status as any } });
                toast.success("Task status updated");
              }}
              onTaskPriorityChange={async (taskId, priority) => {
                await updateTask({ uid: taskId, data: { priority: priority as any } });
                toast.success("Task priority updated");
              }}
              onTaskAssigneesChange={async (taskId, userIds) => {
                await updateTask({ uid: taskId, data: { assigneeIds: userIds } });
                toast.success("Task assignees updated");
              }}
              onTaskDateChange={async (taskId, date) => {
                await updateTask({ uid: taskId, data: { dueDate: date ? date.toISOString() : undefined } });
                toast.success("Task date updated");
              }}
              onTaskDelete={async (taskId) => {
                await deleteTask(taskId);
                toast.success("Task deleted successfully");
              }}
              minDate={project?.startDate ? new Date(project.startDate) : undefined}
              maxDate={project?.endDate ? new Date(project.endDate) : undefined}
              projectId={projectId}
            />
          )}
        </>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) {
            setEditingTask(null);
            setDefaultTaskStatus(undefined);
          }
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        projectId={projectId}
        sprintId={sprintId}
        defaultStatus={defaultTaskStatus}
        isLoading={isCreating || isUpdating}
        minDate={
          sprintId && currentSprint?.startDate
            ? new Date(currentSprint.startDate)
            : project?.startDate
            ? new Date(project.startDate)
            : undefined
        }
        maxDate={
          sprintId && currentSprint?.endDate
            ? new Date(currentSprint.endDate)
            : project?.endDate
            ? new Date(project.endDate)
            : undefined
        }
      />

      {/* Invite Team Modal */}
      {projectId && (
        <InviteTeamModal
          open={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          projectUid={projectId}
          projectOwnerId={(project as any)?.ownerId || (project as any)?.owner?.id}
          existingMembers={members.map((m: any) => ({
            userId: m.userId || m.user?.id,
            user: m.user,
            role: m.role,
          }))}
          existingMemberIds={members.map((m: any) => m.userId || m.user?.id).filter(Boolean)}
          onInvite={async (input) => {
            await inviteMembers(input).then(() => undefined);
          }}
          isLoading={isInviting}
        />
      )}
    </div>
  );
};

export{  SprintBoard };