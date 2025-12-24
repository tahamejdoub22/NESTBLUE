"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/molecules/modal";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { InputGroup } from "@/components/molecules/input-group";
import { DatePicker } from "@/components/molecules/date-picker";
import { Dropdown } from "@/components/molecules/dropdown";
import { projectSchema, type ProjectFormData } from "@/core/schemas/project-schema";
import type { Project } from "@/interfaces";
import { Text } from "@/components/atoms/text";
import { FolderKanban, Hash } from "lucide-react";
import { useAllSpaces } from "@/hooks/use-all-spaces";
import { Label } from "@/components/atoms/label";
import { Checkbox } from "@/components/atoms/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "on-hold", label: "On Hold" },
];

const COLOR_OPTIONS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#14b8a6", label: "Teal" },
];

const ICON_OPTIONS = [
  { value: "folder", label: "Folder" },
  { value: "briefcase", label: "Briefcase" },
  { value: "rocket", label: "Rocket" },
  { value: "target", label: "Target" },
  { value: "lightbulb", label: "Lightbulb" },
  { value: "code", label: "Code" },
  { value: "palette", label: "Palette" },
  { value: "shopping-cart", label: "Shopping Cart" },
];

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  project?: Project | null;
  isLoading?: boolean;
}

export function ProjectFormModal({
  open,
  onOpenChange,
  onSubmit,
  project,
  isLoading = false,
}: ProjectFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      progress: 0,
      startDate: undefined,
      endDate: undefined,
      color: "#6366f1",
      icon: "folder",
      spaceId: undefined,
      createSpace: false,
      spaceName: "",
      spaceDescription: "",
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedStatus = watch("status");
  const watchedColor = watch("color");
  const watchedIcon = watch("icon");
  const watchedCreateSpace = watch("createSpace");
  const watchedSpaceName = watch("spaceName");
  const watchedSpaceId = watch("spaceId");
  
  // Get all team spaces
  const { spaces } = useAllSpaces();

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        description: "",
        status: "active",
        progress: 0,
        startDate: undefined,
        endDate: undefined,
        color: "#6366f1",
        icon: "folder",
        spaceId: undefined,
        createSpace: false,
        spaceName: "",
        spaceDescription: "",
      });
      return;
    }

    if (project) {
      setValue("name", project.name);
      setValue("description", project.description || "");
      setValue("status", project.status || "active");
      setValue("progress", project.progress || 0);
      setValue("startDate", project.startDate ? new Date(project.startDate) : undefined);
      setValue("endDate", project.endDate ? new Date(project.endDate) : undefined);
      setValue("color", (project as any).color || "#6366f1");
      setValue("icon", (project as any).icon || "folder");
      setValue("createSpace", false);
      setValue("spaceName", "");
      setValue("spaceDescription", "");
    } else {
      reset({
        name: "",
        description: "",
        status: "active",
        progress: 0,
        startDate: undefined,
        endDate: undefined,
        color: "#6366f1",
        icon: "folder",
        spaceId: undefined,
        createSpace: false,
        spaceName: "",
        spaceDescription: "",
      });
    }
  }, [open, project, setValue, reset]);

  const onFormSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Modal.Provider defaultOpen={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg" showCloseButton className="max-w-3xl">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col max-h-[90vh]">
          <Modal.Header className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h4" weight="bold">
                  {project ? "Edit Project" : "Create New Project"}
                </Text>
                <Text variant="body-sm" color="muted" className="mt-1">
                  {project ? "Update project details" : "Add a new project to your workspace"}
                </Text>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-6 px-6 py-4">
              {/* Project Name */}
              <InputGroup
                label="Project Name"
                required
                error={errors.name?.message}
              >
                <Input
                  {...register("name")}
                  placeholder="Enter project name"
                  error={!!errors.name}
                />
              </InputGroup>

              {/* Description */}
              <InputGroup
                label="Description"
                error={errors.description?.message}
              >
                <textarea
                  {...register("description")}
                  placeholder="Enter project description"
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
                  <Dropdown
                    items={STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                    value={watchedStatus || "active"}
                    onSelect={(value) => setValue("status", value as "active" | "archived" | "on-hold")}
                    placeholder="Select status"
                  />
                </InputGroup>

                {/* Progress */}
                <InputGroup
                  label="Progress (%)"
                  error={errors.progress?.message}
                >
                  <Input
                    type="number"
                    {...register("progress", { valueAsNumber: true })}
                    placeholder="0"
                    min={0}
                    max={100}
                    error={!!errors.progress}
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Start Date */}
                <InputGroup
                  label="Start Date"
                  error={errors.startDate?.message}
                >
                  <DatePicker
                    value={watchedStartDate}
                    onChange={(date) => setValue("startDate", date || undefined)}
                    placeholder="Select start date"
                  />
                </InputGroup>

                {/* End Date */}
                <InputGroup
                  label="End Date"
                  error={errors.endDate?.message}
                >
                  <DatePicker
                    value={watchedEndDate}
                    onChange={(date) => setValue("endDate", date || undefined)}
                    placeholder="Select end date"
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Color */}
                <InputGroup
                  label="Color"
                  error={errors.color?.message}
                >
                  <Dropdown
                    items={COLOR_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                    value={watchedColor || "#6366f1"}
                    onSelect={(value) => setValue("color", value)}
                    placeholder="Select color"
                  />
                </InputGroup>

                {/* Icon */}
                <InputGroup
                  label="Icon"
                  error={errors.icon?.message}
                >
                  <Dropdown
                    items={ICON_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                    value={watchedIcon || "folder"}
                    onSelect={(value) => setValue("icon", value)}
                    placeholder="Select icon"
                  />
                </InputGroup>
              </div>

              {/* Team Space Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Text variant="h5" weight="semibold">
                    Team Space
                  </Text>
                </div>

                <div className="space-y-4">
                  {/* Select Existing Space */}
                  <InputGroup
                    label="Select Team Space (Optional)"
                    error={errors.spaceId?.message}
                  >
                    <Select
                      value={watchedSpaceId || ""}
                      onValueChange={(value) => {
                        setValue("spaceId", value || undefined);
                        setValue("createSpace", false);
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="No space (or create new)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          <span className="text-muted-foreground">No space</span>
                        </SelectItem>
                        {spaces.map((space: any) => (
                          <SelectItem key={space.id} value={space.id}>
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              <span>{space.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </InputGroup>

                  {/* Or Create New Space */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="createSpace"
                        checked={watchedCreateSpace || false}
                        onCheckedChange={(checked) => {
                          setValue("createSpace", checked as boolean);
                          if (checked) {
                            setValue("spaceId", undefined);
                          }
                        }}
                        disabled={!!watchedSpaceId}
                      />
                      <Label htmlFor="createSpace" className="text-sm font-normal cursor-pointer">
                        Or create a new team space
                      </Label>
                    </div>
                    {watchedCreateSpace && !watchedSpaceId && (
                      <div className="ml-6 space-y-4 pl-4 border-l-2 border-muted">
                        <InputGroup
                          label="Space Name *"
                          error={errors.spaceName?.message}
                        >
                          <Input
                            {...register("spaceName")}
                            placeholder="e.g., Frontend Team, Backend Team..."
                            error={!!errors.spaceName}
                          />
                        </InputGroup>
                        <InputGroup
                          label="Space Description"
                          error={errors.spaceDescription?.message}
                        >
                          <textarea
                            {...register("spaceDescription")}
                            placeholder="Describe the purpose of this space..."
                            rows={2}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </InputGroup>
                      </div>
                    )}
                  </div>
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
                {project ? (
                  "Update Project"
                ) : (
                  <>
                    <FolderKanban className="h-4 w-4 mr-2" />
                    Create Project
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


