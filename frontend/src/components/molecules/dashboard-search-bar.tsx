"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/atoms/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInDown, transitions } from "@/lib/motion";

export interface DashboardSearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  delay?: number;
}

export function DashboardSearchBar({
  placeholder = "Search something...",
  value,
  onChange,
  className,
  delay = 0,
}: DashboardSearchBarProps) {
  return (
    <motion.div
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
      className={cn("w-full", className)}
    >
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-12 pr-12 rounded-xl border-border bg-card"
        />
      </div>
    </motion.div>
  );
}


