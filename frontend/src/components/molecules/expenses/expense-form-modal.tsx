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
import { Checkbox } from "@/components/atoms/checkbox";
import { expenseSchema, type ExpenseFormData } from "@/core/schemas/expense-schema";
import { CURRENCIES, COST_CATEGORIES } from "@/core/config/constants";
import type { Expense } from "@/interfaces";
import { Text } from "@/components/atoms/text";
import { Receipt } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  expense?: Expense | null;
  isLoading?: boolean;
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "one-time", label: "One-time" },
];

export function ExpenseFormModal({
  open,
  onOpenChange,
  onSubmit,
  expense,
  isLoading = false,
}: ExpenseFormModalProps) {
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
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      name: "",
      amount: 0,
      currency: "USD",
      category: "other",
      frequency: "monthly",
      startDate: new Date(),
      endDate: undefined,
      isActive: true,
      description: "",
      tags: [],
      projectId: undefined,
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedCurrency = watch("currency");
  const watchedCategory = watch("category");
  const watchedFrequency = watch("frequency");
  const watchedIsActive = watch("isActive");
  const watchedProjectId = watch("projectId");

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      reset({
        name: "",
        amount: 0,
        currency: "USD",
        category: "other",
        frequency: "monthly",
        startDate: new Date(),
        endDate: undefined,
        isActive: true,
        description: "",
        tags: [],
        projectId: undefined,
      });
      return;
    }

    // When modal opens, populate form with expense data or defaults
    if (expense) {
      // Convert date strings to Date objects if needed
      const startDateValue = expense.startDate instanceof Date 
        ? expense.startDate 
        : new Date(expense.startDate);
      const endDateValue = expense.endDate 
        ? (expense.endDate instanceof Date ? expense.endDate : new Date(expense.endDate))
        : undefined;
      reset({
        name: expense.name,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        frequency: expense.frequency,
        startDate: startDateValue,
        endDate: endDateValue,
        isActive: expense.isActive,
        description: expense.description || "",
        tags: expense.tags || [],
        projectId: expense.projectId,
      });
    } else {
      reset({
        name: "",
        amount: 0,
        currency: "USD",
        category: "other",
        frequency: "monthly",
        startDate: new Date(),
        endDate: undefined,
        isActive: true,
        description: "",
        tags: [],
        projectId: undefined,
      });
    }
  }, [expense, setValue, reset, open]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    // Convert Date objects to ISO strings for backend
    const submitData = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
    };
    await onSubmit(submitData as ExpenseFormData);
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col max-h-[90vh]">
          <Modal.Header className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h4" weight="bold">
                  {expense ? "Edit Expense" : "Add New Expense"}
                </Text>
                <Text variant="body-sm" color="muted" className="mt-1">
                  {expense ? "Update expense details" : "Create a new recurring or one-time expense"}
                </Text>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-6 px-6 py-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputGroup
                  label="Expense Name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    placeholder="e.g., Netflix Subscription"
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

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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

                <InputGroup
                  label="Frequency"
                  required
                  error={errors.frequency?.message}
                >
                  <Dropdown
                    items={FREQUENCIES}
                    value={watchedFrequency}
                    onSelect={(value) =>
                      setValue("frequency", value as typeof watchedFrequency)
                    }
                    placeholder="Select frequency"
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputGroup
                  label="Start Date"
                  required
                  error={errors.startDate?.message}
                >
                  <DatePicker
                    value={watchedStartDate}
                    onChange={(date) => setValue("startDate", date || new Date())}
                    placeholder="Select start date"
                  />
                </InputGroup>

                <InputGroup
                  label="End Date"
                  helperText="Optional - leave empty for ongoing expense"
                  error={errors.endDate?.message}
                >
                  <DatePicker
                    value={watchedEndDate}
                    onChange={(date) => setValue("endDate", date)}
                    placeholder="Select end date (optional)"
                  />
                </InputGroup>
              </div>

              <InputGroup
                label="Description"
                helperText="Optional description for this expense"
                error={errors.description?.message}
              >
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add a description..."
                  {...register("description")}
                />
              </InputGroup>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

                <div className="flex items-center gap-2 pt-8">
                  <Checkbox
                    id="isActive"
                    checked={watchedIsActive}
                    onCheckedChange={(checked) => setValue("isActive", checked === true)}
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active Expense
                  </label>
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
                {expense ? (
                  "Update Expense"
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Add Expense
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

