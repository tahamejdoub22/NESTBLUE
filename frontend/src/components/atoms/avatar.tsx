"use client";

import { cn } from "@/lib/utils";
import { forwardRef, createContext, useContext } from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  className?: string;
  status?: "online" | "offline" | "away" | "busy";
  children?: React.ReactNode;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const statusColors = {
  online: "bg-success",
  offline: "bg-muted-foreground/30",
  away: "bg-warning",
  busy: "bg-destructive",
};

interface AvatarContextType {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
}

const AvatarContext = createContext<AvatarContextType>({});

// Compound component version
export function Avatar({ 
  src, 
  alt, 
  fallback, 
  size = "md", 
  shape = "circle",
  className,
  status,
  children
}: AvatarProps) {
  // If using compound components (children), render differently
  if (children) {
    return (
      <AvatarContext.Provider value={{ size, shape }}>
        <div className={cn("relative inline-block", className)}>
          <div 
            className={cn(
              "flex items-center justify-center overflow-hidden bg-primary/5 text-primary font-bold tracking-tight shadow-inner",
              sizeMap[size],
              shape === "circle" ? "rounded-full" : "rounded-xl"
            )}
          >
            {children}
          </div>
          {status && (
            <span
              className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background shadow-sm",
                statusColors[status],
                size === "xs" && "h-2 w-2",
                size === "sm" && "h-2.5 w-2.5",
                size === "lg" && "h-3.5 w-3.5",
                size === "xl" && "h-4 w-4"
              )}
            />
          )}
        </div>
      </AvatarContext.Provider>
    );
  }

  // Original API (backward compatible)
  const initials = fallback
    ? fallback
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div className="relative inline-block group">
      <div 
        className={cn(
          "flex items-center justify-center overflow-hidden bg-primary/5 text-primary font-bold tracking-tight shadow-inner transition-all duration-300 group-hover:bg-primary/10",
          sizeMap[size],
          shape === "circle" ? "rounded-full" : "rounded-xl",
          className
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt || fallback}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="font-bold">{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background shadow-sm",
            statusColors[status],
            size === "xs" && "h-2 w-2",
            size === "sm" && "h-2.5 w-2.5",
            size === "lg" && "h-3.5 w-3.5",
            size === "xl" && "h-4 w-4"
          )}
        />
      )}
    </div>
  );
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ src, alt, className, ...props }, ref) => {
    const context = useContext(AvatarContext);
    
    if (!src) return null;

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  const context = useContext(AvatarContext);
  
  // Extract initials from children if it's a string
  const getInitials = (text: string): string => {
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayText = typeof children === "string" 
    ? getInitials(children)
    : children;

  return (
    <span className={cn("font-semibold", className)}>
      {displayText}
    </span>
  );
}