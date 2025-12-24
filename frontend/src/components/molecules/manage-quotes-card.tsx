"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { ArrowUpRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleIn, transitions } from "@/lib/motion";

export interface ManageQuotesCardProps {
  title?: string;
  value: number;
  description?: string;
  onCreateNew?: () => void;
  className?: string;
  delay?: number;
}

export function ManageQuotesCard({
  title = "Manage Quotes",
  value,
  description = "Average in a month",
  onCreateNew,
  className,
  delay = 0,
}: ManageQuotesCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.smooth, delay }}
      className={cn("h-full", className)}
    >
      <Card className="h-full bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0 shadow-lg">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <h3 className="text-2xl font-bold">{title}</h3>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center cursor-pointer"
            >
              <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onCreateNew}
              variant="secondary"
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>

            <div className="space-y-1">
              <p className="text-5xl font-bold">{value}</p>
              <p className="text-sm text-primary-foreground/80">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


