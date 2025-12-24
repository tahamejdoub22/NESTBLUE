// src/components/molecules/task-detail-modal.tsx
"use client";

import { useState, useCallback, useRef, DragEvent, useEffect } from "react";
import { Task, TaskPriority, TaskStatus, Comment, Attachment } from "@/interfaces/task.interface";
import { Modal, useModal } from "@/components/molecules/modal";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Badge } from "@/components/atoms/badge";
import { Separator } from "@/components/atoms/separator";
import { Icon } from "@/components/atoms/icon";
import { Checkbox } from "@/components/atoms/checkbox";
import { Label } from "@/components/atoms/label";
import { PrioritySelect } from "@/components/molecules/priority-select";
import { StatusSelect } from "@/components/molecules/status-select";
import { DatePicker } from "@/components/molecules/date-picker";
import { Dropdown } from "@/components/molecules/dropdown";
import { AvatarSelectGroup, User } from "@/components/molecules/avatar-select-group";
import { CURRENCIES } from "@/core/config/constants";
import { formatCurrency } from "@/shared/utils/format";
import {
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  X as XIcon,
  Upload,
  Image as ImageIcon,
  File,
  Tag,
  Download,
  Loader2,
  Copy,
  Check,
  DollarSign,
} from "lucide-react";
import { cn, generateUniqueId } from "@/lib/utils";
import { toast } from "sonner";
import { taskApi } from "@/core/services/api-helpers";

// Attachment from backend
interface BackendAttachment extends Attachment {
  preview?: string;
}

interface TaskDetailModalProps {
  task: Task;
  availableUsers?: User[];
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void | Promise<void>;
  onBackendUpdate?: (taskId: string, data: Partial<Task> & { assigneeIds?: string[] }) => Promise<void>;
  onBackendDelete?: (taskId: string) => Promise<void>;
  onTaskRefresh?: (taskId: string) => Promise<Task | void>;
  minDate?: Date;
  maxDate?: Date;
}

