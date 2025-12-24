"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Check, Search, UserPlus, X, Crown, Shield, Eye, Users } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { useCurrentAuthUser } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { User } from "@/interfaces";

interface InviteTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectUid: string;
  projectOwnerId?: string;
  existingMembers?: Array<{
    userId: string;
    user?: User;
    role?: string;
  }>;
  existingMemberIds?: string[];
  onInvite: (input: { userIds: string[]; role?: string }) => Promise<void>;
  isLoading?: boolean;
}

const roleConfig = {
  owner: { label: "Owner", icon: Crown, color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  admin: { label: "Admin", icon: Shield, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  member: { label: "Member", icon: Users, color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
  viewer: { label: "Viewer", icon: Eye, color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20" },
};

export function InviteTeamModal({
  open,
  onOpenChange,
  projectUid,
  projectOwnerId,
  existingMembers = [],
  existingMemberIds = [],
  onInvite,
  isLoading = false,
}: InviteTeamModalProps) {
  const { users, isLoading: usersLoading } = useUsers();
  const { user: currentUser } = useCurrentAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [role, setRole] = useState<string>("member");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedUserIds([]);
      setRole("member");
    }
  }, [open]);

  // Get all existing member IDs including owner
  const allExistingMemberIds = useMemo(() => {
    const memberIds = existingMemberIds || [];
    if (projectOwnerId && !memberIds.includes(projectOwnerId)) {
      return [...memberIds, projectOwnerId];
    }
    return memberIds;
  }, [existingMemberIds, projectOwnerId]);

  // Filter out existing members and search
  const availableUsers = useMemo(() => {
    return users.filter(
      (user) =>
        !allExistingMemberIds.includes(user.id) &&
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, allExistingMemberIds, searchQuery]);

  // Get project owner user object
  const projectOwner = useMemo(() => {
    if (!projectOwnerId) return null;
    return users.find((u) => u.id === projectOwnerId) || null;
  }, [users, projectOwnerId]);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInvite = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user to invite");
      return;
    }

    try {
      await onInvite({ 
        userIds: selectedUserIds, 
        role: role && role.trim() ? role.trim() : undefined 
      });
      toast.success(`Successfully invited ${selectedUserIds.length} member(s)`);
      setSelectedUserIds([]);
      setSearchQuery("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to invite members");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (roleName?: string) => {
    const roleKey = (roleName || "member").toLowerCase() as keyof typeof roleConfig;
    const config = roleConfig[roleKey] || roleConfig.member;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} text-xs font-medium px-2 py-0.5 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            Invite Team Members
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Add new members to your project team and manage their access levels
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6 px-6 py-4">
          {/* Existing Team Members Section */}
          {(projectOwner || existingMembers.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">Current Team</Label>
                <Badge variant="outline" className="text-xs">
                  {existingMembers.length + (projectOwner ? 1 : 0)} member(s)
                </Badge>
              </div>
              <div className="border rounded-lg p-3 bg-muted/30 space-y-2 max-h-32 overflow-y-auto">
                {/* Project Owner */}
                {projectOwner && (
                  <div className="flex items-center gap-3 p-2 rounded-md bg-background/50 border border-primary/20">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarImage src={projectOwner.avatar} alt={projectOwner.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(projectOwner.name || projectOwner.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {projectOwner.name || "Unknown"}
                        </span>
                        {projectOwner.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">You</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {projectOwner.email}
                      </div>
                    </div>
                    {getRoleBadge("owner")}
                  </div>
                )}
                {/* Existing Members */}
                {existingMembers.map((member) => {
                  const user = member.user;
                  if (!user) return null;
                  return (
                    <div key={member.userId} className="flex items-center gap-3 p-2 rounded-md bg-background/50">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name || user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {user.name || "Unknown"}
                          </span>
                          {user.id === currentUser?.id && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">You</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                      {getRoleBadge(member.role)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold">
              Default Role for New Members
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="h-11">
                <SelectValue placeholder="Select default role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Member - Can view and edit project content</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin - Can manage team and settings</span>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Viewer - Read-only access</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Selected Count */}
          {selectedUserIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {selectedUserIds.length}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUserIds([])}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* User List */}
          <div className="flex-1 overflow-y-auto border rounded-lg bg-background">
            {usersLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Loading users...</p>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {searchQuery ? "No users found" : "All users are already members"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Everyone in your workspace is already part of this project"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {availableUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleToggleUser(user.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "bg-primary/10 border-2 border-primary shadow-sm"
                          : "hover:bg-muted/50 border-2 border-transparent hover:border-muted"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-11 w-11 ring-2 ring-offset-2 ring-offset-background" style={{
                          ringColor: isSelected ? "rgb(var(--primary))" : "transparent"
                        }}>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-muted text-foreground font-medium">
                            {getInitials(user.name || user.email || "U")}
                          </AvatarFallback>
                        </Avatar>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-sm animate-in zoom-in-50 duration-200">
                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm truncate">
                            {user.name || "Unknown User"}
                          </span>
                          {user.id === currentUser?.id && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">You</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          {getRoleBadge(role)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20">
          <div className="text-sm text-muted-foreground">
            {selectedUserIds.length > 0 && (
              <span>
                {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} will be invited as <span className="font-medium capitalize">{role}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={selectedUserIds.length === 0 || isLoading}
              className="px-6 min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Inviting...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite {selectedUserIds.length > 0 ? `${selectedUserIds.length} ` : ""}Member{selectedUserIds.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

