"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Card } from "@/components/atoms/card";
import {
  Check,
  Search,
  MessageSquare,
  Hash,
  Users,
  UserPlus,
  Sparkles,
  X,
} from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { useTeamSpaces } from "@/hooks/use-team-spaces";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { User } from "@/interfaces";

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectUid?: string;
  onCreate: (data: {
    name: string;
    type: "direct" | "group";
    participantIds: string[];
    projectUid?: string;
    spaceId?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function NewConversationModal({
  open,
  onOpenChange,
  projectUid,
  onCreate,
  isLoading = false,
}: NewConversationModalProps) {
  const { users, isLoading: usersLoading } = useUsers();
  const { spaces, isLoading: spacesLoading } = useTeamSpaces(projectUid || "");
  const [conversationName, setConversationName] = useState("");
  const [conversationType, setConversationType] = useState<"direct" | "group">("group");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setConversationName("");
      setConversationType("group");
      setSelectedSpaceId("");
      setSearchQuery("");
      setSelectedUserIds([]);
    }
  }, [open]);

  // Filter users by search
  const availableUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (conversationType === "direct" && selectedUserIds.length !== 1) {
      toast.error("Direct conversations must have exactly one participant");
      return;
    }

    if (conversationType === "group" && !conversationName.trim()) {
      toast.error("Group conversations must have a name");
      return;
    }

    if (conversationType === "group" && selectedUserIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    try {
      await onCreate({
        name:
          conversationName ||
          `Chat with ${users.find((u) => u.id === selectedUserIds[0])?.name || "User"}`,
        type: conversationType,
        participantIds: selectedUserIds,
        projectUid: projectUid || undefined,
        spaceId: selectedSpaceId || undefined,
      });
      toast.success("🎉 Conversation created successfully!");
      setConversationName("");
      setSelectedUserIds([]);
      setSelectedSpaceId("");
      setSearchQuery("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create conversation");
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

  const isFormValid =
    (conversationType === "direct" && selectedUserIds.length === 1) ||
    (conversationType === "group" &&
      conversationName.trim().length > 0 &&
      selectedUserIds.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with gradient background */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-sm">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Create New Conversation
              </DialogTitle>
              <DialogDescription className="text-sm mt-1.5 text-muted-foreground">
                Start a direct message or create a group chat with your team
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Conversation Type */}
          <div className="space-y-2.5">
            <Label
              htmlFor="type"
              className="text-sm font-semibold text-foreground flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-primary" />
              Conversation Type
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={conversationType}
              onValueChange={(value) => {
                setConversationType(value as "direct" | "group");
                if (value === "direct") {
                  setConversationName("");
                  if (selectedUserIds.length > 1) {
                    setSelectedUserIds([selectedUserIds[0]]);
                  }
                }
              }}
            >
              <SelectTrigger id="type" className="h-11 border-2 focus:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Direct Message
                  </div>
                </SelectItem>
                <SelectItem value="group">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Group Chat
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {conversationType === "direct"
                ? "One-on-one private conversation"
                : "Chat with multiple team members"}
            </p>
          </div>

          {/* Space Selection (if projectUid is provided) */}
          {projectUid && spaces.length > 0 && (
            <div className="space-y-2.5">
              <Label
                htmlFor="space"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-muted-foreground" />
                Team Space
                <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
                <SelectTrigger id="space" className="h-11 border-2 focus:border-primary/50">
                  <SelectValue placeholder="Select a space (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No space</SelectItem>
                  {spaces.map((space: any) => (
                    <SelectItem key={space.id} value={space.id}>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        {space.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Group Name */}
          {conversationType === "group" && (
            <div className="space-y-2.5">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-primary" />
                Conversation Name
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="e.g., Design Team, Project Alpha, Marketing Squad..."
                  value={conversationName}
                  onChange={(e) => setConversationName(e.target.value)}
                  className="h-11 pl-4 pr-4 text-base border-2 focus:border-primary/50 transition-colors"
                  autoFocus
                />
                {conversationName.trim().length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Choose a clear name that helps team members identify this conversation
              </p>
            </div>
          )}

          {/* Search */}
          <div className="space-y-2.5">
            <Label
              htmlFor="search"
              className="text-sm font-semibold text-foreground flex items-center gap-2"
            >
              <Search className="h-4 w-4 text-primary" />
              Add Participants
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 pr-4 text-base border-2 focus:border-primary/50 transition-colors"
              />
            </div>
            {selectedUserIds.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {selectedUserIds.length} participant{selectedUserIds.length !== 1 ? "s" : ""}{" "}
                  selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUserIds([])}
                  className="h-7 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Selected Users Pills */}
          {selectedUserIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUserIds.map((userId) => {
                const user = users.find((u) => u.id === userId);
                if (!user) return null;
                return (
                  <Badge
                    key={userId}
                    variant="secondary"
                    className="gap-1.5 px-2.5 py-1.5 pr-1.5"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(user.name || user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{user.name || "Unknown"}</span>
                    <button
                      onClick={() => handleToggleUser(userId)}
                      className="ml-0.5 hover:bg-muted rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* User List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">Available Users</Label>
              {availableUsers.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {availableUsers.length} user{availableUsers.length !== 1 ? "s" : ""} found
                </span>
              )}
            </div>
            <Card className="border-2">
              <div className="max-h-[280px] overflow-y-auto p-2 space-y-1.5">
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="inline-block h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm">Loading users...</p>
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No users found matching your search" : "No users available"}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {availableUsers.map((user, index) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.02 }}
                          type="button"
                          onClick={() => handleToggleUser(user.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                            "hover:bg-accent/50 active:scale-[0.98]",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                            isSelected
                              ? "bg-primary/10 border-2 border-primary/30 shadow-sm"
                              : "border-2 border-transparent hover:border-border/40"
                          )}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(user.name || user.email || "U")}
                              </AvatarFallback>
                            </Avatar>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-md"
                              >
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {user.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </Card>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-muted/50 border border-muted p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {conversationType === "direct"
                    ? "What are direct messages?"
                    : "What can you do with group chats?"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {conversationType === "direct" ? (
                    <>
                      <li>Private one-on-one conversations</li>
                      <li>Perfect for personal discussions</li>
                      <li>Only visible to you and the other participant</li>
                    </>
                  ) : (
                    <>
                      <li>Collaborate with multiple team members</li>
                      <li>Share updates and announcements</li>
                      <li>Organize project discussions</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {isFormValid ? (
              <span className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Ready to create
              </span>
            ) : conversationType === "direct" ? (
              "Select one participant to continue"
            ) : (
              "Enter a name and select participants to continue"
            )}
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!isFormValid || isLoading}
              className="px-6 min-w-[160px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Conversation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

