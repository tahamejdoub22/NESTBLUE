import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  color?: "primary" | "secondary" | "muted" | "destructive" | "success";
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
};

const colorMap = {
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  destructive: "text-destructive",
  success: "text-emerald-600",
};

export function Icon({ 
  icon: IconComponent, 
  size = "md", 
  className,
  color,
  ...props
}: IconProps & React.ComponentPropsWithoutRef<LucideIcon>) {
  return (
    <IconComponent 
      className={cn(
        sizeMap[size], 
        color && colorMap[color],
        className
      )} 
      {...props}
    />
  );
}