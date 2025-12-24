import { BaseEntity } from "./base.interface";
import { Currency, CostCategory } from "./cost.interface";

// Contract domain types
export interface Contract extends BaseEntity {
  name: string;
  contractNumber: string;
  vendor: string;
  vendorEmail?: string;
  vendorPhone?: string;
  amount: number;
  currency: Currency;
  category: CostCategory;
  description?: string;
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  status: ContractStatus;
  paymentFrequency: PaymentFrequency;
  autoRenew: boolean;
  tags?: string[];
  projectId?: string; // Link to project
  attachments?: string[]; // File URLs or paths
  notes?: string;
}

export type ContractStatus = 
  | "draft" 
  | "active" 
  | "expired" 
  | "terminated" 
  | "pending-renewal" 
  | "cancelled";

export type PaymentFrequency = 
  | "one-time" 
  | "monthly" 
  | "quarterly" 
  | "semi-annual" 
  | "annual";

// Form types
export type CreateContractInput = Omit<Contract, "id" | "createdAt" | "updatedAt">;
export type UpdateContractInput = Partial<CreateContractInput>;

