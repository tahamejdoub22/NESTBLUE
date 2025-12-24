/**
 * API Helpers
 * 
 * Direct API calls to backend - no mock data fallback
 */

import { api } from "./api";
import type {
  Budget,
  Cost,
  Expense,
  Contract,
  CreateBudgetInput,
  UpdateBudgetInput,
  CreateCostInput,
  UpdateCostInput,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateContractInput,
  UpdateContractInput,
  Task,
  Comment,
  Message,
  Conversation,
  Notification,
  DashboardData,
  ProjectStatistics,
  Project,
  User,
  UserProfile,
  Sprint,
  LoginInput,
  RegisterInput,
  AuthResponse,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/interfaces";
import type { Note } from "@/interfaces/note.interface";
import type { ProjectOverviewDataPoint } from "@/components/molecules/project-overview-chart";

/**
 * Budget API helpers - direct backend calls
 */
export const budgetApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Budget[]> => {
    return api.getBudgets(params);
  },

  getById: async (id: string): Promise<Budget> => {
    return api.getBudgetById(id);
  },

  create: async (input: CreateBudgetInput): Promise<Budget> => {
    return api.createBudget(input);
  },

  update: async (id: string, input: UpdateBudgetInput): Promise<Budget> => {
    return api.updateBudget(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteBudget(id);
  },
};

/**
 * Cost API helpers - direct backend calls
 */
export const costApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Cost[]> => {
    return api.getCosts(params);
  },

  getById: async (id: string): Promise<Cost> => {
    return api.getCostById(id);
  },

  create: async (input: CreateCostInput): Promise<Cost> => {
    return api.createCost(input);
  },

  update: async (id: string, input: UpdateCostInput): Promise<Cost> => {
    return api.updateCost(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteCost(id);
  },
};

/**
 * Expense API helpers - direct backend calls
 */
export const expenseApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Expense[]> => {
    return api.getExpenses(params);
  },

  getById: async (id: string): Promise<Expense> => {
    return api.getExpenseById(id);
  },

  create: async (input: CreateExpenseInput): Promise<Expense> => {
    return api.createExpense(input);
  },

  update: async (id: string, input: UpdateExpenseInput): Promise<Expense> => {
    return api.updateExpense(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteExpense(id);
  },
};

/**
 * Contract API helpers - direct backend calls
 */
export const contractApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Contract[]> => {
    return api.getContracts(params);
  },

  getById: async (id: string): Promise<Contract> => {
    return api.getContractById(id);
  },

  create: async (input: CreateContractInput): Promise<Contract> => {
    return api.createContract(input);
  },

  update: async (id: string, input: UpdateContractInput): Promise<Contract> => {
    return api.updateContract(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteContract(id);
  },
};

/**
 * Project API helpers - direct backend calls
 */
export const projectApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Project[]> => {
    return api.getProjects(params);
  },

  getByUid: async (uid: string): Promise<Project> => {
    return api.getProjectByUid(uid);
  },

  create: async (input: Omit<Project, "uid">): Promise<Project> => {
    return api.createProject(input);
  },

  update: async (uid: string, input: Partial<Omit<Project, "uid">>): Promise<Project> => {
    return api.updateProject(uid, input);
  },

  delete: async (uid: string): Promise<void> => {
    return api.deleteProject(uid);
  },
};

/**
 * Task API helpers - direct backend calls
 */
