import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  animation?: "pulse" | "shimmer" | "none";
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = "text",
  animation = "shimmer",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "skeleton",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-muted",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

// Pre-built skeleton components for common use cases
function SkeletonText({
  lines = 3,
  className,
  ...props
}: { lines?: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({
  size = "md",
  className,
  ...props
}: { size?: "xs" | "sm" | "md" | "lg" | "xl" } & HTMLAttributes<HTMLDivElement>) {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}

function SkeletonButton({
  size = "md",
  className,
  ...props
}: { size?: "sm" | "md" | "lg" } & HTMLAttributes<HTMLDivElement>) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton
      variant="rounded"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}

function SkeletonCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 space-y-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: { rows?: number; columns?: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "w-8 flex-none"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonTaskRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border bg-card",
        className
      )}
      {...props}
    >
      <Skeleton className="h-4 w-4" variant="rectangular" />
      <Skeleton className="h-6 w-6" variant="rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <SkeletonAvatar size="sm" />
      <Skeleton className="h-6 w-20" variant="rounded" />
      <Skeleton className="h-6 w-16" variant="rounded" />
      <Skeleton className="h-8 w-8" variant="circular" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonTaskRow,
};
