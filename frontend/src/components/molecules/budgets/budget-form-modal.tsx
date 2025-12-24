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
import { budgetSchema, type BudgetFormData } from "@/core/schemas/budget-schema";
import { CURRENCIES, COST_CATEGORIES } from "@/core/config/constants";
import type { Budget } from "@/interfaces";
import { Text } from "@/components/atoms/text";
import { Wallet } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

interface BudgetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  budget?: Budget | null;
  isLoading?: boolean;
}

const BUDGET_PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function BudgetFormModal({
  open,
  onOpenChange,
  onSubmit,
  budget,
  isLoading = false,
}: BudgetFormModalProps) {
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
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      name: "",
      amount: 0,
      currency: "USD",
      category: "other",
      period: "monthly",
      startDate: new Date(),
      endDate: undefined,
      projectId: undefined,
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedCurrency = watch("currency");
  const watchedCategory = watch("category");
  const watchedPeriod = watch("period");
  const watchedProjectId = watch("projectId");

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      reset({
        name: "",
        amount: 0,
        currency: "USD",
        category: "other",
        period: "monthly",
        startDate: new Date(),
        endDate: undefined,
        projectId: undefined,
      });
      return;
    }

    // When modal opens, populate form with budget data or defaults
    if (budget) {
      // Convert date strings to Date objects if needed
      const startDateValue = budget.startDate instanceof Date 
        ? budget.startDate 
        : new Date(budget.startDate);
      const endDateValue = budget.endDate 
        ? (budget.endDate instanceof Date ? budget.endDate : new Date(budget.endDate))
        : undefined;
      reset({
        name: budget.name,
        amount: budget.amount,
        currency: budget.currency,
        category: budget.category,
        period: budget.period,
        startDate: startDateValue,
        endDate: endDateValue,
        projectId: budget.projectId,
      });
    } else {
      reset({
        name: "",
        amount: 0,
        currency: "USD",
        category: "other",
        period: "monthly",
        startDate: new Date(),
        endDate: undefined,
        projectId: undefined,
      });
    }
  }, [budget, setValue, reset, open]);

  const handleFormSubmit = async (data: BudgetFormData) => {
    // Convert Date objects to ISO strings for backend
    const submitData = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
    };
    await onSubmit(submitData as BudgetFormData);
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
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h4" weight="bold">
                  {budget ? "Edit Budget" : "Add New Budget"}
                </Text>
                <Text variant="body-sm" color="muted" className="mt-1">
                  {budget ? "Update budget details" : "Set up a new budget for your project"}
                </Text>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-6 px-6 py-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputGroup
                  label="Budget Name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    placeholder="e.g., Monthly Marketing Budget"
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
                  label="Period"
                  required
                  error={errors.period?.message}
                >
                  <Dropdown
                    items={BUDGET_PERIODS}
                    value={watchedPeriod}
                    onSelect={(value) =>
                      setValue("period", value as typeof watchedPeriod)
                    }
                    placeholder="Select period"
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
                  helperText="Optional - leave empty for ongoing budget"
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
                {budget ? (
                  "Update Budget"
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Add Budget
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

