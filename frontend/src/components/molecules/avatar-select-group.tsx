// src/components/molecules/avatar-select-group.tsx - Fixed Version without "No users found"
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarProps } from "@/components/atoms/avatar";
import { AvatarGroup } from "@/components/atoms/avatar-group";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Check, ChevronDown, Search, UserPlus, Users, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  status?: "online" | "offline" | "away" | "busy";
}

interface AvatarSelectGroupProps {
  users: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  maxDisplay?: number;
  size?: AvatarProps["size"];
  placeholder?: string;
  allowMultiple?: boolean;
  className?: string;
}

export function AvatarSelectGroup({
  users = [],
  selectedUserIds = [],
  onSelectionChange,
  maxDisplay = 3,
  size = "sm",
  placeholder = "Select assignees",
  allowMultiple = true,
  className
}: AvatarSelectGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position - always open to bottom
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 280; // Fixed width for the dropdown

    setMenuStyles({
      position: 'fixed',
      left: rect.left,
      top: rect.bottom + 4,
      width: menuWidth,
      zIndex: 9999,
    });
  }, []);

  // Update position when opening
  useEffect(() => {
    if (isOpen) {
      updateMenuPosition();
      window.addEventListener('scroll', updateMenuPosition, true);
      window.addEventListener('resize', updateMenuPosition);
      return () => {
        window.removeEventListener('scroll', updateMenuPosition, true);
        window.removeEventListener('resize', updateMenuPosition);
      };
    }
  }, [isOpen, updateMenuPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected users
  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    let newSelection: string[];
    
    if (allowMultiple) {
      if (selectedUserIds.includes(userId)) {
        // Remove if already selected
        newSelection = selectedUserIds.filter(id => id !== userId);
      } else {
        // Add if not selected
        newSelection = [...selectedUserIds, userId];
      }
    } else {
      // Single selection mode
      newSelection = selectedUserIds.includes(userId) ? [] : [userId];
    }
    
    onSelectionChange(newSelection);
    if (!allowMultiple) {
      setIsOpen(false);
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // Remove a specific user
  const handleRemoveUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = selectedUserIds.filter(id => id !== userId);
    onSelectionChange(newSelection);
  };

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent scroll jump when opening dropdown
    if (!isOpen) {
      // Save current scroll position before opening
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      setIsOpen(true);
      setSearchQuery("");

      // Restore scroll position after state update
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    } else {
      setIsOpen(false);
    }
  };

  // Get status color
  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "offline": return "bg-gray-400";
      case "away": return "bg-amber-500";
      case "busy": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className={cn("relative inline-flex", className)} ref={triggerRef}>
      {/* Trigger Button - Shows Avatars or Plus Icon */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className={cn(
          "px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          size === "xs" ? "h-7" : "h-9",
          "w-auto min-w-0",
          selectedUsers.length === 0 ? "text-gray-500" : ""
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {selectedUsers.length > 0 ? (
            <AvatarGroup size={size} max={maxDisplay}>
              {selectedUsers.map(user => (
                <Avatar
                  key={user.id}
                  src={user.avatarUrl}
                  fallback={user.name.charAt(0)}
                  size={size}
                  status={user.status}
                  shape="circle"
                  className="shadow-sm"
                />
              ))}
            </AvatarGroup>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <User className={size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4"} />
              <span className={cn("font-medium", size === "xs" ? "text-[10px]" : "text-xs")}>
                Assign
              </span>
            </div>
          )}
          <ChevronDown className={cn(
            "text-muted-foreground/40 transition-transform flex-shrink-0",
            size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5",
            isOpen ? "rotate-180" : ""
          )} />
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <Card
          ref={menuRef}
          className="w-64 max-h-96 overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg"
          style={menuStyles}
        >
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-gray-400" />
                <Text variant="body" weight="medium">
                  {allowMultiple ? "Assignees" : "Assignee"}
                </Text>
              </div>
              {selectedUserIds.length > 0 && allowMultiple && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
                autoFocus
                onFocus={(e) => {
                  // Prevent scroll jump when input gets focused
                  e.preventDefault();
                }}
              />
            </div>
          </div>

          {/* Users List */}
          <div className="overflow-y-auto max-h-60">
            {filteredUsers.length > 0 ? (
              <div className="p-2">
                {filteredUsers.map(user => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user.id)}
                      className={cn(
                        "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left",
                        isSelected && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      {/* Avatar with status */}
                      <div className="relative">
                        <Avatar
                          src={user.avatarUrl}
                          fallback={user.name}
                          size="sm"
                          shape="circle"
                        />
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900",
                          getStatusColor(user.status)
                        )} />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Text variant="body" weight="medium" className="truncate">
                            {user.name}
                          </Text>
                          {isSelected && (
                            <Check className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        <Text variant="caption" color="muted" className="truncate">
                          {user.email}
                        </Text>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Only show empty state if there are users but none match the search
              users.length > 0 && (
                <div className="p-6 text-center">
                    <Users className="h-8 w-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                    <Text variant="body" color="muted">No matching users</Text>
                  </div>
              )
            )}
          </div>

          {/* Selected Users Count */}
          {selectedUsers.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-3">
              <Text variant="body" weight="medium" className="mb-2">
                Selected ({selectedUsers.length})
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      fallback={user.name.charAt(0)}
                      size="xs"
                      shape="circle"
                      className="h-4 w-4"
                    />
                    <Text variant="caption" className="max-w-20 truncate">
                      {user.name}
                    </Text>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveUser(user.id, e)}
                      className="h-3 w-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center ml-1"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 p-3">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </Card>,
        document.body
      )}
    </div>
  );
}