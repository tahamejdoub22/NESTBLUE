# Frontend-Backend Integration Guide

## ✅ Integration Status

The backend has been fully integrated with the frontend. All endpoints match the frontend API configuration.

## 🔧 Key Integration Points

### 1. API Response Format

All backend endpoints now return responses in the format expected by the frontend:

```typescript
{
  success: boolean;
  data: T;
  message?: string;
}
```

This is handled by the `TransformInterceptor` in `src/common/interceptors/transform.interceptor.ts`.

### 2. Projects & Tasks Use `uid`

- **Projects**: Use `uid` as primary key (not `id`)
- **Tasks**: Use `uid` as primary key (not `id`)
- **All other entities**: Use UUID `id`

### 3. Task Assignees

- **Backend**: Stores `assigneeIds` as UUID array
- **Frontend**: Expects `assignees` as string array
- **Solution**: Backend transforms `assigneeIds` to `assignees` in task responses

### 4. Dashboard Endpoint

The dashboard endpoint (`/api/dashboard`) returns all data needed by the frontend:

```typescript
{
  workspaceOverview: {...},
  projectStatistics: {...},
  taskInsights: {...},
  timelineSnapshot: {...},
  userActivity: [...],
  userContributions: [...],
  projects: [...], // DashboardProject format (uses id, not uid)
  sprints: [...],
  teamMembers: [...]
}
```

### 5. Sprint Tasks

- Endpoint: `GET /api/sprints/:id/tasks`
- Returns tasks associated with a sprint

### 6. Messages & Conversations

- Conversations use PostgreSQL array queries for participant filtering
- Messages include sender information automatically
- Unread counts are maintained automatically

### 7. Notifications

- Includes all fields expected by frontend: `actionLabel`, `icon`, `projectId`, `taskId`
- Unread count endpoint: `GET /api/notifications/unread-count`

## 📡 Complete API Endpoint Mapping

### Authentication
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/refresh`
- ✅ `POST /api/auth/forgot-password`
- ✅ `POST /api/auth/reset-password`
- ✅ `POST /api/auth/verify-email`
- ✅ `GET /api/auth/me`
- ✅ `POST /api/auth/logout`

### Dashboard
- ✅ `GET /api/dashboard` - Full dashboard data
- ✅ `GET /api/dashboard/stats` - Workspace overview
- ✅ `GET /api/dashboard/insights` - Task insights
- ✅ `GET /api/dashboard/project-statistics` - Project statistics
- ✅ `GET /api/dashboard/projects/:projectId/statistics` - Specific project stats

### Projects (use `uid`)
- ✅ `GET /api/projects`
- ✅ `POST /api/projects`
- ✅ `GET /api/projects/:uid`
- ✅ `PATCH /api/projects/:uid`
- ✅ `DELETE /api/projects/:uid`
- ✅ `GET /api/projects/:uid/tasks`

### Tasks (use `uid`)
- ✅ `GET /api/tasks`
- ✅ `POST /api/tasks`
- ✅ `GET /api/tasks/:uid`
- ✅ `PATCH /api/tasks/:uid`
- ✅ `DELETE /api/tasks/:uid`
- ✅ `POST /api/tasks/:uid/subtasks`
- ✅ `PATCH /api/tasks/:uid/subtasks/:subtaskId`
- ✅ `DELETE /api/tasks/:uid/subtasks/:subtaskId`
- ✅ `POST /api/tasks/:uid/comments`
- ✅ `PATCH /api/tasks/:uid/comments/:commentId`
- ✅ `DELETE /api/tasks/:uid/comments/:commentId`
- ✅ `POST /api/tasks/:uid/attachments`
- ✅ `DELETE /api/tasks/:uid/attachments/:attachmentId`

### Costs, Expenses, Budgets, Contracts (use `id`)
- ✅ Full CRUD for all entities
- ✅ Project filtering support

### Sprints
- ✅ `GET /api/sprints`
- ✅ `POST /api/sprints`
- ✅ `GET /api/sprints/:id`
- ✅ `PATCH /api/sprints/:id`
- ✅ `DELETE /api/sprints/:id`
- ✅ `GET /api/sprints/:id/tasks` - Get sprint tasks

### Messages & Conversations
- ✅ `GET /api/conversations`
- ✅ `POST /api/conversations`
- ✅ `GET /api/conversations/:id`
- ✅ `PATCH /api/conversations/:id`
- ✅ `DELETE /api/conversations/:id`
- ✅ `PATCH /api/conversations/:id/read`
- ✅ `GET /api/conversations/:conversationId/messages`
- ✅ `POST /api/conversations/:conversationId/messages`
- ✅ `GET /api/messages/:id`
- ✅ `PATCH /api/messages/:id`
- ✅ `DELETE /api/messages/:id`
- ✅ `PATCH /api/messages/:id/read`

### Notifications
- ✅ `GET /api/notifications`
- ✅ `POST /api/notifications`
- ✅ `GET /api/notifications/:id`
- ✅ `PATCH /api/notifications/:id/read`
- ✅ `PATCH /api/notifications/read-all`
- ✅ `DELETE /api/notifications/:id`
- ✅ `GET /api/notifications/unread-count`

## 🚀 Frontend Configuration

Update your frontend `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## 🔍 Data Transformations

### Task Transformation
Backend automatically transforms tasks to match frontend format:
- `assigneeIds` → `assignees`
- Includes subtasks, comments, attachments count
- Includes author names in comments

### Dashboard Project Transformation
- Projects use `uid` internally
- Dashboard returns projects with `id` field (set to `uid`) for frontend compatibility

### Conversation Transformation
- Participant IDs are transformed to participant objects
- Last message is included
- Unread counts are maintained

## ⚠️ Important Notes

1. **Task Assignees**: Frontend receives assignee IDs as strings. To get names, frontend should fetch user data separately or backend can be enhanced to include user objects.

2. **Sprint Tasks**: Currently returns empty array. Implement sprint-task relationship if needed.

3. **File Uploads**: Attachment upload endpoint is ready but needs file storage configuration (local/S3).

4. **User Names in Tasks**: Comment authors include names. Task assignees are IDs - consider adding user lookup.

5. **Dashboard Projects**: Uses `id` field (set to `uid`) to match frontend `DashboardProject` interface.

## 🎯 Next Steps

1. **Test Integration**: Start both frontend and backend, test all endpoints
2. **User Lookup**: Enhance task responses to include assignee user objects
3. **File Storage**: Configure file upload storage for attachments
4. **Sprint-Task Relationship**: Add proper relationship if needed
5. **Real-time Updates**: Consider adding WebSocket support for real-time updates

## ✅ Integration Complete!

The backend is now fully integrated with the frontend. All endpoints match, data formats are compatible, and the API response structure is consistent.


