# Model Structure Reference

This document describes the exact structure of all models used in the application. **This is critical for backend integration.**

## Important Notes

1. **Task and Project use `uid`, not `id`** - They don't extend BaseEntity
2. **Message and Conversation don't extend BaseEntity** - They have their own id, createdAt, updatedAt fields
3. **All other models extend BaseEntity** - They have id, createdAt, updatedAt from BaseEntity

## Model Structures

### BaseEntity (Base Interface)
```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Models Extending BaseEntity

#### Budget
```typescript
interface Budget extends BaseEntity {
  id: string;              // From BaseEntity
  createdAt: Date;         // From BaseEntity
  updatedAt: Date;         // From BaseEntity
  name: string;
  amount: number;
  currency: Currency;
  category: CostCategory;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  projectId?: string;
}
```

#### Cost
```typescript
interface Cost extends BaseEntity {
  id: string;              // From BaseEntity
  createdAt: Date;         // From BaseEntity
  updatedAt: Date;         // From BaseEntity
  name: string;
  amount: number;
  currency: Currency;
  category: CostCategory;
  description?: string;
  date: Date;
  tags?: string[];
  projectId?: string;
  taskId?: string;
}
```

#### Expense
```typescript
interface Expense extends BaseEntity {
  id: string;              // From BaseEntity
  createdAt: Date;         // From BaseEntity
  updatedAt: Date;         // From BaseEntity
  name: string;
  amount: number;
  currency: Currency;
  category: CostCategory;
  description?: string;
  frequency: ExpenseFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  tags?: string[];
  projectId?: string;
}
```

#### Contract
```typescript
interface Contract extends BaseEntity {
  id: string;              // From BaseEntity
  createdAt: Date;         // From BaseEntity
  updatedAt: Date;         // From BaseEntity
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
  projectId?: string;
  attachments?: string[];
  notes?: string;
}
```

#### Notification
```typescript
interface Notification extends BaseEntity {
  id: string;              // From BaseEntity
  createdAt: Date;         // From BaseEntity
  updatedAt: Date;         // From BaseEntity
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  projectId?: string;
  taskId?: string;
}
```

#### Sprint
```typescript
interface Sprint extends BaseEntity {
  id: string;              // From BaseEntity
  createdAt: Date;         // From BaseEntity
  updatedAt: Date;         // From BaseEntity
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: "planned" | "active" | "completed";
  goal?: string;
  taskCount: number;
  completedTaskCount: number;
}
```

#### User
```typescript
interface User extends BaseEntity {
  id: string;              // From BaseEntity
  createdAt: Date;         // From BaseEntity
  updatedAt: Date;         // From BaseEntity
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: "online" | "offline" | "away" | "busy";
  phone?: string;
  department?: string;
  position?: string;
}
```

### Models NOT Extending BaseEntity

#### Task ⚠️ Uses `uid`, not `id`
```typescript
interface Task {
  uid: string;             // NOT id - uses uid!
  identifier: string;      // Unique alphabetic identifier
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: string[];
  dueDate?: Date;
  startDate?: Date;
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: Comment[];
  attachments: number;
  estimatedCost?: {
    amount: number;
    currency: Currency;
  };
  // NO createdAt, NO updatedAt, NO id
}
```

#### Project ⚠️ Uses `uid`, not `id`
```typescript
interface Project {
  uid: string;             // NOT id - uses uid!
  name: string;
  description: string;
  status?: "active" | "archived" | "on-hold";
  progress?: number;
  startDate?: Date;
  endDate?: Date;
  // NO createdAt, NO updatedAt, NO id
}
```

#### Message ⚠️ Doesn't extend BaseEntity but has id, createdAt, updatedAt
```typescript
interface Message {
  id: string;              // Has id but doesn't extend BaseEntity
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  read: boolean;
  createdAt: Date;         // Has createdAt but doesn't extend BaseEntity
  updatedAt: Date;         // Has updatedAt but doesn't extend BaseEntity
  attachments?: MessageAttachment[];
}
```

#### Conversation ⚠️ Doesn't extend BaseEntity but has id, createdAt, updatedAt
```typescript
interface Conversation {
  id: string;              // Has id but doesn't extend BaseEntity
  name: string;
  type: "direct" | "group";
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: Date;         // Has createdAt but doesn't extend BaseEntity
  updatedAt: Date;         // Has updatedAt but doesn't extend BaseEntity
}
```

## API Endpoint Patterns

### For Models with BaseEntity (use `id`)
- `GET /resource/:id`
- `PATCH /resource/:id`
- `DELETE /resource/:id`

### For Task (use `uid`)
- `GET /tasks/:uid`
- `PATCH /tasks/:uid`
- `DELETE /tasks/:uid`

### For Project (use `uid`)
- `GET /projects/:uid`
- `PATCH /projects/:uid`
- `DELETE /projects/:uid`

### For Message/Conversation (use `id` but don't extend BaseEntity)
- `GET /messages/:id` or `GET /conversations/:id`
- `PATCH /messages/:id` or `PATCH /conversations/:id`
- `DELETE /messages/:id` or `DELETE /conversations/:id`

## Create/Update Input Types

### Task
```typescript
// Create
Omit<Task, "uid" | "identifier">

// Update
Partial<Omit<Task, "uid" | "identifier">>
```

### Project
```typescript
// Create
Omit<Project, "uid">

// Update
Partial<Omit<Project, "uid">>
```

### Message
```typescript
// Create
Omit<Message, "id" | "createdAt" | "updatedAt">

// Update
Partial<Omit<Message, "id" | "createdAt" | "updatedAt">>
```

### Conversation
```typescript
// Create
Omit<Conversation, "id" | "createdAt" | "updatedAt">

// Update
Partial<Omit<Conversation, "id" | "createdAt" | "updatedAt">>
```

### Other Models (extend BaseEntity)
```typescript
// Create
Omit<Model, "id" | "createdAt" | "updatedAt">

// Update
Partial<Omit<Model, "id" | "createdAt" | "updatedAt">>
```

## Summary

| Model | ID Field | Extends BaseEntity | Has createdAt/updatedAt |
|-------|----------|-------------------|------------------------|
| Budget | `id` | ✅ Yes | ✅ Yes (from BaseEntity) |
| Cost | `id` | ✅ Yes | ✅ Yes (from BaseEntity) |
| Expense | `id` | ✅ Yes | ✅ Yes (from BaseEntity) |
| Contract | `id` | ✅ Yes | ✅ Yes (from BaseEntity) |
| Notification | `id` | ✅ Yes | ✅ Yes (from BaseEntity) |
| Sprint | `id` | ✅ Yes | ✅ Yes (from BaseEntity) |
| User | `id` | ✅ Yes | ✅ Yes (from BaseEntity) |
| **Task** | **`uid`** | ❌ **No** | ❌ **No** |
| **Project** | **`uid`** | ❌ **No** | ❌ **No** |
| **Message** | **`id`** | ❌ **No** | ✅ **Yes (own fields)** |
| **Conversation** | **`id`** | ❌ **No** | ✅ **Yes (own fields)** |


