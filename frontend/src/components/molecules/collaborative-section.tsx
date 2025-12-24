"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Plus, Search, Filter, LayoutGrid, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface Meeting {
  id: string;
  title: string;
  participant: TeamMember;
  type: "zoom" | "meet" | "teams";
}

export interface CollaborativeSectionProps {
  teamMembers: TeamMember[];
  meeting?: Meeting;
  onAddMember?: () => void;
  onAddTask?: () => void;
  onJoinMeeting?: (meetingId: string) => void;
  className?: string;
  delay?: number;
}

export function CollaborativeSection({
  teamMembers,
  meeting,
  onAddMember,
  onAddTask,
  onJoinMeeting,
  className,
  delay = 0,
}: CollaborativeSectionProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
      className={cn("space-y-4", className)}
    >
      {/* Team Members */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {teamMembers.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddMember}
                className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </motion.button>
              <span className="text-sm text-muted-foreground ml-2">New member</span>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anything"
                className="pl-9 h-9"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button onClick={onAddTask} className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Add new task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Card */}
      {meeting && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={meeting.participant.avatar} alt={meeting.participant.name} />
                  <AvatarFallback>{meeting.participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{meeting.title}</h4>
                  <p className="text-xs text-muted-foreground">{meeting.participant.name}</p>
                </div>
              </div>
              <Button
                onClick={() => onJoinMeeting?.(meeting.id)}
                className="gap-2"
                size="sm"
              >
                <Video className="h-4 w-4" />
                Zoom Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}


