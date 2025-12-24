"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectMembersApi } from "@/core/services/api-helpers";

const PROJECT_MEMBERS_QUERY_KEY = (projectUid: string) => ["project-members", projectUid];

export function useProjectMembers(projectUid: string) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: PROJECT_MEMBERS_QUERY_KEY(projectUid),
    queryFn: () => projectMembersApi.getMembers(projectUid),
    enabled: !!projectUid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (input: { userId: string; role?: string }) =>
      projectMembersApi.inviteMember(projectUid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_MEMBERS_QUERY_KEY(projectUid) });
    },
  });

  const inviteMembersMutation = useMutation({
    mutationFn: (input: { userIds: string[]; role?: string }) =>
      projectMembersApi.inviteMembers(projectUid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_MEMBERS_QUERY_KEY(projectUid) });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectMembersApi.removeMember(projectUid, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_MEMBERS_QUERY_KEY(projectUid) });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      projectMembersApi.updateMemberRole(projectUid, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_MEMBERS_QUERY_KEY(projectUid) });
    },
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    inviteMember: inviteMemberMutation.mutateAsync,
    inviteMembers: inviteMembersMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    updateMemberRole: updateRoleMutation.mutateAsync,
    isInviting: inviteMemberMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}

