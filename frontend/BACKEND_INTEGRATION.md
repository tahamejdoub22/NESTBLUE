# Backend Integration Guide

This application is now ready for backend integration while maintaining support for mock data during development.

## Architecture Overview

The application uses a layered architecture:

1. **API Service Layer** (`src/core/services/api.ts`) - Handles HTTP requests to the backend
2. **API Helpers** (`src/core/services/api-helpers.ts`) - Provides automatic fallback to mock data
3. **Hooks** (`src/hooks/`) - React Query hooks that use the API helpers
4. **Stores** (`src/core/store/`) - Zustand stores for client-side state management
5. **Mock Data** (`src/core/data/`) - Mock data files (preserved for development)

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL (required for production)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Use mock data instead of real API (optional, defaults to true if API_URL is not set)
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Backend API Requirements

Your backend API should follow these conventions:

#### Response Format

All API responses should follow this structure:

```typescript
{
  data: T,           // The actual data
  success: boolean,  // Success indicator
  message?: string   // Optional message
}
```

#### Authentication

The API service automatically includes an authentication token from `localStorage.getItem("auth_token")` in the `Authorization` header as `Bearer {token}`.

To set the token after login:
```typescript
localStorage.setItem("auth_token", "your-jwt-token");
```

#### Endpoints

The application expects the following endpoints:

**Budgets:**
- `GET /budgets` - List all budgets
- `GET /budgets/:id` - Get budget by ID
- `POST /budgets` - Create budget
- `PATCH /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget

**Costs:**
- `GET /costs` - List all costs
- `GET /costs/:id` - Get cost by ID
- `POST /costs` - Create cost
- `PATCH /costs/:id` - Update cost
- `DELETE /costs/:id` - Delete cost

**Expenses:**
- `GET /expenses` - List all expenses
- `GET /expenses/:id` - Get expense by ID
- `POST /expenses` - Create expense
- `PATCH /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

**Contracts:**
- `GET /contracts` - List all contracts
- `GET /contracts/:id` - Get contract by ID
- `POST /contracts` - Create contract
- `PATCH /contracts/:id` - Update contract
- `DELETE /contracts/:id` - Delete contract

**Projects:**
- `GET /projects` - List all projects
- `GET /projects/:uid` - Get project by UID (Project uses `uid`, not `id`, and doesn't extend BaseEntity)
- `POST /projects` - Create project (body: `Omit<Project, "uid">`)
- `PATCH /projects/:uid` - Update project (body: `Partial<Omit<Project, "uid">>`)
- `DELETE /projects/:uid` - Delete project

**Tasks:**
- `GET /tasks` - List all tasks
- `GET /tasks/:uid` - Get task by UID (Task uses `uid`, not `id`, and doesn't extend BaseEntity)
- `GET /projects/:projectId/tasks` - Get tasks by project
- `POST /tasks` - Create task (body: `Omit<Task, "uid" | "identifier">`)
- `PATCH /tasks/:uid` - Update task (body: `Partial<Omit<Task, "uid" | "identifier">>`)
- `DELETE /tasks/:uid` - Delete task

**Conversations:**
- `GET /conversations` - List all conversations
- `GET /conversations/:id` - Get conversation by ID (Conversation doesn't extend BaseEntity but has id, createdAt, updatedAt)
- `POST /conversations` - Create conversation (body: `Omit<Conversation, "id" | "createdAt" | "updatedAt">`)
- `PATCH /conversations/:id` - Update conversation (body: `Partial<Omit<Conversation, "id" | "createdAt" | "updatedAt">>`)
- `DELETE /conversations/:id` - Delete conversation
- `PATCH /conversations/:id/read` - Mark conversation as read

**Messages:**
- `GET /conversations/:conversationId/messages` - Get messages by conversation
- `GET /messages/:id` - Get message by ID (Message doesn't extend BaseEntity but has id, createdAt, updatedAt)
- `POST /conversations/:conversationId/messages` - Create message (body: `Omit<Message, "id" | "createdAt" | "updatedAt">`)
- `PATCH /messages/:id` - Update message (body: `Partial<Omit<Message, "id" | "createdAt" | "updatedAt">>`)
- `DELETE /messages/:id` - Delete message
- `PATCH /messages/:id/read` - Mark message as read

**Notifications:**
- `GET /notifications` - List all notifications
- `GET /notifications/:id` - Get notification by ID
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/unread-count` - Get unread notification count

**Dashboard:**
- `GET /dashboard` - Get dashboard data (includes workspace overview, project statistics, task insights, etc.)

### Customizing Endpoints

To customize API endpoints, edit `src/core/config/api-endpoints.ts`:

```typescript
export const API_ENDPOINTS = {
  BUDGETS: {
    BASE: "/your-custom-path/budgets",
    // ... other endpoints
  },
  // ... other resources
};
```

## How It Works

### Automatic Fallback

The API helpers automatically fall back to mock data when:
- `NEXT_PUBLIC_USE_MOCK_DATA=true` is set
- `NEXT_PUBLIC_API_URL` is not set
- Network errors occur
- API requests timeout

### Data Flow

1. **Component** calls a hook (e.g., `useBudgets()`)
2. **Hook** uses React Query to fetch data via API helper
3. **API Helper** attempts to call the backend API
4. **On Error** - Falls back to mock data automatically
5. **Store** is updated with the fetched data
6. **Component** receives data from the store

## Development Mode

By default, the application uses mock data. This allows you to:
- Develop frontend features without a backend
- Test UI components independently
- Work offline

To use mock data, simply don't set `NEXT_PUBLIC_API_URL` or set `NEXT_PUBLIC_USE_MOCK_DATA=true`.

## Production Mode

To connect to a real backend:

1. Set `NEXT_PUBLIC_API_URL` to your backend URL
2. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
3. Ensure your backend implements the required endpoints
4. Handle authentication tokens properly

## Constants Preservation

All constants in `src/core/config/constants.ts` are preserved and can be used by both frontend and backend:

- `CURRENCIES` - Available currencies
- `COST_CATEGORIES` - Cost categories
- `CONTRACT_STATUSES` - Contract status options
- `PAYMENT_FREQUENCIES` - Payment frequency options
- `DEFAULT_CURRENCY` - Default currency
- `DEFAULT_PAGE_SIZE` - Default pagination size

These constants remain unchanged and are available throughout the application.

## Error Handling

The API service includes automatic error handling:

- **401 Unauthorized** - Automatically removes auth token (you can add redirect logic)
- **Network Errors** - Falls back to mock data
- **Timeout Errors** - Falls back to mock data
- **Other Errors** - Propagated to the component for user feedback

## Testing

To test backend integration:

1. Start your backend server
2. Set environment variables
3. The app will automatically use the backend when available
4. If the backend is unavailable, it falls back to mock data

## Migration Checklist

When migrating from mock data to backend:

- [ ] Set up backend API with required endpoints
- [ ] Configure environment variables
- [ ] Test authentication flow
- [ ] Verify all CRUD operations work
- [ ] Test error handling
- [ ] Update API endpoints if needed
- [ ] Test with network failures (should fallback to mock)

## Support

For questions or issues:
1. Check the API endpoint configuration
2. Verify environment variables
3. Check browser console for API errors
4. Ensure backend CORS is configured correctly

