"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/molecules/modal";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { InputGroup } from "@/components/molecules/input-group";
import { DatePicker } from "@/components/molecules/date-picker";
import { Dropdown } from "@/components/molecules/dropdown";
import { MultiSelect } from "@/components/molecules/multiselect";
import { PrioritySelect } from "@/components/molecules/priority-select";
import { StatusSelect } from "@/components/molecules/status-select";
import { taskSchema, type TaskFormData } from "@/core/schemas/task-schema";
import type { Task, TaskStatus } from "@/interfaces";
import { Text } from "@/components/atoms/text";
import { FileText, DollarSign } from "lucide-react";
import { CURRENCIES } from "@/core/config/constants";
import { useUsers } from "@/hooks/use-users";
import { useSprints, useSprint } from "@/hooks/use-sprints";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "backlog", label: "Backlog" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: Task | null;
  projectId?: string;
  sprintId?: string; // Optional default sprint ID
  defaultStatus?: TaskStatus;
  isLoading?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function TaskFormModal({
  open,
  onOpenChange,
  onSubmit,
  task,
  projectId,
  sprintId,
  defaultStatus,
  isLoading = false,
  minDate,
  maxDate,
}: TaskFormModalProps) {
  const { users } = useUsers();
  const { sprints } = useSprints(projectId);
  // Fetch sprint data when sprintId is provided to get sprint date range
  const { sprint: currentSprint } = useSprint(sprintId || "");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus || "todo",
      priority: "medium",
      assigneeIds: [],
      dueDate: undefined,
      startDate: undefined,
      estimatedCost: undefined,
      projectId: projectId,
      sprintId: sprintId,
    },
  });

  const watchedStatus = watch("status");
  const watchedPriority = watch("priority");
  const watchedDueDate = watch("dueDate");
  const watchedStartDate = watch("startDate");
  const watchedAssigneeIds = watch("assigneeIds");
  const watchedEstimatedCost = watch("estimatedCost");
  const watchedSprintId = watch("sprintId");

  // Normalize date to midnight (remove time component) for proper comparison
  const normalizeDate = (date: Date | string | undefined): Date | undefined => {
    if (!date) return undefined;
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return undefined;
    // Set to midnight to ensure proper date-only comparison
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Calculate date constraints: use sprint dates if in sprint context, otherwise use project dates
  const effectiveMinDate = useMemo(() => {
    if (sprintId && currentSprint?.startDate) {
      const normalized = normalizeDate(currentSprint.startDate);
      if (normalized) return normalized;
    }
    return normalizeDate(minDate);
  }, [sprintId, currentSprint?.startDate, minDate]);

  const effectiveMaxDate = useMemo(() => {
    if (sprintId && currentSprint?.endDate) {
      const normalized = normalizeDate(currentSprint.endDate);
      if (normalized) return normalized;
    }
    return normalizeDate(maxDate);
  }, [sprintId, currentSprint?.endDate, maxDate]);

  useEffect(() => {
    if (!open) {
      reset({
        title: "",
        description: "",
        status: defaultStatus || "todo",
        priority: "medium",
        assigneeIds: [],
        dueDate: undefined,
        startDate: undefined,
        estimatedCost: undefined,
        projectId: projectId,
        sprintId: sprintId,
      });
      return;
    }

    if (task) {
      setValue("title", task.title);
      setValue("description", task.description || "");
      setValue("status", task.status);
      setValue("priority", task.priority);
      setValue("assigneeIds", (task as any).assigneeIds || task.assignees || []);
      setValue("dueDate", task.dueDate ? (task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate)) : undefined);
      setValue("startDate", task.startDate ? (task.startDate instanceof Date ? task.startDate : new Date(task.startDate)) : undefined);
      setValue("estimatedCost", task.estimatedCost);
      setValue("projectId", (task as any).projectId || task.projectId || projectId);
      // Preserve existing sprintId when editing, or use prop sprintId if in sprint context
      setValue("sprintId", (task as any).sprintId || task.sprintId || sprintId);
    } else {
      reset({
        title: "",
        description: "",
        status: defaultStatus || "todo",
        priority: "medium",
        assigneeIds: [],
        dueDate: undefined,
        startDate: undefined,
        estimatedCost: undefined,
        projectId: projectId,
        sprintId: sprintId,
      });
    }
  }, [open, task, projectId, sprintId, defaultStatus, setValue, reset]);

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const currencyItems = CURRENCIES.map((curr) => ({
    value: curr.value,
    label: `${curr.label} (${curr.symbol})`,
  }));

  const userItems = users.map((user) => ({
    value: user.id,
    label: user.name || user.email,
  }));

  return (
    <Modal.Provider defaultOpen={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg" showCloseButton className="max-w-3xl">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col max-h-[90vh]">
          <Modal.Header className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h4" weight="bold">
                  {task ? "Edit Task" : "Create New Task"}
                </Text>
                <Text variant="body-sm" color="muted" className="mt-1">
                  {task ? "Update task details" : "Add a new task to your project"}
                </Text>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-6 px-6 py-4">
              {/* Task Title */}
              <InputGroup
                label="Task Title"
                required
                error={errors.title?.message}
              >
                <Input
                  {...register("title")}
                  placeholder="Enter task title"
                  error={!!errors.title}
                />
              </InputGroup>

              {/* Description */}
              <InputGroup
                label="Description"
                error={errors.description?.message}
              >
                <textarea
                  {...register("description")}
                  placeholder="Enter task description"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </InputGroup>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Status */}
                <InputGroup
                  label="Status"
                  error={errors.status?.message}
                >
                  <StatusSelect
                    value={watchedStatus || "todo"}
                    onChange={(value) => setValue("status", value as any)}
                  />
                </InputGroup>

                {/* Priority */}
                <InputGroup
                  label="Priority"
                  error={errors.priority?.message}
                >
                  <PrioritySelect
                    value={watchedPriority || "medium"}
                    onChange={(value) => setValue("priority", value as any)}
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Start Date */}
                <InputGroup
                  label="Start Date"
                  error={errors.startDate?.message}
                  helperText={
                    sprintId && effectiveMinDate && effectiveMaxDate
                      ? `Select a date between ${effectiveMinDate.toLocaleDateString()} and ${effectiveMaxDate.toLocaleDateString()}`
                      : effectiveMinDate && effectiveMaxDate
                      ? `Select a date between ${effectiveMinDate.toLocaleDateString()} and ${effectiveMaxDate.toLocaleDateString()}`
                      : undefined
                  }
                >
                  <DatePicker
                    key={`start-date-${sprintId || 'no-sprint'}-${effectiveMinDate?.getTime() || 'no-min'}-${effectiveMaxDate?.getTime() || 'no-max'}`}
                    value={watchedStartDate ? normalizeDate(watchedStartDate) : undefined}
                    onChange={(date) => {
                      const normalizedDate = date ? normalizeDate(date) : undefined;
                      setValue("startDate", normalizedDate || undefined, { shouldValidate: true });
                      // If due date is before new start date, update it
                      if (normalizedDate && watchedDueDate) {
                        const normalizedDue = normalizeDate(watchedDueDate);
                        if (normalizedDue && normalizedDue < normalizedDate) {
                          setValue("dueDate", normalizedDate, { shouldValidate: true });
                        }
                      }
                    }}
                    placeholder="Select start date"
                    minDate={effectiveMinDate}
                    maxDate={effectiveMaxDate}
                    disabled={false}
                  />
                </InputGroup>

                {/* Due Date */}
                <InputGroup
                  label="Due Date"
                  error={errors.dueDate?.message}
                  helperText={
                    sprintId && effectiveMinDate && effectiveMaxDate
                      ? `Select a date between ${effectiveMinDate.toLocaleDateString()} and ${effectiveMaxDate.toLocaleDateString()}${watchedStartDate ? ` (after start date: ${normalizeDate(watchedStartDate)?.toLocaleDateString()})` : ''}`
                      : watchedStartDate
                      ? `Must be on or after start date (${normalizeDate(watchedStartDate)?.toLocaleDateString()})`
                      : effectiveMinDate && effectiveMaxDate
                      ? `Select a date between ${effectiveMinDate.toLocaleDateString()} and ${effectiveMaxDate.toLocaleDateString()}`
                      : undefined
                  }
                >
                  <DatePicker
                    key={`due-date-${sprintId || 'no-sprint'}-${(watchedStartDate ? normalizeDate(watchedStartDate) : effectiveMinDate)?.getTime() || 'no-min'}-${effectiveMaxDate?.getTime() || 'no-max'}`}
                    value={watchedDueDate ? normalizeDate(watchedDueDate) : undefined}
                    onChange={(date) => {
                      const normalizedDate = date ? normalizeDate(date) : undefined;
                      setValue("dueDate", normalizedDate || undefined, { shouldValidate: true });
                    }}
                    placeholder="Select due date"
                    minDate={watchedStartDate ? normalizeDate(watchedStartDate) || effectiveMinDate : effectiveMinDate}
                    maxDate={effectiveMaxDate}
                    disabled={false}
                  />
                </InputGroup>
              </div>

              {/* Assignees */}
              <InputGroup
                label="Assignees"
                helperText="Select team members to assign this task to"
                error={errors.assigneeIds?.message}
              >
                <MultiSelect
                  options={userItems}
                  value={watchedAssigneeIds || []}
                  onChange={(value) => setValue("assigneeIds", value)}
                  placeholder="Select assignees..."
                />
              </InputGroup>

              {/* Sprint Assignment */}
              {projectId && sprints.length > 0 && (
                <>
                  {sprintId ? (
                    // Show read-only sprint info when in sprint context
                    <InputGroup
                      label="Sprint"
                      helperText="This task will be assigned to the current sprint"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted/50 text-sm">
                        <span className="text-muted-foreground">
                          {sprints.find(s => (s.id || s.uid) === sprintId)?.name || "Current Sprint"}
                        </span>
                      </div>
                    </InputGroup>
                  ) : (
                    // Show sprint selector when not in sprint context
                    <InputGroup
                      label="Sprint"
                      helperText="Assign this task to a sprint (optional)"
                      error={errors.sprintId?.message}
                    >
                      <Dropdown
                        items={[
                          { value: "", label: "No Sprint" },
                          ...sprints.map((sprint) => ({
                            value: sprint.id || sprint.uid || "",
                            label: sprint.name,
                          })),
                        ]}
                        value={watchedSprintId || ""}
                        onSelect={(value) => setValue("sprintId", value || undefined)}
                        placeholder="Select sprint..."
                      />
                    </InputGroup>
                  )}
                </>
              )}

              {/* Estimated Cost */}
              <div className="space-y-4 p-5 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <Text variant="body-sm" weight="semibold" className="text-foreground">
                    Estimated Cost (Optional)
                  </Text>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputGroup
                    label="Amount"
                    error={errors.estimatedCost?.amount?.message}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={watchedEstimatedCost?.amount || ""}
                      onChange={(e) => {
                        const amount = e.target.value ? parseFloat(e.target.value) : undefined;
                        setValue("estimatedCost", {
                          ...watchedEstimatedCost,
                          amount,
                          currency: watchedEstimatedCost?.currency || "USD",
                        });
                      }}
                    />
                  </InputGroup>
                  <InputGroup
                    label="Currency"
                    error={errors.estimatedCost?.currency?.message}
                  >
                    <Dropdown
                      items={currencyItems}
                      value={watchedEstimatedCost?.currency || "USD"}
                      onSelect={(value) => {
                        setValue("estimatedCost", {
                          ...watchedEstimatedCost,
                          amount: watchedEstimatedCost?.amount,
                          currency: value as "USD" | "EUR" | "GBP" | "MAD",
                        });
                      }}
                      placeholder="Select currency"
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="flex-shrink-0 border-t bg-muted/30">
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={isLoading}
                className="min-w-[140px]"
              >
                {task ? (
                  "Update Task"
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Provider>
  );
}


