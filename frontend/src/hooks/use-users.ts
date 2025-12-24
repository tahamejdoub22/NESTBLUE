"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/core/services/api-helpers";
import type { User, UserProfile } from "@/interfaces";

const USERS_QUERY_KEY = ["users"];
const CURRENT_USER_QUERY_KEY = ["users", "me"];
const CURRENT_AUTH_USER_QUERY_KEY = ["auth", "me"];

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => userApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: Partial<User>) => userApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useUser(id: string) {
  const queryClient = useQueryClient();
  const USER_QUERY_KEY = ["users", id];

  const userQuery = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => userApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => userApi.getCurrent(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_AUTH_USER_QUERY_KEY });
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}



