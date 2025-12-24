"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Plus, MoreHorizontal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem, transitions } from "@/lib/motion";
import { formatDistanceToNow } from "date-fns";

export interface MeetingNote {
  id: string;
  topic: string;
  projectName: string;
  createdAt: Date;
  projectColor?: string;
}

export interface MeetingNotesCardProps {
  notes: MeetingNote[];
  onAdd?: () => void;
  onNoteClick?: (noteId: string) => void;
  className?: string;
  delay?: number;
}

export function MeetingNotesCard({
  notes,
  onAdd,
  onNoteClick,
  className,
  delay = 0,
}: MeetingNotesCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">Meeting Notes</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAdd}
            className="h-8 w-8 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {notes.slice(0, 3).map((note, index) => (
              <motion.div
                key={note.id}
                variants={staggerItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNoteClick?.(note.id)}
                className="p-3 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(note.createdAt, { addSuffix: true })}</span>
                    </div>
                    <h4 className="font-semibold text-sm">{note.topic}</h4>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          note.projectColor || "bg-emerald-500"
                        )}
                      />
                      <span className="text-xs text-muted-foreground">{note.projectName}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