export const taskApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Task[]> => {
    return api.getTasks(params);
  },

  getByUid: async (uid: string): Promise<Task> => {
    return api.getTaskByUid(uid);
  },

  getByProject: async (projectId: string): Promise<Task[]> => {
    return api.getTasksByProject(projectId);
  },

  create: async (input: Omit<Task, "uid" | "identifier">): Promise<Task> => {
    return api.createTask(input);
  },

  update: async (uid: string, input: Partial<Omit<Task, "uid" | "identifier">>): Promise<Task> => {
    return api.updateTask(uid, input);
  },

  delete: async (uid: string): Promise<void> => {
    return api.deleteTask(uid);
  },

  // Subtasks
  addSubtask: async (uid: string, subtask: { title: string }): Promise<{ id: string; title: string; completed: boolean }> => {
    return api.addSubtask(uid, subtask);
  },

  updateSubtask: async (uid: string, subtaskId: string, subtask: Partial<{ title: string; completed: boolean }>): Promise<{ id: string; title: string; completed: boolean }> => {
    return api.updateSubtask(uid, subtaskId, subtask);
  },

  deleteSubtask: async (uid: string, subtaskId: string): Promise<void> => {
    return api.deleteSubtask(uid, subtaskId);
  },

  // Comments
  addComment: async (uid: string, comment: { text: string }): Promise<Comment> => {
    return api.addComment(uid, comment);
  },

  updateComment: async (uid: string, commentId: string, comment: { text: string }): Promise<Comment> => {
    return api.updateComment(uid, commentId, comment);
  },

  deleteComment: async (uid: string, commentId: string): Promise<void> => {
    return api.deleteComment(uid, commentId);
  },

  // Attachments
  uploadAttachment: async (uid: string, file: File): Promise<{ id: string; name: string; url: string; size: number; type: string }> => {
    return api.uploadAttachment(uid, file);
  },

  deleteAttachment: async (uid: string, attachmentId: string): Promise<void> => {
    return api.deleteAttachment(uid, attachmentId);
  },

  downloadAttachment: async (uid: string, attachmentId: string): Promise<Blob> => {
    return api.downloadAttachment(uid, attachmentId);
  },
};

/**
 * Conversation API helpers - direct backend calls
 */
export const conversationApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Conversation[]> => {
    return api.getConversations(params);
  },

  getById: async (id: string): Promise<Conversation> => {
    return api.getConversationById(id);
  },

  create: async (input: Omit<Conversation, "id" | "createdAt" | "updatedAt">): Promise<Conversation> => {
    return api.createConversation(input);
  },

  update: async (id: string, input: Partial<Omit<Conversation, "id" | "createdAt" | "updatedAt">>): Promise<Conversation> => {
    return api.updateConversation(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteConversation(id);
  },

  markRead: async (id: string): Promise<void> => {
    return api.markConversationRead(id);
  },
};

/**
 * Message API helpers - direct backend calls
 */
export const messageApi = {
  getByConversation: async (
    conversationId: string,
    params?: Record<string, unknown>
  ): Promise<Message[]> => {
    return api.getMessages(conversationId, params);
  },

  getById: async (id: string): Promise<Message> => {
    return api.getMessageById(id);
  },

  create: async (conversationId: string, input: { content: string; attachments?: string[] }): Promise<Message> => {
    // Backend DTO expects only content and optional attachments
    return api.createMessage(conversationId, input);
  },

  update: async (id: string, input: Partial<Omit<Message, "id" | "createdAt" | "updatedAt">>): Promise<Message> => {
    return api.updateMessage(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteMessage(id);
  },

  markRead: async (id: string): Promise<void> => {
    return api.markMessageRead(id);
  },
};

/**
 * Notification API helpers - direct backend calls
 */
export const notificationApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Notification[]> => {
    return api.getNotifications(params);
  },

  getById: async (id: string): Promise<Notification> => {
    return api.getNotificationById(id);
  },

  markRead: async (id: string): Promise<void> => {
    return api.markNotificationRead(id);
  },

  markAllRead: async (): Promise<void> => {
    return api.markAllNotificationsRead();
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteNotification(id);
  },

  getUnreadCount: async (): Promise<number> => {
    const result = await api.getUnreadNotificationCount();
    return typeof result === 'number' ? result : 0;
  },
};

/**
 * Dashboard API helpers - direct backend calls
 */
export const dashboardApi = {
  getData: async (): Promise<DashboardData> => {
    return api.getDashboardData();
  },

  getProjectStatistics: async (projectId?: string): Promise<ProjectStatistics> => {
    return api.getProjectStatistics(projectId);
  },
};

/**
 * User API helpers - direct backend calls
 */
