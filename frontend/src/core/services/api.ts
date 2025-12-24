import axios, { AxiosError, type AxiosInstance } from "axios";
import type { ApiResponse, PaginatedResponse } from "@/interfaces";
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
  DashboardProject,
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
import { API_ENDPOINTS } from "@/core/config/api-endpoints";

// Backend API URL - defaults to port 4000 to avoid conflict with Next.js (port 3000)
// Set NEXT_PUBLIC_API_URL environment variable to override
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Successfully received response - even if data is empty, this is valid
        return response;
      },
      (error: AxiosError) => {
        // Handle 404 for auth/me endpoint FIRST - fail silently if backend is not running
        if (error.response?.status === 404 && error.config?.url?.includes('/auth/me')) {
          // Clear token since endpoint doesn't exist
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
          }
          // Return a silent error that won't be logged
          const silentError: any = new Error("Backend not available");
          silentError.name = "SilentError";
          silentError.silent = true;
          return Promise.reject(silentError);
        }
        
        // Handle network errors for auth/me - also fail silently
        if (!error.response && error.config?.url?.includes('/auth/me')) {
          const silentError: any = new Error("Network Error: Backend not available");
          silentError.name = "SilentError";
          silentError.silent = true;
          return Promise.reject(silentError);
        }
        
        const message = this.getErrorMessage(error);
        
        // Handle 401 Unauthorized - clear token but don't redirect (let AuthGuard handle it)
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
          }
        }
        
        // For network errors (no response), include more specific error info
        if (!error.response) {
          const errorMessage = error.message || '';
          const errorCode = error.code || '';
          
          // Check for connection refused errors (multiple ways it can appear)
          if (
            errorCode === "ECONNREFUSED" || 
            errorCode === "ERR_CONNECTION_REFUSED" ||
            errorMessage.includes("ERR_CONNECTION_REFUSED") ||
            errorMessage.includes("ECONNREFUSED") ||
            errorMessage.includes("Failed to fetch") ||
            errorMessage.includes("Network Error")
          ) {
            const apiUrl = API_BASE_URL.replace('/api', '');
            return Promise.reject(new Error(
              `🚨 Backend server is not running!\n\n` +
              `Please start the backend server:\n` +
              `1. Open a new terminal\n` +
              `2. Navigate to: backend folder\n` +
              `3. Run: npm run start:dev\n\n` +
              `Backend should run on: ${apiUrl}\n` +
              `See START_BACKEND.md for detailed instructions.`
            ));
          }
          if (errorMessage.includes("timeout")) {
            return Promise.reject(new Error("Network error: Request timeout"));
          }
          return Promise.reject(new Error("Network Error: " + (errorMessage || "Failed to fetch")));
        }
        
        return Promise.reject(new Error(message));
      }
    );
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as { message?: string; error?: string };
      return data.message || data.error || "An error occurred";
    }
    if (error.request) {
      return "Network error. Please check your connection.";
    }
    return error.message || "An unexpected error occurred";
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: Record<string, unknown>, config?: { responseType?: "blob" | "json" }): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params, ...config });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // Budgets API methods
  async getBudgets(params?: Record<string, unknown>): Promise<Budget[]> {
    const response = await this.get<Budget[]>(API_ENDPOINTS.BUDGETS.LIST, params);
    return response.data;
  }

  async getBudgetById(id: string): Promise<Budget> {
    const response = await this.get<Budget>(API_ENDPOINTS.BUDGETS.BY_ID(id));
    return response.data;
  }

  async createBudget(input: CreateBudgetInput): Promise<Budget> {
    const response = await this.post<Budget>(API_ENDPOINTS.BUDGETS.CREATE, input);
    return response.data;
  }

  async updateBudget(id: string, input: UpdateBudgetInput): Promise<Budget> {
    const response = await this.patch<Budget>(API_ENDPOINTS.BUDGETS.UPDATE(id), input);
    return response.data;
  }

  async deleteBudget(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.BUDGETS.DELETE(id));
  }

  // Costs API methods
  async getCosts(params?: Record<string, unknown>): Promise<Cost[]> {
    // Generic get<T> already returns ApiResponse<T> = { success, data }
    const response = await this.get<Cost[]>(API_ENDPOINTS.COSTS.LIST, params);
    return response.data;
  }

  async getCostById(id: string): Promise<Cost> {
    const response = await this.get<Cost>(API_ENDPOINTS.COSTS.BY_ID(id));
    return response.data;
  }

  async createCost(input: CreateCostInput): Promise<Cost> {
    const response = await this.post<Cost>(API_ENDPOINTS.COSTS.CREATE, input);
    return response.data;
  }

  async updateCost(id: string, input: UpdateCostInput): Promise<Cost> {
    const response = await this.patch<Cost>(API_ENDPOINTS.COSTS.UPDATE(id), input);
    return response.data;
  }

  async deleteCost(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.COSTS.DELETE(id));
  }

  // Expenses API methods
  async getExpenses(params?: Record<string, unknown>): Promise<Expense[]> {
    const response = await this.get<Expense[]>(API_ENDPOINTS.EXPENSES.LIST, params);
    return response.data;
  }

  async getExpenseById(id: string): Promise<Expense> {
    const response = await this.get<Expense>(API_ENDPOINTS.EXPENSES.BY_ID(id));
    return response.data;
  }

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const response = await this.post<Expense>(API_ENDPOINTS.EXPENSES.CREATE, input);
    return response.data;
  }

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
    const response = await this.patch<Expense>(API_ENDPOINTS.EXPENSES.UPDATE(id), input);
    return response.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.EXPENSES.DELETE(id));
  }

  // Contracts API methods
  async getContracts(params?: Record<string, unknown>): Promise<Contract[]> {
    const response = await this.get<Contract[]>(API_ENDPOINTS.CONTRACTS.LIST, params);
    return response.data;
  }

  async getContractById(id: string): Promise<Contract> {
    const response = await this.get<Contract>(API_ENDPOINTS.CONTRACTS.BY_ID(id));
    return response.data;
  }

  async createContract(input: CreateContractInput): Promise<Contract> {
    const response = await this.post<Contract>(API_ENDPOINTS.CONTRACTS.CREATE, input);
    return response.data;
  }

  async updateContract(id: string, input: UpdateContractInput): Promise<Contract> {
    const response = await this.patch<Contract>(API_ENDPOINTS.CONTRACTS.UPDATE(id), input);
    return response.data;
  }

  async deleteContract(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.CONTRACTS.DELETE(id));
  }

  // Projects API methods - Project uses uid, not id, and doesn't extend BaseEntity
  async getProjects(params?: Record<string, unknown>): Promise<Project[]> {
    const response = await this.get<Project[]>(API_ENDPOINTS.PROJECTS.LIST, params);
    return response.data;
  }

  async getProjectByUid(uid: string): Promise<Project> {
    const response = await this.get<Project>(API_ENDPOINTS.PROJECTS.BY_UID(uid));
    return response.data;
  }

  async createProject(input: Omit<Project, "uid">): Promise<Project> {
    const response = await this.post<Project>(API_ENDPOINTS.PROJECTS.CREATE, input);
    return response.data;
  }

  async updateProject(uid: string, input: Partial<Omit<Project, "uid">>): Promise<Project> {
    const response = await this.patch<Project>(API_ENDPOINTS.PROJECTS.UPDATE(uid), input);
    return response.data;
  }

  async deleteProject(uid: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.PROJECTS.DELETE(uid));
  }

  // Tasks API methods - Task uses uid, not id, and doesn't extend BaseEntity
  async getTasks(params?: Record<string, unknown>): Promise<Task[]> {
    const response = await this.get<Task[]>(API_ENDPOINTS.TASKS.LIST, params);
    return response.data;
  }

  async getTaskByUid(uid: string): Promise<Task> {
    const response = await this.get<Task>(API_ENDPOINTS.TASKS.BY_UID(uid));
    return response.data;
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    const response = await this.get<Task[]>(API_ENDPOINTS.TASKS.BY_PROJECT(projectId));
    return response.data;
  }

  async createTask(input: Omit<Task, "uid" | "identifier">): Promise<Task> {
    const response = await this.post<Task>(API_ENDPOINTS.TASKS.CREATE, input);
    return response.data;
  }

  async updateTask(uid: string, input: Partial<Omit<Task, "uid" | "identifier">>): Promise<Task> {
    const response = await this.patch<Task>(API_ENDPOINTS.TASKS.UPDATE(uid), input);
    return response.data;
  }

  async deleteTask(uid: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.TASKS.DELETE(uid));
  }

  // Task Subtasks API methods
  async addSubtask(uid: string, subtask: { title: string }): Promise<{ id: string; title: string; completed: boolean }> {
    const response = await this.post<{ id: string; title: string; completed: boolean }>(
      API_ENDPOINTS.TASKS.ADD_SUBTASK(uid),
      subtask
    );
    return response.data;
  }

  async updateSubtask(uid: string, subtaskId: string, subtask: Partial<{ title: string; completed: boolean }>): Promise<{ id: string; title: string; completed: boolean }> {
    const response = await this.patch<{ id: string; title: string; completed: boolean }>(
      API_ENDPOINTS.TASKS.UPDATE_SUBTASK(uid, subtaskId),
      subtask
    );
    return response.data;
  }

  async deleteSubtask(uid: string, subtaskId: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.TASKS.DELETE_SUBTASK(uid, subtaskId));
  }

  // Task Comments API methods
  async addComment(uid: string, comment: { text: string }): Promise<Comment> {
    const response = await this.post<Comment>(API_ENDPOINTS.TASKS.ADD_COMMENT(uid), comment);
    return response.data;
  }

  async updateComment(uid: string, commentId: string, comment: { text: string }): Promise<Comment> {
    const response = await this.patch<Comment>(API_ENDPOINTS.TASKS.UPDATE_COMMENT(uid, commentId), comment);
    return response.data;
  }

  async deleteComment(uid: string, commentId: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.TASKS.DELETE_COMMENT(uid, commentId));
  }

  // Task Attachments API methods
  async uploadAttachment(uid: string, file: File): Promise<{ id: string; name: string; url: string; size: number; type: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.post<{ id: string; name: string; url: string; size: number; type: string }>(
      API_ENDPOINTS.TASKS.UPLOAD_ATTACHMENT(uid),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async deleteAttachment(uid: string, attachmentId: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.TASKS.DELETE_ATTACHMENT(uid, attachmentId));
  }

  async downloadAttachment(uid: string, attachmentId: string): Promise<Blob> {
    const response = await this.get<Blob>(API_ENDPOINTS.TASKS.DOWNLOAD_ATTACHMENT(uid, attachmentId), undefined, {
      responseType: "blob",
    });
    return response.data;
  }


  // Notifications API methods
  async getNotifications(params?: Record<string, unknown>): Promise<Notification[]> {
    const response = await this.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST, params);
    return response.data;
  }

  async getNotificationById(id: string): Promise<Notification> {
    const response = await this.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
    return response.data;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.patch<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {});
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.patch<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {});
  }

  async deleteNotification(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await this.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    // Handle response format: { success: true, data: { count: number } }
    // response.data is already the data from ApiResponse<T>
    if (response.data && typeof response.data === 'object' && 'count' in response.data) {
      return (response.data as { count: number }).count;
    }
    // Fallback: if data is directly the count
    if (typeof response.data === 'number') {
      return response.data;
    }
    // If response.data is undefined or null, try to get count from response itself
    if (response && typeof response === 'object' && 'count' in response) {
      return (response as any).count;
    }
    return 0;
  }

  // Dashboard API methods
  async getDashboardData(): Promise<DashboardData> {
    const response = await this.get<DashboardData>(API_ENDPOINTS.DASHBOARD.DATA);
    return response.data;
  }

  async getProjectStatistics(projectId?: string): Promise<ProjectStatistics> {
    const endpoint = API_ENDPOINTS.DASHBOARD.PROJECT_STATISTICS(projectId);
    const response = await this.get<ProjectStatistics>(endpoint);
    return response.data;
  }

  // Users API methods - Single API call pattern
  async getUsers(params?: Record<string, unknown>): Promise<User[]> {
    const response = await this.get<User[]>(API_ENDPOINTS.USERS.LIST, params);
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  }

  async createUser(input: Partial<User>): Promise<User> {
    const response = await this.post<User>(API_ENDPOINTS.USERS.CREATE, input);
    return response.data;
  }

  async updateUser(id: string, input: Partial<User>): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE(id), input);
    return response.data;
  }

  async updateProfile(input: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.patch<UserProfile>(API_ENDPOINTS.USERS.UPDATE_PROFILE, input);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.post<void>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.USERS.DELETE(id));
  }

  // Sprints API methods - Single API call pattern
  async getSprints(params?: Record<string, unknown>): Promise<Sprint[]> {
    const response = await this.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST, params);
    return response.data;
  }

  async getSprintById(id: string): Promise<Sprint> {
    const response = await this.get<Sprint>(API_ENDPOINTS.SPRINTS.BY_ID(id));
    return response.data;
  }

  async getSprintsByProject(projectId: string): Promise<Sprint[]> {
    const response = await this.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST, { projectId });
    return response.data;
  }

  async getSprintTasks(sprintId: string): Promise<Task[]> {
    const response = await this.get<Task[]>(API_ENDPOINTS.SPRINTS.TASKS(sprintId));
    return response.data;
  }

  // Messages API methods - Message doesn't extend BaseEntity but has id, createdAt, updatedAt
  async getMessages(conversationId: string, params?: Record<string, unknown>): Promise<Message[]> {
    const response = await this.get<Message[]>(
      API_ENDPOINTS.MESSAGES.BY_CONVERSATION(conversationId),
      params
    );
    return response.data;
  }

  async getMessageById(id: string): Promise<Message> {
    const response = await this.get<Message>(API_ENDPOINTS.MESSAGES.BY_ID(id));
    return response.data;
  }

  async createMessage(conversationId: string, input: Omit<Message, "id" | "createdAt" | "updatedAt">): Promise<Message> {
    const response = await this.post<Message>(API_ENDPOINTS.MESSAGES.CREATE(conversationId), input);
    return response.data;
  }

  async updateMessage(id: string, input: Partial<Omit<Message, "id" | "createdAt" | "updatedAt">>): Promise<Message> {
    const response = await this.patch<Message>(API_ENDPOINTS.MESSAGES.UPDATE(id), input);
    return response.data;
  }

  async deleteMessage(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.MESSAGES.DELETE(id));
  }

  async markMessageRead(id: string): Promise<void> {
    await this.patch<void>(API_ENDPOINTS.MESSAGES.MARK_READ(id), {});
  }

  // Conversations API methods - Conversation doesn't extend BaseEntity but has id, createdAt, updatedAt
  async getConversations(params?: Record<string, unknown>): Promise<Conversation[]> {
    const response = await this.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS.LIST, params);
    return response.data;
  }

  async getConversationById(id: string): Promise<Conversation> {
    const response = await this.get<Conversation>(API_ENDPOINTS.CONVERSATIONS.BY_ID(id));
    return response.data;
  }

  async createConversation(input: Omit<Conversation, "id" | "createdAt" | "updatedAt">): Promise<Conversation> {
    const response = await this.post<Conversation>(API_ENDPOINTS.CONVERSATIONS.CREATE, input);
    return response.data;
  }

  async updateConversation(id: string, input: Partial<Omit<Conversation, "id" | "createdAt" | "updatedAt">>): Promise<Conversation> {
    const response = await this.patch<Conversation>(API_ENDPOINTS.CONVERSATIONS.UPDATE(id), input);
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.CONVERSATIONS.DELETE(id));
  }

  async markConversationRead(id: string): Promise<void> {
    await this.patch<void>(API_ENDPOINTS.CONVERSATIONS.MARK_READ(id), {});
  }

  async createSprint(input: Partial<Sprint>): Promise<Sprint> {
    const response = await this.post<Sprint>(API_ENDPOINTS.SPRINTS.CREATE, input);
    return response.data;
  }

  async updateSprint(id: string, input: Partial<Sprint>): Promise<Sprint> {
    const response = await this.patch<Sprint>(API_ENDPOINTS.SPRINTS.UPDATE(id), input);
    return response.data;
  }

  async deleteSprint(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.SPRINTS.DELETE(id));
  }

  // Authentication API methods
  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, input);
    return response.data;
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, input);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.post<void>(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return response.data;
  }

  async getCurrentAuthUser(): Promise<UserProfile> {
    const response = await this.get<UserProfile>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, input);
    return response.data;
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, input);
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    return response.data;
  }

  // Project Team Members API methods
  async getProjectMembers(projectUid: string): Promise<any[]> {
    const response = await this.get<any[]>(API_ENDPOINTS.PROJECTS.MEMBERS(projectUid));
    return response.data;
  }

  async inviteProjectMember(projectUid: string, input: { userId: string; role?: string }): Promise<any> {
    const response = await this.post<any>(API_ENDPOINTS.PROJECTS.INVITE_MEMBER(projectUid), input);
    return response.data;
  }

  async inviteProjectMembers(projectUid: string, input: { userIds: string[]; role?: string }): Promise<any[]> {
    const response = await this.post<any[]>(API_ENDPOINTS.PROJECTS.INVITE_MEMBERS(projectUid), input);
    return response.data;
  }

  async removeProjectMember(projectUid: string, userId: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.PROJECTS.REMOVE_MEMBER(projectUid, userId));
  }

  async updateProjectMemberRole(projectUid: string, userId: string, role: string): Promise<any> {
    const response = await this.patch<any>(API_ENDPOINTS.PROJECTS.UPDATE_MEMBER_ROLE(projectUid, userId), { role });
    return response.data;
  }

  // Team Spaces API methods
  async createTeamSpace(input: { name: string; description?: string; memberIds?: string[]; color?: string; icon?: string }): Promise<any> {
    const response = await this.post<any>(API_ENDPOINTS.SPACES.CREATE, input);
    return response.data;
  }

  async getAllTeamSpaces(): Promise<any[]> {
    const response = await this.get<any[]>(API_ENDPOINTS.SPACES.LIST);
    return response.data;
  }

  async getTeamSpace(id: string): Promise<any> {
    const response = await this.get<any>(API_ENDPOINTS.SPACES.BY_ID(id));
    return response.data;
  }

  async updateTeamSpace(id: string, input: Partial<{ name: string; description?: string; memberIds?: string[]; color?: string; icon?: string; isActive?: boolean }>): Promise<any> {
    const response = await this.patch<any>(API_ENDPOINTS.SPACES.UPDATE(id), input);
    return response.data;
  }

  async deleteTeamSpace(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.SPACES.DELETE(id));
  }

  // Notes API methods
  async getNotes(): Promise<Note[]> {
    const response = await this.get<Note[]>(API_ENDPOINTS.NOTES.LIST);
    return response.data;
  }

  async getNoteById(id: string): Promise<Note> {
    const response = await this.get<Note>(API_ENDPOINTS.NOTES.BY_ID(id));
    return response.data;
  }

  async createNote(input: { content: string; color?: string; rotation?: number }): Promise<Note> {
    const response = await this.post<Note>(API_ENDPOINTS.NOTES.CREATE, input);
    return response.data;
  }

  async updateNote(id: string, input: Partial<{ content: string; color?: string; rotation?: number }>): Promise<Note> {
    const response = await this.patch<Note>(API_ENDPOINTS.NOTES.UPDATE(id), input);
    return response.data;
  }

  async deleteNote(id: string): Promise<void> {
    await this.delete<void>(API_ENDPOINTS.NOTES.DELETE(id));
  }

  // Project Overview API methods
  async getProjectOverview(period?: string): Promise<ProjectOverviewDataPoint[]> {
    const params = period ? { period } : {};
    try {
      // Backend controller returns { success: true, data: [...] }
      // Use client.get directly to get the raw axios response
      const axiosResponse = await this.client.get<{ success: boolean; data: ProjectOverviewDataPoint[] }>(
        API_ENDPOINTS.DASHBOARD.PROJECT_OVERVIEW,
        { params }
      );
      console.log('[ProjectOverview API] Axios response:', axiosResponse);
      console.log('[ProjectOverview API] Response data:', axiosResponse.data);
      
      // Extract the nested data array
      const backendResponse = axiosResponse.data as { success: boolean; data: ProjectOverviewDataPoint[] };
      const result = backendResponse?.data || [];
      console.log('[ProjectOverview API] Extracted data array:', result, 'Length:', result.length);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('[ProjectOverview API] Error:', error);
      return [];
    }
  }
}

export const api = new ApiService();
