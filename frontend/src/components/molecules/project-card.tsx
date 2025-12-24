"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { AvatarGroup } from "@/components/atoms/avatar-group";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";

export interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export function ProjectCard({
  title,
  description,
  progress,
  teamMembers,
  icon,
  iconColor,
  className,
  delay = 0,
  onClick,
}: ProjectCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
      className={cn("h-full", className)}
    >
      <Card
        className={cn("h-full cursor-pointer hover:shadow-md transition-shadow", className)}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            </div>
            {icon && (
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                  iconColor || "bg-primary/10 text-primary"
                )}
              >
                {icon}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <AvatarGroup max={3} className="flex-shrink-0">
              {teamMembers.map((member) => (
                <Avatar key={member.id} className="h-8 w-8">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            {teamMembers.length > 3 && (
              <span className="text-xs text-muted-foreground ml-2">+{teamMembers.length - 3}</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


