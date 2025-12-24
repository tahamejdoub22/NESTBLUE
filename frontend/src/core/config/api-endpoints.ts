/**
 * API Endpoints Configuration
 * 
 * This file contains all API endpoint paths for the application.
 * Update these paths to match your backend API structure.
 */
export const API_ENDPOINTS = {
  // Budgets
  BUDGETS: {
    BASE: "/budgets",
    BY_ID: (id: string) => `/budgets/${id}`,
    LIST: "/budgets",
    CREATE: "/budgets",
    UPDATE: (id: string) => `/budgets/${id}`,
    DELETE: (id: string) => `/budgets/${id}`,
  },
  
  // Costs
  COSTS: {
    BASE: "/costs",
    BY_ID: (id: string) => `/costs/${id}`,
    LIST: "/costs",
    CREATE: "/costs",
    UPDATE: (id: string) => `/costs/${id}`,
    DELETE: (id: string) => `/costs/${id}`,
  },
  
  // Expenses
  EXPENSES: {
    BASE: "/expenses",
    BY_ID: (id: string) => `/expenses/${id}`,
    LIST: "/expenses",
    CREATE: "/expenses",
    UPDATE: (id: string) => `/expenses/${id}`,
    DELETE: (id: string) => `/expenses/${id}`,
  },
  
  // Contracts
  CONTRACTS: {
    BASE: "/contracts",
    BY_ID: (id: string) => `/contracts/${id}`,
    LIST: "/contracts",
    CREATE: "/contracts",
    UPDATE: (id: string) => `/contracts/${id}`,
    DELETE: (id: string) => `/contracts/${id}`,
  },
  
  // Projects - Uses uid, not id
  PROJECTS: {
    BASE: "/projects",
    BY_UID: (uid: string) => `/projects/${uid}`,
    LIST: "/projects",
    CREATE: "/projects",
    UPDATE: (uid: string) => `/projects/${uid}`,
    DELETE: (uid: string) => `/projects/${uid}`,
    // Team Members
    MEMBERS: (uid: string) => `/projects/${uid}/members`,
    INVITE_MEMBER: (uid: string) => `/projects/${uid}/members/invite`,
    INVITE_MEMBERS: (uid: string) => `/projects/${uid}/members/invite-multiple`,
    REMOVE_MEMBER: (uid: string, userId: string) => `/projects/${uid}/members/${userId}`,
    UPDATE_MEMBER_ROLE: (uid: string, userId: string) => `/projects/${uid}/members/${userId}/role`,
  },
  
  // Team Spaces
  SPACES: {
    BASE: "/projects/spaces",
    LIST: "/projects/spaces",
    CREATE: "/projects/spaces",
    BY_ID: (id: string) => `/projects/spaces/${id}`,
    UPDATE: (id: string) => `/projects/spaces/${id}`,
    DELETE: (id: string) => `/projects/spaces/${id}`,
  },
  
  // Tasks - Uses uid, not id
  TASKS: {
    BASE: "/tasks",
    BY_UID: (uid: string) => `/tasks/${uid}`,
    LIST: "/tasks",
    CREATE: "/tasks",
    UPDATE: (uid: string) => `/tasks/${uid}`,
    DELETE: (uid: string) => `/tasks/${uid}`,
    BY_PROJECT: (projectId: string) => `/projects/${projectId}/tasks`,
    // Subtasks
    SUBTASKS: (uid: string) => `/tasks/${uid}/subtasks`,
    ADD_SUBTASK: (uid: string) => `/tasks/${uid}/subtasks`,
    UPDATE_SUBTASK: (uid: string, subtaskId: string) => `/tasks/${uid}/subtasks/${subtaskId}`,
    DELETE_SUBTASK: (uid: string, subtaskId: string) => `/tasks/${uid}/subtasks/${subtaskId}`,
    // Comments
    COMMENTS: (uid: string) => `/tasks/${uid}/comments`,
    ADD_COMMENT: (uid: string) => `/tasks/${uid}/comments`,
    UPDATE_COMMENT: (uid: string, commentId: string) => `/tasks/${uid}/comments/${commentId}`,
    DELETE_COMMENT: (uid: string, commentId: string) => `/tasks/${uid}/comments/${commentId}`,
    // Attachments
    ATTACHMENTS: (uid: string) => `/tasks/${uid}/attachments`,
    UPLOAD_ATTACHMENT: (uid: string) => `/tasks/${uid}/attachments`,
    DELETE_ATTACHMENT: (uid: string, attachmentId: string) => `/tasks/${uid}/attachments/${attachmentId}`,
    DOWNLOAD_ATTACHMENT: (uid: string, attachmentId: string) => `/tasks/${uid}/attachments/${attachmentId}/download`,
  },
  
  // Messages & Conversations
  MESSAGES: {
    BASE: "/messages",
    BY_ID: (id: string) => `/messages/${id}`,
    BY_CONVERSATION: (conversationId: string) => `/conversations/${conversationId}/messages`,
    CREATE: (conversationId: string) => `/conversations/${conversationId}/messages`,
    UPDATE: (id: string) => `/messages/${id}`,
    DELETE: (id: string) => `/messages/${id}`,
    MARK_READ: (id: string) => `/messages/${id}/read`,
  },
  
  CONVERSATIONS: {
    BASE: "/conversations",
    BY_ID: (id: string) => `/conversations/${id}`,
    LIST: "/conversations",
    CREATE: "/conversations",
    UPDATE: (id: string) => `/conversations/${id}`,
    DELETE: (id: string) => `/conversations/${id}`,
    MARK_READ: (id: string) => `/conversations/${id}/read`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    BY_ID: (id: string) => `/notifications/${id}`,
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: (id: string) => `/notifications/${id}`,
    UNREAD_COUNT: "/notifications/unread-count",
  },
  
  // Users
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: "/users/me",
    UPDATE_PROFILE: "/users/me",
    CHANGE_PASSWORD: "/users/me/password",
  },
  
  // Sprints
  SPRINTS: {
    BASE: "/sprints",
    BY_ID: (id: string) => `/sprints/${id}`,
    LIST: "/sprints",
    CREATE: "/sprints",
    UPDATE: (id: string) => `/sprints/${id}`,
    DELETE: (id: string) => `/sprints/${id}`,
    BY_PROJECT: (projectId: string) => `/projects/${projectId}/sprints`,
    TASKS: (sprintId: string) => `/sprints/${sprintId}/tasks`,
  },
  
  // Authentication
  AUTH: {
    BASE: "/auth",
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    ME: "/auth/me",
  },
  
  // Dashboard
  DASHBOARD: {
    BASE: "/dashboard",
    STATS: "/dashboard/stats",
    INSIGHTS: "/dashboard/insights",
    DATA: "/dashboard",
    PROJECT_STATISTICS: (projectId?: string) => 
      projectId ? `/dashboard/projects/${projectId}/statistics` : "/dashboard/project-statistics",
    PROJECT_OVERVIEW: "/dashboard/project-overview",
  },
  
  // Notes
  NOTES: {
    BASE: "/notes",
    BY_ID: (id: string) => `/notes/${id}`,
    LIST: "/notes",
    CREATE: "/notes",
    UPDATE: (id: string) => `/notes/${id}`,
    DELETE: (id: string) => `/notes/${id}`,
  },
} as const;

