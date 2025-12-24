// src/components/atoms/avatar-group.tsx
import { cn } from "@/lib/utils";
import { Avatar, AvatarProps } from "./avatar";
import React from "react";

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

const AvatarGroup = ({ children, max = 3, size = "md", className }: AvatarGroupProps) => {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const hiddenCount = childrenArray.length - max;

  return (
    <div className={cn("flex items-center -space-x-3", className)}>
      {visibleAvatars.map((child, index) => (
        <div 
          key={index} 
          className="relative rounded-full ring-2 ring-background bg-background flex-shrink-0"
          style={{ zIndex: visibleAvatars.length - index }}
        >
          {React.cloneElement(child as React.ReactElement<AvatarProps>, { size })}
        </div>
      ))}
      {hiddenCount > 0 && (
        <div 
          className="relative rounded-full ring-2 ring-background bg-muted flex-shrink-0 z-0"
        >
          <Avatar
            size={size}
            fallback={`+${hiddenCount}`}
            className="text-muted-foreground font-bold"
          />
        </div>
      )}
    </div>
  );
};

export { AvatarGroup };