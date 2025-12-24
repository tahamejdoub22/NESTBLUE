"use client";

import { useState, useEffect } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/molecules/modal";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { InputGroup } from "@/components/molecules/input-group";
import { DatePicker } from "@/components/molecules/date-picker";
import { Dropdown } from "@/components/molecules/dropdown";
import { costSchema, type CostFormData } from "@/core/schemas/cost-schema";
import { CURRENCIES, COST_CATEGORIES } from "@/core/config/constants";
import type { Cost } from "@/interfaces";
import { Text } from "@/components/atoms/text";
import { DollarSign } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

interface CostFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CostFormData) => Promise<void>;
  cost?: Cost | null;
  isLoading?: boolean;
}

export function CostFormModal({
  open,
  onOpenChange,
  onSubmit,
  cost,
  isLoading = false,
}: CostFormModalProps) {
  const { projects } = useProjects();
  
  const PROJECT_OPTIONS = [
    { value: "", label: "No Project" },
    ...projects.map((p) => ({ value: p.uid, label: p.name })),
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CostFormData>({
    resolver: zodResolver(costSchema) as any,
    defaultValues: {
      name: "",
      amount: 0,
      currency: "USD",
      category: "other",
      description: "",
      date: new Date(),
      tags: [],
      projectId: undefined,
      taskId: undefined,
    },
  });

  const watchedDate = watch("date");
  const watchedCurrency = watch("currency");
  const watchedCategory = watch("category");
  const watchedProjectId = watch("projectId");

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      reset({
        name: "",
        amount: 0,
        currency: "USD",
        category: "other",
        description: "",
        date: new Date(),
        tags: [],
        projectId: undefined,
        taskId: undefined,
      });
      return;
    }

    // When modal opens, populate form with cost data or defaults
    if (cost) {
      // Convert date string to Date object if needed
      const dateValue = cost.date instanceof Date ? cost.date : new Date(cost.date);
      reset({
        name: cost.name,
        amount: cost.amount,
        currency: cost.currency,
        category: cost.category,
        description: cost.description || "",
        date: dateValue,
        tags: cost.tags || [],
        projectId: cost.projectId ?? undefined,
        // IMPORTANT: zod optional() expects undefined, not null
        taskId: cost.taskId ?? undefined,
      });
    } else {
      reset({
        name: "",
        amount: 0,
        currency: "USD",
        category: "other",
        description: "",
        date: new Date(),
        tags: [],
        projectId: undefined,
        taskId: undefined,
      });
    }
  }, [cost, setValue, reset, open]);

  const handleFormSubmit = async (data: CostFormData) => {
    try {
      // Convert Date objects to ISO strings for backend
      const submitData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      console.log("Form: Submitting data", submitData);
      await onSubmit(submitData as CostFormData);
      console.log("Form: Submit successful");
    } catch (error) {
      console.error("Form: Submit error", error);
      // Re-throw to let parent handle error display
      throw error;
    }
  };

  const handleFormError = (formErrors: FieldErrors<CostFormData>) => {
    console.error("Form: Validation errors", formErrors);
  };

  const currencyItems = CURRENCIES.map((curr) => ({
    value: curr.value,
    label: `${curr.label} (${curr.symbol})`,
  }));

  const categoryItems = COST_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: cat.label,
  }));

  return (
    <Modal.Provider defaultOpen={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg" showCloseButton className="max-w-3xl">
        <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="flex flex-col max-h-[90vh]">
          <Modal.Header className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h4" weight="bold">
                  {cost ? "Edit Cost" : "Add New Cost"}
                </Text>
                <Text variant="body-sm" color="muted" className="mt-1">
                  {cost ? "Update cost details" : "Record a new cost for your project"}
                </Text>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-6 px-6 py-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputGroup
                  label="Cost Name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    placeholder="e.g., Grocery Shopping"
                    {...register("name")}
                    error={!!errors.name}
                  />
                </InputGroup>

                <InputGroup
                  label="Amount"
                  required
                  error={errors.amount?.message}
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount", { valueAsNumber: true })}
                    error={!!errors.amount}
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputGroup
                  label="Currency"
                  required
                  error={errors.currency?.message}
                >
                  <Dropdown
                    items={currencyItems}
                    value={watchedCurrency}
                    onSelect={(value) =>
                      setValue("currency", value as typeof watchedCurrency)
                    }
                    placeholder="Select currency"
                  />
                </InputGroup>

                <InputGroup
                  label="Category"
                  required
                  error={errors.category?.message}
                >
                  <Dropdown
                    items={categoryItems}
                    value={watchedCategory}
                    onSelect={(value) =>
                      setValue("category", value as typeof watchedCategory)
                    }
                    placeholder="Select category"
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputGroup
                  label="Date"
                  required
                  error={errors.date?.message}
                >
                  <DatePicker
                    value={watchedDate}
                    onChange={(date) => setValue("date", date || new Date())}
                    placeholder="Select date"
                  />
                </InputGroup>

                <InputGroup
                  label="Project"
                  helperText="Optional: Assign to a project"
                  error={errors.projectId?.message}
                >
                  <Dropdown
                    items={PROJECT_OPTIONS.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                    value={watchedProjectId || ""}
                    onSelect={(value) =>
                      setValue("projectId", value === "" ? undefined : value)
                    }
                    placeholder="Select project"
                  />
                </InputGroup>
              </div>

              <InputGroup
                label="Description"
                helperText="Optional description for this cost"
                error={errors.description?.message}
              >
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add a description..."
                  {...register("description")}
                />
              </InputGroup>
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
                {cost ? (
                  "Update Cost"
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Cost
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

