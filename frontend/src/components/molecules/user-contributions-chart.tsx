"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Avatar } from "@/components/atoms/avatar";
import { UserContribution } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem, progressBar } from "@/lib/motion";

export interface UserContributionsChartProps {
  contributions: UserContribution[];
  className?: string;
  maxItems?: number;
}

export function UserContributionsChart({
  contributions,
  className,
  maxItems = 5,
}: UserContributionsChartProps) {
  const displayContributions = [...contributions]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, maxItems);

  if (displayContributions.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-base font-semibold">User Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No contributions available
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const maxPoints = Math.max(
    ...displayContributions.map((c) => c.totalPoints)
  );

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2.5">
          <CardTitle className="text-base font-semibold">User Contributions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {displayContributions.map((contribution, index) => {
              const percentage = (contribution.totalPoints / maxPoints) * 100;

              return (
                <motion.div
                  key={contribution.userId}
                  variants={staggerItem}
                  whileHover={{ x: 4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="space-y-1.5 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Avatar
                        fallback={contribution.userName}
                        src={contribution.userAvatar}
                        size="sm"
                        className="flex-shrink-0 mt-0.5"
                      />
                    </motion.div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate leading-tight">
                          {contribution.userName}
                        </p>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {contribution.totalPoints}
                          </p>
                          <p className="text-xs text-muted-foreground leading-tight whitespace-nowrap">points</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground leading-tight flex-wrap">
                        <span className="whitespace-nowrap">{contribution.tasksCompleted} completed</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="whitespace-nowrap">{contribution.tasksCreated} created</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="whitespace-nowrap">{contribution.commentsAdded} comments</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      custom={percentage}
                      variants={progressBar}
                      initial="hidden"
                      animate="visible"
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

