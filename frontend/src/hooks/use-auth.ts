"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/core/services/api-helpers";
import { websocketService } from "@/core/services/websocket";
import type { LoginInput, RegisterInput, AuthResponse, UserProfile, ForgotPasswordInput, ResetPasswordInput } from "@/interfaces";
import { useRouter } from "next/navigation";

const CURRENT_AUTH_USER_QUERY_KEY = ["auth", "me"];

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data: AuthResponse) => {
      // Store tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken);
        }
      }
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: CURRENT_AUTH_USER_QUERY_KEY });
      router.push("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (data: AuthResponse) => {
      // Store tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken);
        }
      }
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: CURRENT_AUTH_USER_QUERY_KEY });
      router.push("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Disconnect WebSocket
      websocketService.disconnect();
      // Clear tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
      // Clear all queries
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
      // Disconnect WebSocket even on error
      websocketService.disconnect();
      // Even if logout fails on backend, clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
      queryClient.clear();
      router.push("/login");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.forgotPassword(input),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (input: ResetPasswordInput) => authApi.resetPassword(input),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}

export function useCurrentAuthUser() {
  const queryClient = useQueryClient();

  // Only enable query if we have a token (to avoid unnecessary 404s)
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("auth_token");

  const userQuery = useQuery({
    queryKey: CURRENT_AUTH_USER_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser();
      } catch (error: any) {
        // Silently handle errors for auth/me endpoint
        if (error?.name === "SilentError" || error?.silent || error?.message?.includes("Backend not available")) {
          // Clear token if backend is not available
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
          }
          return undefined;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if unauthorized
    enabled: typeof window !== "undefined" && hasToken, // Only run on client side and if token exists
    // Don't throw on error - just return undefined
    throwOnError: false,
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error && (userQuery.error as any)?.name !== "SilentError" ? userQuery.error : undefined,
    isAuthenticated: !!userQuery.data,
    refetch: () => queryClient.invalidateQueries({ queryKey: CURRENT_AUTH_USER_QUERY_KEY }),
  };
}



