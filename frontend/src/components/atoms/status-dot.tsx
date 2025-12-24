import { cn } from "@/lib/utils";

type Status = "success" | "warning" | "error" | "info" | "default";

interface StatusDotProps {
  status?: Status;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusColors: Record<Status, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  default: "bg-gray-400",
};

const sizeMap = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export function StatusDot({
  status = "default",
  pulse = false,
  size = "md",
  className,
}: StatusDotProps) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <span
        className={cn(
          "rounded-full",
          sizeMap[size],
          statusColors[status],
          pulse && "animate-pulse"
        )}
      />
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            statusColors[status]
          )}
        />
      )}
    </span>
  );
}
