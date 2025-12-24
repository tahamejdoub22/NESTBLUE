import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Plus, FolderKanban, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";

export interface QuickActionsTemplateProps {
  onCreateTask?: () => void;
  onCreateProject?: () => void;
  onInviteMember?: () => void;
  className?: string;
}

export function renderQuickActions(props: QuickActionsTemplateProps) {
  const { onCreateTask, onCreateProject, onInviteMember, className } = props;

  const actions = [
    {
      label: "Create Task",
      description: "Add a new task to your project",
      icon: Plus,
      onClick: onCreateTask,
      variant: "primary" as const,
    },
    {
      label: "Create Project",
      description: "Start a new project",
      icon: FolderKanban,
      onClick: onCreateProject,
      variant: "outline" as const,
    },
    {
      label: "Invite Member",
      description: "Add team members",
      icon: UserPlus,
      onClick: onInviteMember,
      variant: "outline" as const,
    },
  ];

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  variants={staggerItem}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    variant={action.variant}
                    className={cn(
                      "h-auto flex-col gap-3 py-6 px-6 rounded-xl w-full",
                      "transition-all duration-300",
                      "group relative overflow-hidden",
                      action.variant === "primary"
                        ? "bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20"
                        : "hover:bg-primary/5 hover:border-primary/20"
                    )}
                    onClick={action.onClick}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <div className="text-center">
                      <div className="font-semibold">{action.label}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