export const userApi = {
  getAll: async (params?: Record<string, unknown>): Promise<User[]> => {
    return api.getUsers(params);
  },

  getById: async (id: string): Promise<User> => {
    return api.getUserById(id);
  },

  getCurrent: async (): Promise<UserProfile> => {
    return api.getCurrentUser();
  },

  create: async (input: Partial<User>): Promise<User> => {
    return api.createUser(input);
  },

  update: async (id: string, input: Partial<User>): Promise<User> => {
    return api.updateUser(id, input);
  },

  updateProfile: async (input: Partial<UserProfile>): Promise<UserProfile> => {
    return api.updateProfile(input);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return api.changePassword(currentPassword, newPassword);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteUser(id);
  },
};

/**
 * Sprint API helpers - direct backend calls
 */
export const sprintApi = {
  getAll: async (params?: Record<string, unknown>): Promise<Sprint[]> => {
    return api.getSprints(params);
  },

  getById: async (id: string): Promise<Sprint> => {
    return api.getSprintById(id);
  },

  getByProject: async (projectId: string): Promise<Sprint[]> => {
    return api.getSprintsByProject(projectId);
  },

  getTasks: async (sprintId: string): Promise<Task[]> => {
    return api.getSprintTasks(sprintId);
  },

  create: async (input: Partial<Sprint>): Promise<Sprint> => {
    return api.createSprint(input);
  },

  update: async (id: string, input: Partial<Sprint>): Promise<Sprint> => {
    return api.updateSprint(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteSprint(id);
  },
};

/**
 * Authentication API helpers - direct backend calls
 */
export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    return api.login(input);
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    return api.register(input);
  },

  logout: async (): Promise<void> => {
    return api.logout();
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return api.refreshToken(refreshToken);
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return api.getCurrentAuthUser();
  },

  forgotPassword: async (input: ForgotPasswordInput): Promise<{ message: string }> => {
    return api.forgotPassword(input);
  },

  resetPassword: async (input: ResetPasswordInput): Promise<{ message: string }> => {
    return api.resetPassword(input);
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return api.verifyEmail(token);
  },
};

/**
 * Project Team Members API helpers
 */
export const projectMembersApi = {
  getMembers: async (projectUid: string) => {
    return api.getProjectMembers(projectUid);
  },

  inviteMember: async (projectUid: string, input: { userId: string; role?: string }) => {
    return api.inviteProjectMember(projectUid, input);
  },

  inviteMembers: async (projectUid: string, input: { userIds: string[]; role?: string }) => {
    return api.inviteProjectMembers(projectUid, input);
  },

  removeMember: async (projectUid: string, userId: string) => {
    return api.removeProjectMember(projectUid, userId);
  },

  updateMemberRole: async (projectUid: string, userId: string, role: string) => {
    return api.updateProjectMemberRole(projectUid, userId, role);
  },
};

/**
 * Team Spaces API helpers
 */
export const teamSpacesApi = {
  create: async (input: { name: string; description?: string; memberIds?: string[]; color?: string; icon?: string }) => {
    return api.createTeamSpace(input);
  },

  getAll: async () => {
    return api.getAllTeamSpaces();
  },

  getById: async (id: string) => {
    return api.getTeamSpace(id);
  },

  update: async (id: string, input: Partial<{ name: string; description?: string; memberIds?: string[]; color?: string; icon?: string; isActive?: boolean }>) => {
    return api.updateTeamSpace(id, input);
  },

  delete: async (id: string) => {
    return api.deleteTeamSpace(id);
  },
};

/**
 * Notes API helpers - direct backend calls
 */
export const notesApi = {
  getAll: async (): Promise<Note[]> => {
    return api.getNotes();
  },

  getById: async (id: string): Promise<Note> => {
    return api.getNoteById(id);
  },

  create: async (input: { content: string; color?: string; rotation?: number }): Promise<Note> => {
    return api.createNote(input);
  },

  update: async (id: string, input: Partial<{ content: string; color?: string; rotation?: number }>): Promise<Note> => {
    return api.updateNote(id, input);
  },

  delete: async (id: string): Promise<void> => {
    return api.deleteNote(id);
  },
};

/**
 * Project Overview API helpers
 */
export const projectOverviewApi = {
  getData: async (period?: string): Promise<ProjectOverviewDataPoint[]> => {
    return api.getProjectOverview(period);
  },
};
