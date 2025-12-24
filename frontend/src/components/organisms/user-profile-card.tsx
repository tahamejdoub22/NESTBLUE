"use client";

import { Mail, Phone, MapPin, Calendar, Edit, Icon } from "lucide-react";
import { Avatar, Badge,Text, Button } from "../atoms";
import { cn } from "@/lib/utils";

interface UserProfileCardProps {
  user: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    joinDate: string;
    role: string;
    avatarSrc?: string;
    status: "active" | "inactive" | "away";
  };
  onEdit?: () => void;
  onMessage?: () => void;
}

export function UserProfileCard({ user, onEdit, onMessage }: UserProfileCardProps) {
  const statusColors = {
    active: "bg-emerald-500",
    inactive: "bg-gray-400",
    away: "bg-amber-500",
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar
              src={user.avatarSrc}
              fallback={user.name}
              size="xl"
              status="online"
            />
            <div
              className={cn(
                "absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-background",
                statusColors[user.status]
              )}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Text variant="h4" weight="semibold">
                {user.name}
              </Text>
              <Badge variant={user.role === "Admin" ? "destructive" : "secondary"}>
                {user.role}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size="sm" className="text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size="sm" className="text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size="sm" className="text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size="sm" className="text-muted-foreground" />
                <span>Joined {user.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Edit size="sm" />
            Edit
          </Button>
          <Button size="sm" onClick={onMessage}>
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}