export function TaskDetailModal({
  task: initialTask,
  availableUsers = [],
  onTaskUpdate,
  onTaskDelete,
  onBackendUpdate,
  onBackendDelete,
  minDate,
  maxDate,
  onTaskRefresh,
}: TaskDetailModalProps) {
  const { closeModal } = useModal();
  const [task, setTask] = useState<Task>(initialTask);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || "");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [subtaskUpdatingId, setSubtaskUpdatingId] = useState<string | null>(null);
  const [localEstimatedCost, setLocalEstimatedCost] = useState<{
    amount: number;
    currency: "USD" | "EUR" | "GBP" | "MAD";
  } | null>(initialTask.estimatedCost ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const onTaskUpdateRef = useRef(onTaskUpdate);
  const previousTaskUidRef = useRef<string | undefined>(initialTask.uid);
  const currentTaskUidRef = useRef<string | undefined>(initialTask.uid);

  // Helper: build a usable public URL for attachments (backend or external)
  const getAttachmentPublicUrl = useCallback((url: string | undefined): string => {
    if (!url) return "";
    // Absolute or data/blob URLs are used as-is
    if (/^(https?:)?\/\//.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    // Relative URL from backend (e.g. "/uploads/...")
    if (url.startsWith("/")) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const backendBase = apiBase.replace(/\/api\/?$/, "");
      return `${backendBase}${url}`;
    }
    return url;
  }, []);

  // Debug: initial props and state
  useEffect(() => {
    console.log("[TaskDetailModal] MOUNT", {
      initialTaskUid: initialTask.uid,
      identifier: initialTask.identifier,
      title: initialTask.title,
    });
    return () => {
      console.log("[TaskDetailModal] UNMOUNT", {
        lastTaskUid: currentTaskUidRef.current,
      });
    };
  }, [initialTask.uid, initialTask.identifier, initialTask.title]);

  // Keep ref updated with latest callback
  useEffect(() => {
    onTaskUpdateRef.current = onTaskUpdate;
  }, [onTaskUpdate]);

  // Keep localEstimatedCost in sync when backend task changes
  useEffect(() => {
    if (task.estimatedCost) {
      setLocalEstimatedCost({
        amount: task.estimatedCost.amount ?? 0,
        currency: task.estimatedCost.currency ?? "USD",
      });
    } else {
      setLocalEstimatedCost(null);
    }
  }, [task.estimatedCost]);

  // Get attachments array from task (handle both array and number formats)
  const getAttachments = useCallback((): BackendAttachment[] => {
    if (Array.isArray(task.attachments)) {
      return task.attachments as BackendAttachment[];
    }
    return [];
  }, [task.attachments]);

  // Get attachment count
  const getAttachmentCount = useCallback((): number => {
    if (Array.isArray(task.attachments)) {
      return task.attachments.length;
    }
    return typeof task.attachments === 'number' ? task.attachments : 0;
  }, [task.attachments]);

  // Refresh task data from backend (local only; parent handles its own cache)
  const refreshTask = useCallback(async (taskUid?: string): Promise<Task | null> => {
    // Use provided uid or current task uid from ref (to avoid stale closures)
    const uidToRefresh = taskUid || currentTaskUidRef.current || task.uid;
    if (!uidToRefresh) return null;
    
    try {
      console.log("[TaskDetailModal] refreshTask: START", {
        taskUidArg: taskUid,
        uidToRefresh,
      });

      // Always fetch directly from API to avoid refresh loops with parent
      const refreshedTask: Task | null = await taskApi.getByUid(uidToRefresh);
      console.log("[TaskDetailModal] refreshTask: fetched from API", {
        hasTask: !!refreshedTask,
      });
      
      if (refreshedTask) {
        // Merge backend result with existing state so we don't lose fields like assignees
        let mergedForReturn: Task | null = null;
        setTask((currentTask) => {
          const merged: Task = {
            ...currentTask,
            ...refreshedTask,
            assignees:
              (refreshedTask as any).assignees !== undefined
                ? (refreshedTask as any).assignees
                : (currentTask as any).assignees,
            ...(("assigneeIds" in (refreshedTask as any) || "assigneeIds" in (currentTask as any)) && {
              assigneeIds:
                (refreshedTask as any).assigneeIds !== undefined
                  ? (refreshedTask as any).assigneeIds
                  : (currentTask as any).assigneeIds,
            }),
          };

          currentTaskUidRef.current = merged.uid;

          // Only reset editing buffers if user is not actively editing
          if (!isEditingTitle) {
            setEditedTitle(merged.title);
          }
          if (!isEditingDescription) {
            setEditedDescription(merged.description || "");
          }

          // Notify parent with merged task
          onTaskUpdate(merged);
          mergedForReturn = merged;
          return merged;
        });

        setHasRefreshed(true);
        console.log("[TaskDetailModal] refreshTask: DONE", {
          uid: mergedForReturn?.uid ?? refreshedTask.uid,
          title: mergedForReturn?.title ?? refreshedTask.title,
          status: mergedForReturn?.status ?? refreshedTask.status,
        });
        return mergedForReturn;
      }
      
      return null;
    } catch (error: any) {
      console.error("[TaskDetailModal] refreshTask: ERROR", error);
      return null;
    }
  }, [onTaskUpdate, task.uid, isEditingTitle, isEditingDescription]);

  // Sync task state when initialTask UID changes (e.g. opening a different task)
  useEffect(() => {
    console.log("[TaskDetailModal] useEffect initialTask change / open", {
      previousUid: previousTaskUidRef.current,
      nextUid: initialTask.uid,
    });
    const taskUidChanged = previousTaskUidRef.current !== initialTask.uid;
    previousTaskUidRef.current = initialTask.uid;
    currentTaskUidRef.current = initialTask.uid;

    if (taskUidChanged) {
      // New task opened: seed local state from props
      setTask(initialTask);
      if (!isEditingTitle) {
        setEditedTitle(initialTask.title);
      }
      if (!isEditingDescription) {
        setEditedDescription(initialTask.description || "");
      }

      // Fetch latest data for this task once on open
      if (initialTask.uid) {
        setHasRefreshed(false);
        const timeoutId = setTimeout(() => {
          refreshTask(initialTask.uid).catch(console.error);
        }, 200);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [initialTask.uid, initialTask.title, initialTask.description, refreshTask, isEditingTitle, isEditingDescription]);


  // Helper function to get user IDs from task assignees
  const getUserIdsFromTask = useCallback(
    (currentTask: Task): string[] => {
      // Handle both assignees (array of names) and assigneeIds (array of IDs)
      const assignees = currentTask.assignees || [];
      const assigneeIds = (currentTask as any).assigneeIds || [];
      
      // If assigneeIds exist, use them directly
      if (assigneeIds.length > 0 && Array.isArray(assigneeIds)) {
        return assigneeIds.filter((id: string) => 
          availableUsers.some((user) => user.id === id)
        );
      }
      
      // Otherwise, match by name
      if (Array.isArray(assignees) && assignees.length > 0) {
        return availableUsers
          .filter((user) => assignees.includes(user.name || user.email))
          .map((user) => user.id);
      }
      
      return [];
    },
    [availableUsers]
  );
  
  // Also invalidate React Query cache when refreshing
  // Note: This is handled by parent components via onTaskRefresh
  const refreshTaskWithCacheInvalidation = useCallback(async () => {
    // Just call regular refresh - parent components handle cache invalidation
    await refreshTask();
  }, [refreshTask]);

  // Update task via backend only (no mock / local-only updates)
  const updateTask = useCallback(
    async (updates: Partial<Task>) => {
      setIsSaving(true);
      console.log("[TaskDetailModal] updateTask: CALLED", { updates });
      
      try {
        const uid = currentTaskUidRef.current || task.uid;
        if (!uid) {
          console.error("[TaskDetailModal] updateTask: MISSING_UID", { updates });
          toast.error("Cannot update task: missing backend UID");
          return;
        }

        // Build backend payload once, from the requested updates
        const backendData: any = { ...updates };
        if (updates.dueDate !== undefined) {
          backendData.dueDate = updates.dueDate instanceof Date 
            ? updates.dueDate.toISOString() 
            : (updates.dueDate ? updates.dueDate : null);
        }
        if (updates.startDate !== undefined) {
          backendData.startDate = updates.startDate instanceof Date 
            ? updates.startDate.toISOString() 
            : (updates.startDate ? updates.startDate : null);
        }
        if (updates.assignees) {
          // Convert assignees to assigneeIds if needed (frontend-only field!)
          const assigneeIds = (updates as any).assigneeIds || 
            (updates.assignees && availableUsers
              .filter(user => updates.assignees?.includes(user.name || user.email))
              .map(user => user.id)) || [];
          backendData.assigneeIds = assigneeIds;
        }
        
        // These fields are view-only for backend and must not be sent
        delete backendData.assignees;
        delete backendData.comments;
        delete backendData.subtasks;
        
        console.log("[TaskDetailModal] updateTask: CALL_BACKEND_DIRECT", {
          taskUid: uid,
          backendData,
        });

        // Persist changes and use the updated task returned by backend
        const savedTask = await taskApi.update(uid, backendData);
        console.log("[TaskDetailModal] updateTask: BACKEND_RESULT", {
          uid: savedTask.uid,
          title: savedTask.title,
          description: savedTask.description,
          assigneeIds: (savedTask as any).assigneeIds,
        });

        // Merge backend result with existing state so we don't lose fields
        setTask((currentTask) => {
          const merged: Task = {
            ...currentTask,
            ...savedTask,
            // Preserve assigneeIds/assignees if backend omits them
            assignees:
              (savedTask as any).assignees !== undefined
                ? (savedTask as any).assignees
                : (currentTask as any).assignees,
            ...(("assigneeIds" in (savedTask as any) || "assigneeIds" in (currentTask as any)) && {
              assigneeIds:
                (savedTask as any).assigneeIds !== undefined
                  ? (savedTask as any).assigneeIds
                  : (currentTask as any).assigneeIds,
            }),
          };

          currentTaskUidRef.current = merged.uid;

          // Keep editing buffers in sync if user is not actively editing
          if (!isEditingTitle) {
            setEditedTitle(merged.title);
          }
          if (!isEditingDescription) {
            setEditedDescription(merged.description || "");
          }

          // Notify parent with merged task so board keeps assignees as well
          onTaskUpdate(merged);

          return merged;
        });
      } catch (error: any) {
        console.error("[TaskDetailModal] updateTask: ERROR", error);
        toast.error(error?.message || "Failed to update task");
        // Try to resync from backend
        await refreshTask().catch(console.error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [onTaskUpdate, availableUsers, refreshTask, isEditingTitle, isEditingDescription, task.uid]
  );

  // Handle title save
  const handleSaveTitle = async () => {
    if (editedTitle.trim()) {
      try {
        console.log("[TaskDetailModal] handleSaveTitle", {
          editedTitle,
        });
        await updateTask({ title: editedTitle.trim() });
        setIsEditingTitle(false);
        toast.success("Title updated");
      } catch (error: any) {
        console.error("Failed to update title:", error);
        toast.error(error?.message || "Failed to update title");
        // Revert edited title on error - get current task state
        setTask((currentTask) => {
          setEditedTitle(currentTask.title);
          return currentTask;
        });
      }
    }
  };

  // Handle description save
  const handleSaveDescription = async () => {
    try {
      console.log("[TaskDetailModal] handleSaveDescription", {
        editedDescription,
      });
      await updateTask({ description: editedDescription.trim() || undefined });
      setIsEditingDescription(false);
      toast.success("Description updated");
    } catch (error: any) {
      console.error("Failed to update description:", error);
      toast.error(error?.message || "Failed to update description");
      // Revert edited description on error - get current task state
      setTask((currentTask) => {
        setEditedDescription(currentTask.description || "");
        return currentTask;
      });
    }
  };

  // Handle priority change
  const handlePriorityChange = async (priority: string) => {
    try {
      console.log("[TaskDetailModal] handlePriorityChange", { priority });
      await updateTask({ priority: priority as TaskPriority });
      toast.success("Priority updated");
    } catch (error: any) {
      console.error("Failed to update priority:", error);
      toast.error(error?.message || "Failed to update priority");
    }
  };

  // Handle status change
  const handleStatusChange = async (status: string) => {
    try {
      console.log("[TaskDetailModal] handleStatusChange", { status });
      await updateTask({ status: status as TaskStatus });
      toast.success("Status updated");
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(error?.message || "Failed to update status");
    }
  };

  // Handle assignees change
  const handleAssigneesChange = async (userIds: string[]) => {
    try {
      console.log("[TaskDetailModal] handleAssigneesChange", { userIds });
      const selectedUsers = availableUsers.filter((user) => userIds.includes(user.id));
      await updateTask({ 
        assignees: selectedUsers.map((user) => user.name || user.email),
        assigneeIds: userIds,
      } as any);
      toast.success("Assignees updated");
    } catch (error: any) {
      console.error("Failed to update assignees:", error);
      toast.error(error?.message || "Failed to update assignees");
    }
  };

  // Handle due date change
  const handleDueDateChange = async (date: Date | undefined) => {
    try {
      console.log("[TaskDetailModal] handleDueDateChange", { date });
      await updateTask({ dueDate: date });
      // Ensure we are fully in sync with backend after date changes
      await refreshTaskWithCacheInvalidation();
      toast.success("Due date updated");
    } catch (error: any) {
      console.error("Failed to update due date:", error);
      toast.error(error?.message || "Failed to update due date");
    }
  };

  // Handle start date change
  const handleStartDateChange = async (date: Date | undefined) => {
    try {
      console.log("[TaskDetailModal] handleStartDateChange", { date });
      await updateTask({ startDate: date });
      // Ensure we are fully in sync with backend after date changes
      await refreshTaskWithCacheInvalidation();
      toast.success("Start date updated");
    } catch (error: any) {
      console.error("Failed to update start date:", error);
      toast.error(error?.message || "Failed to update start date");
    }
  };

  // Handle estimated cost change
  const handleEstimatedCostChange = async (amount: number, currency: "USD" | "EUR" | "GBP" | "MAD") => {
    try {
      console.log("[TaskDetailModal] handleEstimatedCostChange", {
        amount,
        currency,
      });
      await updateTask({
        estimatedCost: {
          amount,
          currency,
        },
      });
      toast.success("Estimated cost saved");
    } catch (error: any) {
      console.error("Failed to update estimated cost:", error);
      toast.error(error?.message || "Failed to update estimated cost");
    }
  };

  // Handle estimated cost removal
  const handleRemoveEstimatedCost = async () => {
    try {
      console.log("[TaskDetailModal] handleRemoveEstimatedCost");
      await updateTask({ estimatedCost: undefined });
      toast.success("Estimated cost removed");
    } catch (error: any) {
      console.error("Failed to remove estimated cost:", error);
      toast.error(error?.message || "Failed to remove estimated cost");
    }
  };

  // Add subtask
  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task.uid) return;
    
    try {
      // Add subtask via backend API
      await taskApi.addSubtask(task.uid, { title: newSubtaskTitle.trim() });
      
      // Refresh task data from backend to get updated subtasks
      await refreshTaskWithCacheInvalidation();
      
      setNewSubtaskTitle("");
      toast.success("Subtask added successfully");
    } catch (error: any) {
      console.error("Failed to add subtask:", error);
      toast.error(error?.message || "Failed to add subtask");
    }
  };

  // Toggle subtask completion
  const handleToggleSubtask = useCallback(async (subtaskId: string, checked: boolean) => {
    if (!task.uid) return;
    
    try {
      setSubtaskUpdatingId(subtaskId);
      // Update subtask via backend API
      await taskApi.updateSubtask(task.uid, subtaskId, { completed: checked });
      
      // Refresh task data from backend to get updated subtasks
      await refreshTaskWithCacheInvalidation();
      
      toast.success("Subtask updated");
    } catch (error: any) {
      console.error("Failed to update subtask:", error);
      toast.error(error?.message || "Failed to update subtask");
    } finally {
      setSubtaskUpdatingId((current) => (current === subtaskId ? null : current));
    }
  }, [task.uid, refreshTask]);

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task.uid) return;
    
    try {
      // Delete subtask via backend API
      await taskApi.deleteSubtask(task.uid, subtaskId);
      
      // Refresh task data from backend to get updated subtasks
      await refreshTaskWithCacheInvalidation();
      
      toast.success("Subtask deleted");
    } catch (error: any) {
      console.error("Failed to delete subtask:", error);
      toast.error(error?.message || "Failed to delete subtask");
    }
  };

  // Calculate subtask progress
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Get comments array (handle both old number format and new array format)
  const getComments = (): Comment[] => {
    if (Array.isArray(task.comments)) {
      return task.comments;
    }
    return [];
  };

  // Get comment count
  const getCommentCount = (): number => {
    if (Array.isArray(task.comments)) {
      return task.comments.length;
    }
    return typeof task.comments === 'number' ? task.comments : 0;
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !task.uid) return;
    
    try {
      // Add comment via backend API
      await taskApi.addComment(task.uid, { text: newComment.trim() });
      
      // Refresh task data from backend to get updated comments
      await refreshTaskWithCacheInvalidation();
      
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error: any) {
      console.error("Failed to add comment:", error);
      toast.error(error?.message || "Failed to add comment");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // Create preview for image files from URL
  const createImagePreview = useCallback(async (url: string): Promise<string> => {
    try {
      // If it's already a data URL or blob URL, return it
      if (url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
      }
      // For remote URLs, we'll fetch and convert to data URL
      // This is a simplified version - in production you might want to cache this
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(blob);
      });
    } catch {
      return "";
    }
  }, []);

  // Handle file selection and upload
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !task.uid) return;

    console.log("[TaskDetailModal] handleFileSelect: START", {
      taskUid: task.uid,
      fileNames: Array.from(files).map((f) => f.name),
    });

    setIsUploading(true);
    try {
      // Upload each file to backend
      for (const file of Array.from(files)) {
        try {
          console.log("[TaskDetailModal] handleFileSelect: upload single", {
            taskUid: task.uid,
            fileName: file.name,
            size: file.size,
            type: file.type,
          });
          await taskApi.uploadAttachment(task.uid, file);
        } catch (error: any) {
          console.error("[TaskDetailModal] handleFileSelect: upload ERROR", {
            fileName: file.name,
            error,
          });
          toast.error(`Failed to upload ${file.name}: ${error?.message || 'Unknown error'}`);
        }
      }

      // Refresh task to get updated attachments
       console.log("[TaskDetailModal] handleFileSelect: REFRESH_AFTER_UPLOAD");
      await refreshTaskWithCacheInvalidation();
      toast.success("Files uploaded successfully");
    } catch (error: any) {
      console.error("[TaskDetailModal] handleFileSelect: ERROR", error);
      toast.error(error?.message || "Failed to upload files");
    } finally {
      console.log("[TaskDetailModal] handleFileSelect: END");
      setIsUploading(false);
    }
  }, [task.uid, refreshTaskWithCacheInvalidation]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("[TaskDetailModal] handleFileInputChange", {
      hasFiles: !!files,
      count: files?.length ?? 0,
    });
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    console.log("[TaskDetailModal] handleDrop", {
      hasFiles: !!files,
      count: files?.length ?? 0,
    });
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!task.uid) return;
    
    try {
      console.log("[TaskDetailModal] handleRemoveAttachment", {
        taskUid: task.uid,
        attachmentId,
      });
      await taskApi.deleteAttachment(task.uid, attachmentId);
      
      // Refresh task to get updated attachments
      console.log("[TaskDetailModal] handleRemoveAttachment: REFRESH_AFTER_DELETE");
      await refreshTaskWithCacheInvalidation();
      toast.success("Attachment deleted");
    } catch (error: any) {
      console.error("[TaskDetailModal] handleRemoveAttachment: ERROR", error);
      toast.error(error?.message || "Failed to delete attachment");
    }
  };

  // Download attachment
  const handleDownloadAttachment = async (attachment: BackendAttachment) => {
    if (!task.uid) return;
    
    try {
      const blob = await taskApi.downloadAttachment(task.uid, attachment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to download attachment:", error);
      // Fallback: try to open URL directly
      if (attachment.url) {
        window.open(attachment.url, '_blank');
      } else {
        toast.error(error?.message || "Failed to download attachment");
      }
    }
  };

  // Copy task identifier to clipboard
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(task.identifier);
      setCopiedId(true);
      toast.success("Task identifier copied to clipboard!");
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      toast.error("Failed to copy task identifier");
    }
  };

  return (
    <Modal.Content size="full" className="max-h-[95vh] overflow-hidden flex flex-col">
      {/* Header */}
      <Modal.Header className="flex-shrink-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-b border-border/50">
        <div className="space-y-4 pr-8">
          {/* Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setEditedTitle(task.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-2xl font-bold h-auto py-3 border-primary/50 focus:border-primary"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveTitle} className="flex-shrink-0 gap-2">
                <Icon icon={Save} size="sm" />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditedTitle(task.title);
                  setIsEditingTitle(false);
                }}
                className="flex-shrink-0"
              >
                <Icon icon={XIcon} size="sm" />
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3 group">
              <Text variant="h3" weight="bold" className="flex-1 text-foreground leading-tight">
                {task.title}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 gap-2"
              >
                <Icon icon={Edit2} size="sm" />
                Edit
              </Button>
            </div>
          )}

          {/* Task Identifier with Copy Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-200">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <Text variant="caption" weight="semibold" color="muted" className="text-xs uppercase tracking-wide">
                    ID:
                  </Text>
                  <Text 
                    variant="caption" 
                    weight="bold" 
                    className="text-sm font-mono text-foreground tracking-wider select-all"
                  >
                    {task.identifier}
                  </Text>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyId}
                className={cn(
                  "h-7 w-7 p-0 rounded-md transition-all duration-200",
                  "hover:bg-primary/20 hover:text-primary",
                  copiedId && "bg-green-500/20 text-green-600 dark:text-green-400"
                )}
                title="Copy identifier"
              >
                <Icon 
                  icon={copiedId ? Check : Copy} 
                  size="sm" 
                  className={cn(
                    "transition-all duration-200",
                    copiedId && "scale-110"
                  )}
                />
              </Button>
            </div>
          </div>

          {/* Status and Priority Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border">
              <Text variant="caption" weight="medium" color="muted" className="text-xs">
                Status
              </Text>
              <StatusSelect value={task.status} onChange={handleStatusChange} disabled={isSaving} />
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border">
              <Text variant="caption" weight="medium" color="muted" className="text-xs">
                Priority
              </Text>
              <PrioritySelect value={task.priority} onChange={handlePriorityChange} disabled={isSaving} />
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isSaving ? (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving…</span>
                </Badge>
              ) : hasRefreshed && (
                <Text
                  variant="caption"
                  color="muted"
                  className="flex items-center gap-1 text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  All changes saved
                </Text>
              )}
            </div>
          </div>
        </div>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className="space-y-8 flex-1 overflow-y-auto p-6">
        {/* Description Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Text variant="body" className="text-lg">📝</Text>
              </div>
              <Text variant="h6" weight="semibold" className="text-foreground">
                Description
              </Text>
            </div>
            {!isEditingDescription && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingDescription(true)}
                className="gap-2"
              >
                <Icon icon={Edit2} size="sm" />
                Edit
              </Button>
            )}
          </div>
          {isEditingDescription ? (
            <div className="space-y-3">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Add a detailed description for this task..."
                rows={6}
                className={cn(
                  "w-full px-4 py-3 text-sm rounded-lg resize-none transition-all",
                  "border border-border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                  "placeholder:text-muted-foreground"
                )}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveDescription} className="gap-2">
                  <Icon icon={Save} size="xs" />
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditedDescription(task.description || "");
                    setIsEditingDescription(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "rounded-lg p-4 transition-colors",
                task.description
                  ? "bg-muted/30 border border-border"
                  : "bg-muted/10 border border-dashed border-border"
              )}
            >
              <Text
                variant="body"
                color={task.description ? "default" : "muted"}
                className={cn(
                  "whitespace-pre-wrap",
                  !task.description && "italic"
                )}
              >
                {task.description || "No description provided. Click edit to add one."}
              </Text>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Details Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Text variant="body" className="text-lg">📋</Text>
            </div>
            <Text variant="h6" weight="semibold" className="text-foreground">
              Task Details
            </Text>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignees */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  <Text variant="caption">👥</Text>
                </div>
                Assignees
              </Label>
              <div className="rounded-lg border border-border bg-card p-3">
                <AvatarSelectGroup
                  users={availableUsers}
                  selectedUserIds={getUserIdsFromTask(task)}
                  onSelectionChange={handleAssigneesChange}
                  placeholder="Unassigned"
                  allowMultiple={true}
                  className="w-full"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10">
                  <Icon icon={Calendar} size="xs" className="text-red-500" />
                </div>
                Due Date
              </Label>
              <div className="rounded-lg border border-border bg-card">
                <DatePicker
                  value={task.dueDate}
                  onChange={handleDueDateChange}
                  placeholder="Set due date"
                  className="w-full"
                  minDate={minDate}
                  maxDate={maxDate}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                  <Icon icon={Clock} size="xs" className="text-blue-500" />
                </div>
                Start Date
              </Label>
              <div className="rounded-lg border border-border bg-card">
                <DatePicker
                  value={task.startDate}
                  onChange={handleStartDateChange}
                  placeholder="Set start date"
                  className="w-full"
                  minDate={minDate}
                  maxDate={maxDate}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10">
                  <Icon icon={DollarSign} size="xs" className="text-green-500" />
                </div>
                Estimated Cost
              </Label>
              <div className="space-y-2">
                {localEstimatedCost ? (
                  <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Text variant="body-sm" weight="semibold" className="text-foreground">
                        {formatCurrency(localEstimatedCost.amount || 0, localEstimatedCost.currency || "USD")}
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveEstimatedCost}
                        className="h-7 w-7 p-0"
                      >
                        <Icon icon={XIcon} size="xs" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={localEstimatedCost.amount ?? 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setLocalEstimatedCost((prev) =>
                              prev ? { ...prev, amount: value } : { amount: value, currency: "USD" }
                            );
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Currency</Label>
                        <Dropdown
                          items={CURRENCIES.map((curr) => ({
                            value: curr.value,
                            label: `${curr.label} (${curr.symbol})`,
                          }))}
                          value={localEstimatedCost.currency || "USD"}
                          onSelect={async (value) => {
                            setLocalEstimatedCost((prev) =>
                              prev
                                ? { ...prev, currency: value as "USD" | "EUR" | "GBP" | "MAD" }
                                : { amount: 0, currency: value as "USD" | "EUR" | "GBP" | "MAD" }
                            );
                          }}
                          placeholder="Select currency"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() =>
                          localEstimatedCost &&
                          handleEstimatedCostChange(localEstimatedCost.amount, localEstimatedCost.currency)
                        }
                        disabled={!localEstimatedCost}
                        className="gap-2"
                      >
                        <Icon icon={Save} size="xs" />
                        Save Estimated Cost
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-card p-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLocalEstimatedCost({ amount: 0, currency: "USD" });
                      }}
                      className="w-full gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon icon={Plus} size="xs" />
                      Add Estimated Cost
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Activity Summary
              </Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Icon icon={MessageSquare} size="sm" className="text-blue-500" />
                  <Text variant="body-sm" weight="medium" className="text-foreground">
                    {getCommentCount()}
                  </Text>
                  <Text variant="caption" color="muted">
                    comment{getCommentCount() !== 1 ? "s" : ""}
                  </Text>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Icon icon={Paperclip} size="sm" className="text-green-500" />
                  <Text variant="body-sm" weight="medium" className="text-foreground">
                    {getAttachmentCount()}
                  </Text>
                  <Text variant="caption" color="muted">
                    attachment{getAttachmentCount() !== 1 ? "s" : ""}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Attachments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon icon={Paperclip} size="md" className="text-primary" />
              </div>
              <div>
                <Text variant="h6" weight="semibold" className="text-foreground">
                  Attachments
                </Text>
                <Text variant="caption" color="muted">
                  {getAttachmentCount()} file{getAttachmentCount() !== 1 ? "s" : ""} attached
                </Text>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileInputChange}
              className="hidden"
              id="attachment-upload"
              disabled={isUploading}
            />
            <Button 
              size="sm" 
              variant="outline" 
              type="button"
              disabled={isUploading}
              className="gap-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (fileInputRef.current && !isUploading) {
                  fileInputRef.current.click();
                }
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Icon icon={Upload} size="sm" />
                  Upload Files
                </>
              )}
            </Button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={(e) => {
              // Only trigger file input if clicking on empty drop zone (not on child elements)
              if (getAttachmentCount() === 0 && e.target === e.currentTarget && fileInputRef.current && !isUploading) {
                fileInputRef.current.click();
              }
            }}
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border bg-muted/5 hover:border-primary/50 hover:bg-muted/10",
              getAttachmentCount() === 0 && "min-h-[200px] cursor-pointer"
            )}
          >
            {getAttachments().length > 0 ? (
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAttachments().map((attachment) => (
                    <div
                      key={attachment.id}
                      className="group relative rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Image Preview */}
                      {attachment.type?.startsWith("image/") ? (
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={getAttachmentPublicUrl(attachment.url)}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                      ) : (
                        <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <Icon
                            icon={File}
                            size="2xl"
                            className="text-muted-foreground"
                          />
                        </div>
                      )}

                      {/* File Info */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Text
                              variant="body-sm"
                              weight="medium"
                              className="truncate text-foreground"
                              title={attachment.name}
                            >
                              {attachment.name}
                            </Text>
                            <Text variant="caption" color="muted" className="mt-0.5">
                              {formatFileSize(attachment.size)}
                            </Text>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="h-7 px-2 flex-1"
                          >
                            <Icon icon={Download} size="xs" className="mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Icon icon={Trash2} size="xs" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div
                  className={cn(
                    "mb-4 rounded-full p-4 transition-all duration-200",
                    isDragging ? "bg-primary/20 scale-110" : "bg-muted"
                  )}
                >
                  <Icon
                    icon={Upload}
                    size="2xl"
                    className={cn(
                      "transition-colors",
                      isDragging ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <Text variant="body" weight="medium" className="mb-1">
                  {isDragging ? "Drop files here" : "No attachments yet"}
                </Text>
                <Text variant="caption" color="muted" className="text-center max-w-sm">
                  {isDragging
                    ? "Release to upload files"
                    : "Drag and drop files here, or click the upload button above"}
                </Text>
                <Text variant="caption" color="muted" className="mt-2 text-xs">
                  Supports images, PDFs, documents, and more
                </Text>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Subtasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <Icon icon={CheckSquare} size="md" className="text-green-500" />
              </div>
              <div className="flex items-center gap-3">
                <Text variant="h6" weight="semibold" className="text-foreground">
                  Subtasks
                </Text>
                {totalSubtasks > 0 && (
                  <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {completedSubtasks}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-foreground">{totalSubtasks}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalSubtasks > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 border border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <Text variant="body-sm" weight="medium" className="text-foreground">
                    Completion Progress
                  </Text>
                </div>
                <Text variant="body-sm" weight="bold" className="text-green-600 dark:text-green-400">
                  {Math.round(subtaskProgress)}%
                </Text>
              </div>
              <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 via-green-500 to-green-600 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-sm"
                  style={{ width: `${subtaskProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            </div>
          )}

          {/* Subtask List */}
          {totalSubtasks > 0 ? (
            <div className="space-y-2">
              {task.subtasks?.map((subtask, index) => (
                <div
                  key={subtask.id}
                  className={cn(
                    "group flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.01]",
                    subtask.completed
                      ? "bg-muted/50 border-muted-foreground/20 opacity-75"
                      : "bg-card border-border hover:border-primary/40 hover:bg-card/80"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Checkbox with better styling */}
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={(checked) => handleToggleSubtask(subtask.id, checked ?? false)}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {/* Subtask Title */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer select-none"
                    onClick={() => handleToggleSubtask(subtask.id, !subtask.completed)}
                  >
                    <Text
                      variant="body"
                      className={cn(
                        "transition-all duration-200 select-none",
                        subtask.completed
                          ? "line-through text-muted-foreground/70"
                          : "text-foreground font-medium"
                      )}
                    >
                      {subtask.title}
                    </Text>
                  </div>

                  {/* Delete Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubtask(subtask.id);
                    }}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 transition-all duration-200",
                      "h-8 w-8 p-0 rounded-lg",
                      "hover:bg-destructive/10 hover:text-destructive",
                      "focus-visible:ring-2 focus-visible:ring-destructive/20"
                    )}
                    aria-label={`Delete subtask: ${subtask.title}`}
                  >
                    <Icon icon={Trash2} size="sm" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-xl bg-muted/20">
              <div className="mb-3 rounded-full p-3 bg-muted">
                <Icon icon={CheckSquare} size="xl" className="text-muted-foreground" />
              </div>
              <Text variant="body" weight="medium" color="muted" className="mb-1">
                No subtasks yet
              </Text>
              <Text variant="caption" color="muted" className="text-center max-w-xs">
                Break down your task into smaller, manageable steps
              </Text>
            </div>
          )}

          {/* Add Subtask */}
          <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Icon icon={Plus} size="xs" className="text-muted-foreground" />
              </div>
            </div>
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSubtaskTitle.trim()) {
                  e.preventDefault();
                  handleAddSubtask();
                }
                if (e.key === "Escape") {
                  setNewSubtaskTitle("");
                }
              }}
              placeholder="Add a new subtask..."
              size="sm"
              className="flex-1 border-0 bg-transparent hover:bg-muted/20 focus-visible:ring-0 placeholder:text-muted-foreground/60 transition-colors"
            />
            <Button
              size="sm"
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
              className={cn(
                "gap-2 transition-all duration-200",
                !newSubtaskTitle.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon icon={Plus} size="sm" />
              Add
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Optional Custom Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                <Icon icon={Tag} size="md" className="text-orange-500" />
              </div>
              <Text variant="h6" weight="semibold" className="text-foreground">
                Custom Fields
              </Text>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCustomFields(prev => [...prev, { key: '', value: '' }])}
              className="gap-2"
            >
              <Icon icon={Plus} size="sm" />
              Add Field
            </Button>
          </div>
          {customFields.length > 0 ? (
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card">
                  <Input
                    placeholder="Field name..."
                    value={field.key}
                    onChange={(e) => {
                      const newFields = [...customFields];
                      newFields[index].key = e.target.value;
                      setCustomFields(newFields);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value..."
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...customFields];
                      newFields[index].value = e.target.value;
                      setCustomFields(newFields);
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCustomFields(prev => prev.filter((_, i) => i !== index))}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Icon icon={Trash2} size="sm" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/10">
              <div className="mb-3 rounded-full p-3 bg-muted">
                <Icon icon={Tag} size="xl" className="text-muted-foreground" />
              </div>
              <Text variant="body" weight="medium" color="muted" className="mb-1">
                No custom fields
              </Text>
              <Text variant="caption" color="muted" className="text-center">
                Add custom fields to track additional information
              </Text>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Comments Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <Icon icon={MessageSquare} size="md" className="text-indigo-500" />
            </div>
            <div className="flex items-center gap-2">
              <Text variant="h6" weight="semibold" className="text-foreground">
                Comments
              </Text>
              <Badge variant="secondary">{getCommentCount()}</Badge>
            </div>
          </div>

          {/* Existing Comments */}
          {getComments().length > 0 && (
            <div className="space-y-3">
              {getComments().map((comment) => {
                // Handle author as string or User object from backend
                const authorName = typeof comment.author === 'string' 
                  ? comment.author 
                  : (comment.author as any)?.name || (comment.author as any)?.email || 'Unknown';
                const authorInitial = authorName.charAt(0).toUpperCase();
                
                return (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-border bg-card p-4 space-y-2 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <Text variant="caption" weight="medium" className="text-primary">
                            {authorInitial}
                          </Text>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Text variant="body-sm" weight="semibold" className="text-foreground">
                              {authorName}
                            </Text>
                            <Text variant="caption" color="muted">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }) : 'Just now'}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Text variant="body" className="text-foreground whitespace-pre-wrap">
                      {comment.text}
                    </Text>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Comment Form */}
          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && newComment.trim()) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Write a comment... (Press Ctrl+Enter to submit)"
              rows={4}
              className={cn(
                "w-full px-4 py-3 text-sm rounded-lg resize-none transition-all",
                "border border-border bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                "placeholder:text-muted-foreground"
              )}
            />
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="gap-2"
              >
                <Icon icon={MessageSquare} size="xs" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="flex-shrink-0">
        {onTaskDelete && (
          <Button
            variant="outline"
            onClick={async () => {
              try {
                if (onBackendDelete && task.uid) {
                  await onBackendDelete(task.uid);
                  toast.success("Task deleted successfully");
                } else {
                  await onTaskDelete(task.uid || task.identifier);
                }
                closeModal();
              } catch (error: any) {
                toast.error(error?.message || "Failed to delete task");
              }
            }}
            className="mr-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Icon icon={Trash2} size="sm" className="mr-2" />
            Delete Task
          </Button>
        )}
      </Modal.Footer>
    </Modal.Content>
  );
}
