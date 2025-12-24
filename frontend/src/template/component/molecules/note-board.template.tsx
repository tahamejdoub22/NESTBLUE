import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import { Plus, StickyNote, X } from "lucide-react";
import { Note } from "@/interfaces/note.interface";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

const noteColors = {
  yellow: "bg-primary/20 dark:bg-primary/10 border-primary/30 dark:border-primary/20",
  blue: "bg-primary/25 dark:bg-primary/15 border-primary/35 dark:border-primary/25",
  green: "bg-primary/30 dark:bg-primary/20 border-primary/40 dark:border-primary/30",
  pink: "bg-primary/15 dark:bg-primary/8 border-primary/25 dark:border-primary/15",
};

export interface NoteBoardTemplateProps {
  notes: Note[];
  maxNotes?: number;
  className?: string;
  onAddNote?: () => void;
  onDeleteNote?: (id: string) => void;
  onNoteChange?: (id: string, content: string) => void;
}

export function renderNoteBoard(props: NoteBoardTemplateProps) {
  const {
    notes,
    maxNotes = 6,
    className,
    onAddNote,
    onDeleteNote,
    onNoteChange,
  } = props;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className={cn(
        "relative overflow-visible border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="relative z-10 pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <StickyNote className="h-4 w-4" />
              </div>
              Note Board
            </CardTitle>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddNote}
                className="h-7 w-7 p-0 hover:bg-primary/10"
                disabled={notes.length >= maxNotes}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-0 px-4 pb-4">
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm"
            >
              <StickyNote className="h-10 w-10 mb-3 text-muted-foreground/50" />
              <p className="mb-2">No notes yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddNote}
                className="text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first note
              </Button>
            </motion.div>
          ) : (
            <div className="relative min-h-[200px] p-1.5">
              {/* Board background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-dashed border-border/30" />
              
              {/* Sticky Notes */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="relative grid grid-cols-2 gap-1"
              >
                {notes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, rotate: note.rotation ? note.rotation + 2 : 2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={cn(
                      "group/note relative p-3 rounded-sm border-2 shadow-md",
                      "cursor-pointer",
                      noteColors[note.color || "yellow"]
                    )}
                    style={{
                      transform: `rotate(${note.rotation || 0}deg)`,
                      transformOrigin: "center",
                    }}
                  >
                    <textarea
                      value={note.content || ""}
                      onChange={(e) => {
                        const newContent = e.target.value;
                        onNoteChange?.(note.id, newContent);
                      }}
                      onBlur={(e) => {
                        // Ensure content is saved on blur
                        onNoteChange?.(note.id, e.target.value);
                      }}
                      onFocus={(e) => {
                        // Prevent scroll when focusing
                        e.target.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                      }}
                      placeholder="Write a note..."
                      className={cn(
                        "w-full bg-transparent border-none outline-none resize-none",
                        "text-xs font-medium text-foreground placeholder:text-foreground/50",
                        "focus:ring-0 focus-visible:ring-0",
                        "min-h-[60px]"
                      )}
                      rows={3}
                      autoFocus={false}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote?.(note.id);
                      }}
                      className={cn(
                        "absolute -top-2 -right-2 p-1 rounded-full opacity-0 group-hover/note:opacity-100",
                        "bg-destructive text-destructive-foreground shadow-md",
                        "hover:bg-destructive/90 transition-opacity",
                        "h-5 w-5 flex items-center justify-center z-10"
                      )}
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
              
              {notes.length < maxNotes && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: notes.length * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddNote}
                    className="w-full mt-1 text-primary hover:bg-primary/10 border border-dashed border-primary/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}



