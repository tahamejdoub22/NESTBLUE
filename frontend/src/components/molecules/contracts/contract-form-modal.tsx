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
import { Checkbox } from "@/components/atoms/checkbox";
import { contractSchema, type ContractFormData } from "@/core/schemas/contract-schema";
import { CURRENCIES, COST_CATEGORIES, CONTRACT_STATUSES, PAYMENT_FREQUENCIES } from "@/core/config/constants";
import type { Contract } from "@/interfaces";
import { Text } from "@/components/atoms/text";
import { FileText, DollarSign } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

interface ContractFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ContractFormData) => Promise<void>;
  contract?: Contract | null;
  isLoading?: boolean;
}

export function ContractFormModal({
  open,
  onOpenChange,
  onSubmit,
  contract,
  isLoading = false,
}: ContractFormModalProps) {
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
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      name: "",
      contractNumber: "",
      vendor: "",
      vendorEmail: "",
      vendorPhone: "",
      amount: 0,
      currency: "USD",
      category: "other",
      description: "",
      startDate: new Date(),
      endDate: undefined,
      renewalDate: undefined,
      status: "draft",
      paymentFrequency: "monthly",
      autoRenew: false,
      tags: [],
      projectId: undefined,
      attachments: [],
      notes: "",
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedRenewalDate = watch("renewalDate");
  const watchedCurrency = watch("currency");
  const watchedCategory = watch("category");
  const watchedStatus = watch("status");
  const watchedPaymentFrequency = watch("paymentFrequency");
  const watchedAutoRenew = watch("autoRenew");
  const watchedProjectId = watch("projectId");

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        contractNumber: "",
        vendor: "",
        vendorEmail: "",
        vendorPhone: "",
        amount: 0,
        currency: "USD",
        category: "other",
        description: "",
        startDate: new Date(),
        endDate: undefined,
        renewalDate: undefined,
        status: "draft",
        paymentFrequency: "monthly",
        autoRenew: false,
        tags: [],
        projectId: undefined,
        attachments: [],
        notes: "",
      });
      return;
    }

    if (contract) {
      setValue("name", contract.name);
      setValue("contractNumber", contract.contractNumber);
      setValue("vendor", contract.vendor);
      setValue("vendorEmail", contract.vendorEmail || "");
      setValue("vendorPhone", contract.vendorPhone || "");
      setValue("amount", contract.amount);
      setValue("currency", contract.currency);
      setValue("category", contract.category);
      setValue("description", contract.description || "");
      setValue("startDate", new Date(contract.startDate));
      setValue("endDate", contract.endDate ? new Date(contract.endDate) : undefined);
      setValue("renewalDate", contract.renewalDate ? new Date(contract.renewalDate) : undefined);
      setValue("status", contract.status);
      setValue("paymentFrequency", contract.paymentFrequency);
      setValue("autoRenew", contract.autoRenew);
      setValue("tags", contract.tags || []);
      setValue("projectId", contract.projectId ?? undefined);
      setValue("attachments", contract.attachments || []);
      setValue("notes", contract.notes || "");
    } else {
      reset({
        name: "",
        contractNumber: "",
        vendor: "",
        vendorEmail: "",
        vendorPhone: "",
        amount: 0,
        currency: "USD",
        category: "other",
        description: "",
        startDate: new Date(),
        endDate: undefined,
        renewalDate: undefined,
        status: "draft",
        paymentFrequency: "monthly",
        autoRenew: false,
        tags: [],
        projectId: undefined,
        attachments: [],
        notes: "",
      });
    }
  }, [contract, setValue, reset, open]);

  const handleFormSubmit = async (data: ContractFormData) => {
    // Convert Date objects to ISO strings for backend DTO (@IsDateString)
    const submitData = {
      ...data,
      startDate:
        data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
      endDate:
        data.endDate instanceof Date
          ? data.endDate.toISOString()
          : data.endDate ?? undefined,
      renewalDate:
        data.renewalDate instanceof Date
          ? data.renewalDate.toISOString()
          : data.renewalDate ?? undefined,
    };
    await onSubmit(submitData as ContractFormData);
  };

  const handleFormError = (errors: FieldErrors<ContractFormData>) => {
    console.error("Contract form validation errors", errors);
  };

  const currencyItems = CURRENCIES.map((curr) => ({
    value: curr.value,
    label: `${curr.label} (${curr.symbol})`,
  }));

  const categoryItems = COST_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: cat.label,
  }));

  const statusItems = CONTRACT_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const paymentFrequencyItems = PAYMENT_FREQUENCIES.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  return (
    <Modal.Provider defaultOpen={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg" showCloseButton className="max-w-3xl">
        <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="flex flex-col max-h-[90vh]">
          <Modal.Header className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h4" weight="bold">
                  {contract ? "Edit Contract" : "Add New Contract"}
                </Text>
                <Text variant="body-sm" color="muted" className="mt-1">
                  {contract ? "Update contract details" : "Create a new contract for your project"}
                </Text>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-6 px-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <Text variant="h5" weight="semibold" className="text-muted-foreground">
                  Basic Information
                </Text>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <InputGroup
                    label="Contract Name"
                    required
                    error={errors.name?.message}
                  >
                    <Input
                      placeholder="e.g., Office Space Lease Agreement"
                      {...register("name")}
                      error={!!errors.name}
                    />
                  </InputGroup>

                  <InputGroup
                    label="Contract Number"
                    required
                    error={errors.contractNumber?.message}
                  >
                    <Input
                      placeholder="e.g., CNT-2024-001"
                      {...register("contractNumber")}
                      error={!!errors.contractNumber}
                    />
                  </InputGroup>
                </div>

                <InputGroup
                  label="Description"
                  helperText="Optional description for this contract"
                  error={errors.description?.message}
                >
                  <textarea
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add a description..."
                    {...register("description")}
                  />
                </InputGroup>
              </div>

              {/* Vendor Information */}
              <div className="space-y-4">
                <Text variant="h5" weight="semibold" className="text-muted-foreground">
                  Vendor Information
                </Text>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <InputGroup
                    label="Vendor Name"
                    required
                    error={errors.vendor?.message}
                  >
                    <Input
                      placeholder="e.g., Company Name"
                      {...register("vendor")}
                      error={!!errors.vendor}
                    />
                  </InputGroup>

                  <InputGroup
                    label="Vendor Email"
                    helperText="Optional"
                    error={errors.vendorEmail?.message}
                  >
                    <Input
                      type="email"
                      placeholder="vendor@company.com"
                      {...register("vendorEmail")}
                      error={!!errors.vendorEmail}
                    />
                  </InputGroup>

                  <InputGroup
                    label="Vendor Phone"
                    helperText="Optional"
                    error={errors.vendorPhone?.message}
                  >
                    <Input
                      type="tel"
                      placeholder="+1-555-0100"
                      {...register("vendorPhone")}
                      error={!!errors.vendorPhone}
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <Text variant="h5" weight="semibold" className="text-muted-foreground">
                  Financial Information
                </Text>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    label="Payment Frequency"
                    required
                    error={errors.paymentFrequency?.message}
                  >
                    <Dropdown
                      items={paymentFrequencyItems}
                      value={watchedPaymentFrequency}
                      onSelect={(value) =>
                        setValue("paymentFrequency", value as typeof watchedPaymentFrequency)
                      }
                      placeholder="Select frequency"
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <Text variant="h5" weight="semibold" className="text-muted-foreground">
                  Dates
                </Text>
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
                    helperText="Optional"
                    error={errors.endDate?.message}
                  >
                    <DatePicker
                      value={watchedEndDate || undefined}
                      onChange={(date) => setValue("endDate", date || undefined)}
                      placeholder="Select end date"
                    />
                  </InputGroup>

                  <InputGroup
                    label="Renewal Date"
                    helperText="Optional - Date to review for renewal"
                    error={errors.renewalDate?.message}
                  >
                    <DatePicker
                      value={watchedRenewalDate || undefined}
                      onChange={(date) => setValue("renewalDate", date || undefined)}
                      placeholder="Select renewal date"
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Status & Settings */}
              <div className="space-y-4">
                <Text variant="h5" weight="semibold" className="text-muted-foreground">
                  Status & Settings
                </Text>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <InputGroup
                    label="Status"
                    required
                    error={errors.status?.message}
                  >
                    <Dropdown
                      items={statusItems}
                      value={watchedStatus}
                      onSelect={(value) =>
                        setValue("status", value as typeof watchedStatus)
                      }
                      placeholder="Select status"
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoRenew"
                    checked={watchedAutoRenew}
                    onCheckedChange={(checked) => setValue("autoRenew", checked === true)}
                  />
                  <label
                    htmlFor="autoRenew"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auto-renew contract
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <InputGroup
                  label="Notes"
                  helperText="Optional additional notes about this contract"
                  error={errors.notes?.message}
                >
                  <textarea
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add any additional notes..."
                    {...register("notes")}
                  />
                </InputGroup>
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
                {contract ? (
                  "Update Contract"
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Add Contract
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

