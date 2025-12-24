# Task Detail Modal & Dashboard Statistics API Integration

## ✅ Added API Endpoints

### 1. Project Statistics API
- **Endpoint:** `GET /dashboard/project-statistics` or `GET /dashboard/projects/:projectId/statistics`
- **Method:** `api.getProjectStatistics(projectId?: string)`
- **Helper:** `dashboardApi.getProjectStatistics(projectId?: string)`
- **Hook:** `useProjectStatistics(projectId?: string)`

### 2. Dashboard API (Already Existed)
- **Endpoint:** `GET /dashboard`
- **Method:** `api.getDashboardData()`
- **Helper:** `dashboardApi.getData()`
- **Hook:** `useDashboard()`

## ✅ Updated Files

### API Service (`src/core/services/api.ts`)
- Added `getProjectStatistics(projectId?: string)` method
- Added `ProjectStatistics` import

### API Endpoints (`src/core/config/api-endpoints.ts`)
- Added `DASHBOARD.PROJECT_STATISTICS` endpoint

### API Helpers (`src/core/services/api-helpers.ts`)
- Added `dashboardApi.getProjectStatistics()` helper with mock fallback
- Added `ProjectStatistics` import

### Dashboard Page (`src/app/(app)/dashboard/page.tsx`)
- ✅ **Updated to use `useDashboard()` hook instead of mock data**
- Removed local state management
- Now uses API with automatic mock fallback

### New Hook (`src/hooks/use-project-statistics.ts`)
- Created `useProjectStatistics()` hook for fetching project statistics

## 📝 Task Detail Modal API Integration

The Task Detail Modal (`src/components/molecules/task-detail-modal.tsx`) uses callbacks:
- `onTaskUpdate: (updatedTask: Task) => void`
- `onTaskDelete?: (taskId: string) => void`

### How to Connect to API

In components that use `TaskDetailModal`, connect the callbacks to the API hooks:

```typescript
import { useTasks } from "@/hooks/use-tasks";

function YourComponent() {
  const { updateMutation, deleteMutation } = useTasks();
  
  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await updateMutation.mutateAsync({
        uid: updatedTask.uid,
        data: {
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          assignees: updatedTask.assignees,
          dueDate: updatedTask.dueDate,
          startDate: updatedTask.startDate,
          subtasks: updatedTask.subtasks,
          comments: updatedTask.comments,
          attachments: updatedTask.attachments,
          estimatedCost: updatedTask.estimatedCost,
        },
      });
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleTaskDelete = async (taskIdentifier: string) => {
    // Find task by identifier to get uid
    const task = tasks.find(t => t.identifier === taskIdentifier);
    if (!task) return;
    
    try {
      await deleteMutation.mutateAsync(task.uid);
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <TaskDetailModal
      task={task}
      onTaskUpdate={handleTaskUpdate}
      onTaskDelete={handleTaskDelete}
    />
  );
}
```

### Files That Need Updates

1. **`src/app/(app)/tasks/page.tsx`**
   - Currently uses local state
   - Should use `useTasks()` hook
   - Update `handleTaskUpdate` and `handleTaskDelete` to use API mutations

2. **`src/components/molecules/sprint-list-view.tsx`**
   - Update `handleTaskUpdate` and `handleTaskDelete` to use API mutations

3. **Other components using TaskDetailModal**
   - Connect callbacks to API hooks

## 📊 Dashboard Statistics Usage

### Using Project Statistics Hook

```typescript
import { useProjectStatistics } from "@/hooks/use-project-statistics";

function ProjectStatsComponent({ projectId }: { projectId?: string }) {
  const { data, isLoading, error } = useProjectStatistics(projectId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading statistics</div>;
  if (!data) return null;
  
  return (
    <div>
      <p>Total Tasks: {data.totalTasks}</p>
      <p>Completed: {data.completedTasks}</p>
      <p>Progress: {data.progressPercentage}%</p>
    </div>
  );
}
```

### Using Dashboard Hook

```typescript
import { useDashboard } from "@/hooks/use-dashboard";

function DashboardComponent() {
  const { data, isLoading, error } = useDashboard();
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div>Error loading dashboard</div>;
  if (!data) return null;
  
  return (
    <div>
      <ProjectStatistics data={data.projectStatistics} />
      {/* ... other components */}
    </div>
  );
}
```

## Summary

✅ **Completed:**
- Project Statistics API endpoint and methods
- Dashboard API integration (already existed, now used in dashboard page)
- `useProjectStatistics` hook
- Dashboard page now uses API

📝 **Remaining:**
- Connect Task Detail Modal callbacks to API in:
  - `src/app/(app)/tasks/page.tsx`
  - `src/components/molecules/sprint-list-view.tsx`
  - Any other components using TaskDetailModal


