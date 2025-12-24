# Nest Blue - Project Cost Management Application

<div align="center">

![Nest Blue](https://img.shields.io/badge/Nest%20Blue-Project%20Management-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-red?style=for-the-badge&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)

**A comprehensive full-stack application for managing projects, tracking costs, budgets, and team collaboration**

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Backend Details](#-backend-details)
- [Frontend Details](#-frontend-details)
- [Design System](#-design-system)
- [State Management](#-state-management)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

Modern project management faces several critical challenges:

1. **Fragmented Tools**: Teams use multiple disconnected tools for project management, cost tracking, budgeting, and communication, leading to data silos and inefficiency.

2. **Lack of Financial Visibility**: Project managers struggle to track costs, expenses, and budgets in real-time, making it difficult to prevent budget overruns and optimize resource allocation.

3. **Poor Cost Control**: Without integrated cost tracking and budget management, organizations face:
   - Unpredictable project costs
   - Difficulty in identifying cost overruns early
   - Lack of visibility into recurring expenses
   - Inability to forecast project financial health

4. **Inefficient Collaboration**: Team members work in isolation with limited communication channels, leading to:
   - Delayed task completion
   - Misaligned priorities
   - Poor knowledge sharing
   - Reduced productivity

5. **Manual Reporting**: Generating financial reports, analytics, and insights requires manual data compilation from multiple sources, consuming valuable time and prone to errors.

6. **Limited Real-time Insights**: Decision-makers lack real-time dashboards and analytics to make informed decisions about project health, budget status, and team performance.

---

## 💡 Solution

**Nest Blue** is a unified, full-stack project cost management platform that addresses these challenges by providing:

### Integrated Project & Cost Management
- **Unified Platform**: Single application combining project management, cost tracking, budgeting, and team collaboration
- **Real-time Financial Tracking**: Track costs, expenses, and budgets with live updates and notifications
- **Multi-currency Support**: Handle international projects with support for USD, EUR, GBP, and MAD
- **Automated Budget Monitoring**: Automatic budget vs. actual comparisons with alerts for overruns

### Advanced Task & Sprint Management
- **Agile Workflows**: Full sprint planning and management with Kanban boards, Gantt charts, and calendar views
- **Task Hierarchy**: Support for tasks, subtasks, comments, and file attachments
- **Priority Management**: Task prioritization with visual indicators and filtering
- **Progress Tracking**: Real-time progress monitoring with burn-down charts and velocity metrics

### Financial Intelligence
- **Cost Analytics**: Comprehensive cost analysis by category, project, and time period
- **Expense Forecasting**: Recurring expense tracking with monthly projections
- **Budget Planning**: Category-based budgets with period management (daily, weekly, monthly, yearly)
- **Contract Management**: Vendor contract tracking with payment frequency and auto-renewal monitoring

### Team Collaboration
- **Real-time Messaging**: Integrated messaging system for team communication
- **Notifications**: WebSocket-based real-time notifications for important events
- **Team Spaces**: Collaborative workspaces for organizing projects and teams
- **Activity Feeds**: Track team activity and project updates

### Data-Driven Insights
- **Interactive Dashboards**: Comprehensive dashboards with customizable charts and metrics
- **Financial Reports**: Automated financial reports with PDF export capabilities
- **Performance Analytics**: Team productivity metrics, project health scores, and cost trends
- **Predictive Analytics**: Forecast project completion, budget utilization, and cost trends

---

## ✨ Features

### Core Features

#### 📊 Project Management
- Create and manage projects with custom statuses and progress tracking
- Project ownership and member management
- Project-specific cost and budget tracking
- Team spaces for organizing multiple projects
- Project analytics and health scoring

#### ✅ Task Management
- Full CRUD operations for tasks with unique identifiers (e.g., "TASK-ABC123")
- Subtask support with nested hierarchies
- Task comments and file attachments
- Multiple assignees per task
- Priority levels (Low, Medium, High, Critical)
- Status workflow (Todo, In Progress, In Review, Done, Cancelled)
- Due dates and start dates
- Estimated costs per task

#### 🏃 Sprint Management
- Sprint planning and tracking
- Multiple view modes: Board, List, Table, Calendar, Gantt
- Sprint progress tracking
- Task grouping and filtering
- Sprint analytics and burn-down charts

#### 💰 Cost Management
- Track costs by category (Housing, Transportation, Food, Utilities, Healthcare, etc.)
- Multi-currency support (USD, EUR, GBP, MAD)
- Link costs to projects and tasks
- Cost analytics and reporting
- Tag-based organization

#### 💸 Expense Management
- Recurring expense tracking
- Frequency management (Daily, Weekly, Monthly, Yearly, One-time)
- Active/inactive status
- Monthly projection calculations
- Project-linked expenses

#### 📈 Budget Management
- Category-based budgets
- Period management (Daily, Weekly, Monthly, Yearly)
- Budget vs. actual tracking
- Budget utilization percentage
- Project-specific budgets
- Budget alerts and notifications

#### 📄 Contract Management
- Vendor contract tracking
- Contract status management (Draft, Active, Expired, Terminated, etc.)
- Payment frequency tracking
- Auto-renewal monitoring
- Contract attachments

#### 💬 Communication
- Real-time messaging system
- Conversation management
- Message history
- Team notifications
- Activity feeds

#### 🔔 Notifications
- WebSocket-based real-time notifications
- Notification filtering and management
- Read/unread status
- Notification preferences

#### 📊 Dashboard & Analytics
- Comprehensive dashboard with key metrics
- Financial analytics
- Project health scores
- Team performance metrics
- Cost trend analysis
- Revenue tracking
- Customizable charts and visualizations

#### 📄 Reports
- Financial reports with PDF export
- Analytics reports
- Project insights
- Cost breakdown reports

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 16 (App Router) + React 19 + TypeScript            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │ State Mgmt   │  │   Services   │      │
│  │  Components  │  │ Zustand +    │  │  API Client  │      │
│  │  (Atomic)    │  │ React Query  │  │  WebSocket   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│  NestJS 10 + TypeScript + PostgreSQL                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Controllers │  │   Services   │  │  Entities    │      │
│  │  (REST API)  │  │  (Business    │  │  (TypeORM)   │      │
│  │              │  │   Logic)      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│              PostgreSQL (Neon Cloud Database)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Users      │  │  Projects    │  │   Tasks      │      │
│  │  Costs/Exp   │  │  Budgets    │  │  Contracts   │      │
│  │  Messages    │  │  Sprints    │  │  Notifications│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Modular Architecture**: Backend uses NestJS modules for separation of concerns
- **Atomic Design**: Frontend follows atomic design principles (atoms, molecules, organisms)
- **Repository Pattern**: TypeORM repositories for data access
- **Service Layer**: Business logic separated from controllers
- **DTO Pattern**: Data Transfer Objects for API validation
- **Guard Pattern**: JWT guards for authentication and authorization
- **Interceptor Pattern**: Response transformation and error handling

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 10.3.0 | Progressive Node.js framework |
| **TypeScript** | 5.3.3 | Type-safe development |
| **PostgreSQL** | Latest | Relational database (Neon) |
| **TypeORM** | 0.3.17 | Object-Relational Mapping |
| **Passport.js** | 0.7.0 | Authentication middleware |
| **JWT** | 10.2.0 | Token-based authentication |
| **bcrypt** | 5.1.1 | Password hashing |
| **class-validator** | 0.14.0 | DTO validation |
| **Socket.io** | 4.8.1 | WebSocket for real-time features |
| **Swagger** | 7.1.17 | API documentation |
| **AWS SDK** | 3.948.0 | File storage (Supabase S3) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 4.1.17 | Utility-first CSS framework |
| **Radix UI** | Latest | Accessible component primitives |
| **Framer Motion** | 12.23.26 | Animation library |
| **TanStack Query** | 5.90.12 | Server state management |
| **Zustand** | 5.0.9 | Client state management |
| **React Hook Form** | 7.68.0 | Form management |
| **Zod** | 4.1.13 | Schema validation |
| **Axios** | 1.13.2 | HTTP client |
| **Recharts** | 3.6.0 | Chart library |
| **jsPDF** | 3.0.4 | PDF generation |
| **Socket.io Client** | 4.8.1 | WebSocket client |
| **date-fns** | 4.1.0 | Date manipulation |

---

## 📁 Project Structure

```
project-cost-management-app/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/        # JWT guards
│   │   │   └── strategies/   # Passport strategies
│   │   ├── users/             # User management
│   │   ├── projects/          # Project CRUD
│   │   ├── tasks/             # Task management
│   │   ├── costs/             # Cost tracking
│   │   ├── expenses/          # Expense management
│   │   ├── budgets/           # Budget management
│   │   ├── contracts/         # Contract management
│   │   ├── sprints/           # Sprint management
│   │   ├── messages/          # Messaging system
│   │   ├── notifications/     # Notification system
│   │   ├── dashboard/         # Dashboard analytics
│   │   ├── storage/           # File storage service
│   │   ├── health/            # Health checks
│   │   ├── common/            # Shared utilities
│   │   └── config/            # Configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── (app)/         # Protected routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   ├── costs/
│   │   │   │   ├── expenses/
│   │   │   │   ├── budget/
│   │   │   │   ├── contracts/
│   │   │   │   └── ...
│   │   │   └── (auth)/        # Auth routes
│   │   ├── components/        # React components
│   │   │   ├── atoms/         # Basic components
│   │   │   ├── molecules/     # Composite components
│   │   │   └── organisms/     # Complex components
│   │   ├── core/              # Core functionality
│   │   │   ├── config/        # Configuration
│   │   │   ├── services/      # API services
│   │   │   ├── store/         # Zustand stores
│   │   │   └── schemas/       # Zod schemas
│   │   ├── hooks/             # Custom React hooks
│   │   ├── interfaces/        # TypeScript interfaces
│   │   ├── lib/               # Utility libraries
│   │   └── shared/            # Shared utilities
│   ├── public/                # Static assets
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (or Neon cloud database)
- **Git**

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   npm run setup:env
   ```
   This creates a `.env` file. Alternatively, manually create `.env` with:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   PORT=4000
   ```

4. **Run database migrations (optional - auto-sync enabled in dev):**
   ```bash
   npm run migration:run
   ```

5. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

6. **Start the development server:**
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:4000`
   - Swagger UI: `http://localhost:4000/api`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Default Credentials

After seeding the database, you can use these credentials:
- **Email**: Check `backend/USER_CREDENTIALS.md` (if exists) or seed file
- **Password**: Check seed file for default password

---

## 🔧 Backend Details

### Architecture

The backend follows **NestJS modular architecture** with clear separation of concerns:

#### Module Structure

Each feature module contains:
- **Controller**: Handles HTTP requests and responses
- **Service**: Contains business logic
- **Entity**: TypeORM entity for database mapping
- **DTOs**: Data Transfer Objects for validation
- **Module**: NestJS module configuration

#### Key Modules

1. **Authentication Module** (`src/auth/`)
   - JWT-based authentication
   - Password hashing with bcrypt (10 rounds)
   - Token refresh mechanism
   - Password reset flow
   - Email verification support
   - Protected routes with JWT guards

2. **Users Module** (`src/users/`)
   - User CRUD operations
   - Profile management
   - User preferences
   - Status management (online/offline/away/busy)

3. **Projects Module** (`src/projects/`)
   - Uses `uid` (12-char alphanumeric) instead of UUID
   - Project ownership and member management
   - Team spaces support
   - Project status and progress tracking

4. **Tasks Module** (`src/tasks/`)
   - Task CRUD with `uid` identifier
   - Subtasks, comments, and attachments
   - Task assignment and priority management
   - Estimated costs per task

5. **Costs Module** (`src/costs/`)
   - Cost tracking by category
   - Multi-currency support
   - Project and task linking

6. **Expenses Module** (`src/expenses/`)
   - Recurring expense management
   - Frequency-based calculations
   - Monthly projections

7. **Budgets Module** (`src/budgets/`)
   - Category-based budgets
   - Period management
   - Budget vs. actual tracking

8. **Contracts Module** (`src/contracts/`)
   - Vendor contract management
   - Status tracking
   - Payment frequency and auto-renewal

9. **Sprints Module** (`src/sprints/`)
   - Sprint planning and tracking
   - Task grouping
   - Sprint analytics

10. **Messages Module** (`src/messages/`)
    - Real-time messaging
    - Conversation management
    - Message history

11. **Notifications Module** (`src/notifications/`)
    - WebSocket-based notifications
    - Real-time updates
    - Notification preferences

12. **Dashboard Module** (`src/dashboard/`)
    - Analytics aggregation
    - Performance metrics
    - Financial insights

### Database Schema

#### Key Entities

- **User**: Authentication and user profile
- **Project**: Project management (uses `uid`)
- **Task**: Task management (uses `uid`)
- **Cost**: Cost tracking
- **Expense**: Recurring expenses
- **Budget**: Budget management
- **Contract**: Vendor contracts
- **Sprint**: Sprint planning
- **Message**: Messaging system
- **Notification**: Notifications
- **Note**: Project notes

#### Relationships

- Projects → Tasks (One-to-Many)
- Tasks → Subtasks (One-to-Many)
- Tasks → Comments (One-to-Many)
- Tasks → Attachments (One-to-Many)
- Projects → Costs (One-to-Many)
- Projects → Expenses (One-to-Many)
- Projects → Budgets (One-to-Many)
- Projects → Contracts (One-to-Many)
- Projects → Sprints (One-to-Many)
- Users → Projects (One-to-Many, owner)
- Users → Tasks (Many-to-Many, assignees)

### API Design

- **RESTful API**: Standard REST endpoints
- **JWT Authentication**: Token-based authentication
- **DTO Validation**: Input validation with class-validator
- **Error Handling**: Global exception filters
- **Response Transformation**: Consistent API responses
- **Swagger Documentation**: Auto-generated API docs

### Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS**: Configurable CORS policies
- **Input Validation**: DTO validation on all endpoints
- **SQL Injection Protection**: TypeORM parameterized queries
- **XSS Protection**: Input sanitization

---

## 🎨 Frontend Details

### Architecture

The frontend follows **Next.js 16 App Router** architecture with:

#### Component Architecture (Atomic Design)

1. **Atoms** (`src/components/atoms/`)
   - Basic building blocks (Button, Input, Card, Badge, etc.)
   - Reusable, single-purpose components
   - Examples: `Button`, `Input`, `Card`, `Avatar`, `Badge`

2. **Molecules** (`src/components/molecules/`)
   - Composite components combining atoms
   - Examples: `TaskListItem`, `BudgetCard`, `ProjectFormModal`, `SprintBoardView`

3. **Organisms** (`src/components/organisms/`)
   - Complex components combining molecules
   - Examples: `Sidebar`, `Navbar`, `SprintBoard`, `ProjectStatistics`

#### Routing Structure

- **App Router**: Next.js 16 App Router
- **Route Groups**: `(app)` for protected routes, `(auth)` for auth routes
- **Dynamic Routes**: `[projectId]`, `[sprintId]` for dynamic pages
- **Layouts**: Shared layouts for app and auth sections

#### State Management

**Dual State Management Strategy:**

1. **TanStack Query (React Query)** - Server State
   - Manages server data (projects, tasks, costs, etc.)
   - Automatic caching and refetching
   - Optimistic updates
   - Background synchronization

2. **Zustand** - Client State
   - UI state (modals, filters, preferences)
   - Local state with localStorage persistence
   - Lightweight and performant
   - DevTools support

**State Management Pattern:**
```typescript
// Server State (React Query)
const { data, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: () => api.getProjects()
});

// Client State (Zustand)
const { filters, setFilters } = useBudgetsStore();
```

### UX Design Principles

1. **User-Centered Design**
   - Intuitive navigation
   - Clear visual hierarchy
   - Consistent interaction patterns
   - Accessible components (Radix UI)

2. **Performance Optimization**
   - Code splitting with Next.js
   - Image optimization
   - Lazy loading
   - Optimistic UI updates

3. **Responsive Design**
   - Mobile-first approach
   - Breakpoint-based layouts
   - Touch-friendly interactions
   - Adaptive components

4. **Accessibility**
   - WCAG 2.1 compliance
   - Keyboard navigation
   - Screen reader support
   - ARIA labels

5. **Visual Feedback**
   - Loading states
   - Error handling
   - Success notifications
   - Skeleton loaders

### Design System

#### Color Palette

**Primary (Nest Blue):**
- Based on brand colors: dark teal-blue, medium blue, light sky-blue
- Primary-500: `#0284c7` (Medium blue)
- Primary-600: `#0369a1` (Dark teal-blue)
- Primary-400: `#0ea5e9` (Light sky-blue)

**Semantic Colors:**
- Success: Emerald Green (`#10b981`)
- Warning: Amber (`#f59e0b`)
- Error: Rose Red (`#f43f5e`)
- Info: Sky Blue (`#0ea5e9`)

**Neutral:**
- Gray scale from 50-950 for text and backgrounds

#### Typography

**Font Families:**
- Sans: Inter (primary)
- Display: Cal Sans (headings)
- Mono: JetBrains Mono (code)

**Font Sizes:**
- Display: 2xl, xl, lg, md, sm, xs
- Body: xl, lg, md, sm, xs
- Label: lg, md, sm
- Caption & Overline

#### Spacing System

- Consistent spacing scale (4px base unit)
- Extended spacing: 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 13, 15, 17, etc.

#### Border Radius

- xs, sm, md, lg, xl, 2xl, 3xl, 4xl, full

#### Shadows

- Layered elevation system
- Colored shadows (primary, success, warning, error)
- Glass effect shadows
- Card shadows with hover states

#### Animations

- Fade animations (in, out, up, down, left, right)
- Scale animations
- Slide animations
- Bounce & Spring animations
- Pulse & Glow effects
- Shimmer effects
- Skeleton loading animations

### Key Features Implementation

#### Forms
- **React Hook Form** for form management
- **Zod** for schema validation
- **Error Handling**: Field-level and form-level errors
- **Accessibility**: Proper labels and ARIA attributes

#### Charts & Visualizations
- **Recharts** for data visualization
- Interactive charts with tooltips
- Responsive chart sizing
- Custom color schemes

#### PDF Export
- **jsPDF** + **html2canvas** for PDF generation
- Custom PDF templates
- Multi-page support
- Branded reports

#### Real-time Features
- **Socket.io Client** for WebSocket connections
- Real-time notifications
- Live updates for collaborative features

---

## 🎨 Design System

### Component Library

Built on **Radix UI** primitives for accessibility and customization:

- **Dialog**: Modal dialogs
- **Dropdown Menu**: Context menus
- **Select**: Dropdown selects
- **Tabs**: Tab navigation
- **Tooltip**: Hover tooltips
- **Progress**: Progress indicators
- **Avatar**: User avatars
- **Checkbox**: Form checkboxes
- **Label**: Form labels

### Styling Approach

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: For theming and customization
- **Dark Mode**: Class-based dark mode support
- **Responsive**: Mobile-first responsive design

### Animation System

- **Framer Motion**: Advanced animations
- **Custom Animations**: Tailwind-based animations
- **Transition System**: Consistent transition timing
- **Micro-interactions**: Subtle feedback animations

---

## 📊 State Management

### Server State (TanStack Query)

**Purpose**: Manage data fetched from the API

**Features:**
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling
- Loading states

**Usage:**
```typescript
// Custom hooks for each resource
const { data: projects, isLoading } = useProjects();
const { data: tasks } = useTasks();
const { mutate: createProject } = useCreateProject();
```

### Client State (Zustand)

**Purpose**: Manage UI state and local preferences

**Features:**
- Lightweight
- TypeScript support
- DevTools integration
- localStorage persistence
- Minimal boilerplate

**Stores:**
- `useBudgetsStore`: Budget filters and local state
- `useContractsStore`: Contract filters
- `useCostsStore`: Cost filters
- `useExpensesStore`: Expense filters

**Pattern:**
```typescript
interface StoreState {
  // State
  items: Item[];
  filters: Filters;
  
  // Actions
  setItems: (items: Item[]) => void;
  setFilters: (filters: Filters) => void;
}
```

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:4000/api`
- **Production**: Set via `NEXT_PUBLIC_API_URL`

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:uid` - Get project
- `PATCH /projects/:uid` - Update project
- `DELETE /projects/:uid` - Delete project

#### Tasks
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `GET /tasks/:uid` - Get task
- `PATCH /tasks/:uid` - Update task
- `DELETE /tasks/:uid` - Delete task

#### Costs, Expenses, Budgets, Contracts
- Similar CRUD endpoints for each resource

### Swagger Documentation

Visit `http://localhost:4000/api` when the backend is running for interactive API documentation.

---

## 🧪 Development

### Backend Scripts

```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run start:prod     # Start production server
npm run lint           # Lint code
npm run test           # Run tests
npm run migration:run  # Run migrations
npm run seed           # Seed database
```

### Frontend Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Lint code
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for both backend and frontend
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Taha Mejdoub** - [@tahamejdoub22](https://github.com/tahamejdoub22)

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Next.js team for the React framework
- Radix UI for accessible components
- All open-source contributors

---

<div align="center">

**Built with ❤️ using NestJS and Next.js**

[Report Bug](https://github.com/tahamejdoub22/NESTBLUE/issues) • [Request Feature](https://github.com/tahamejdoub22/NESTBLUE/issues)

</div>

