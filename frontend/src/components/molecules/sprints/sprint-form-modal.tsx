"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ModalProvider as ModalProviderComponent,
  ModalContent as ModalContentComponent,
  ModalHeader as ModalHeaderComponent,
  ModalBody as ModalBodyComponent,
  ModalFooter as ModalFooterComponent,
} from "@/components/molecules/modal";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { InputGroup } from "@/components/molecules/input-group";
import { DatePicker } from "@/components/molecules/date-picker";
import { sprintSchema, type SprintFormData } from "@/core/schemas/sprint-schema";
import type { Sprint } from "@/interfaces";
import { Text } from "@/components/atoms/text";
import { Target } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

interface SprintFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SprintFormData) => Promise<void>;
  sprint?: Sprint | null;
  isLoading?: boolean;
}

export function SprintFormModal({
  open,
  onOpenChange,
  onSubmit,
  sprint,
  isLoading = false,
}: SprintFormModalProps) {
  const { projects } = useProjects();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema) as any,
    defaultValues: {
      name: "",
      projectId: "",
      startDate: undefined,
      endDate: undefined,
      status: "planned",
      goal: "",
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedStatus = watch("status");
  const watchedProjectId = watch("projectId");

  // Reset form when sprint changes
  useEffect(() => {
    if (sprint) {
      reset({
        name: sprint.name,
        projectId: sprint.projectId,
        startDate: sprint.startDate ? new Date(sprint.startDate) : undefined,
        endDate: sprint.endDate ? new Date(sprint.endDate) : undefined,
        status: sprint.status,
        goal: sprint.goal || "",
      });
    } else {
      reset({
        name: "",
        projectId: "",
        startDate: undefined,
        endDate: undefined,
        status: "planned",
        goal: "",
      });
    }
  }, [sprint, reset]);

  const onFormSubmit = async (data: SprintFormData) => {
    try {
      await onSubmit(data);
      if (!sprint) {
        reset();
      }
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <ModalProviderComponent defaultOpen={open} onOpenChange={onOpenChange}>
      <ModalContentComponent size="lg" showCloseButton className="max-w-3xl">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col max-h-[90vh]">
          <ModalHeaderComponent className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h4" weight="bold">
                  {sprint ? "Edit Sprint" : "Create New Sprint"}
                </Text>
                <Text variant="body-sm" color="muted" className="mt-1">
                  {sprint ? "Update sprint details" : "Set up a new sprint for your project"}
                </Text>
              </div>
            </div>
          </ModalHeaderComponent>

          <ModalBodyComponent className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-5 px-6 py-4">
          <InputGroup
            label="Sprint Name"
            error={errors.name?.message}
            required
          >
            <Input
              {...register("name")}
              placeholder="e.g., Sprint 1 - User Authentication"
              className="w-full"
            />
          </InputGroup>

          <InputGroup
            label="Project"
            error={errors.projectId?.message}
            required
          >
            <Select
              value={watchedProjectId}
              onValueChange={(value) => setValue("projectId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.uid || project.id || `project-${project.name}`} value={project.uid || project.id || ""}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No projects available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </InputGroup>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              label="Start Date"
              error={errors.startDate?.message}
              required
            >
              <DatePicker
                value={watchedStartDate}
                onChange={(date) => setValue("startDate", date as Date)}
                placeholder="Select start date"
                maxDate={watchedEndDate || undefined}
              />
            </InputGroup>

            <InputGroup
              label="End Date"
              error={errors.endDate?.message}
              required
            >
              <DatePicker
                value={watchedEndDate}
                onChange={(date) => setValue("endDate", date as Date)}
                placeholder="Select end date"
                minDate={watchedStartDate || undefined}
              />
            </InputGroup>
          </div>

          <InputGroup
            label="Status"
            error={errors.status?.message}
          >
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as "planned" | "active" | "completed")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </InputGroup>

              <InputGroup
                label="Goal"
                error={errors.goal?.message}
              >
                <Textarea
                  {...register("goal")}
                  placeholder="What is the main goal of this sprint?"
                  className="min-h-[100px] resize-none"
                />
              </InputGroup>
            </div>
          </ModalBodyComponent>

          <ModalFooterComponent className="flex-shrink-0 border-t bg-muted/30">
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
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  "Saving..."
                ) : sprint ? (
                  "Update Sprint"
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Create Sprint
                  </>
                )}
              </Button>
            </div>
          </ModalFooterComponent>
        </form>
      </ModalContentComponent>
    </ModalProviderComponent>
  );
}

