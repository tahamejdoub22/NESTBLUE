import { cn } from "@/lib/utils";

export interface AvatarTemplateProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  className?: string;
  status?: "online" | "offline" | "away" | "busy";
}

const sizeMap = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const statusColors = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  away: "bg-amber-500",
  busy: "bg-red-500",
};

export function renderAvatar(props: AvatarTemplateProps) {
  const {
    src,
    alt,
    fallback,
    size = "md",
    shape = "circle",
    className,
    status,
  } = props;

  const initials = fallback
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    wrapper: {
      className: "relative inline-block",
    },
    avatar: {
      className: cn(
        "flex items-center justify-center overflow-hidden bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
        sizeMap[size],
        shape === "circle" ? "rounded-full" : "rounded-lg",
        className
      ),
      src,
      alt: alt || fallback,
      initials,
    },
    status: status ? {
      className: cn(
        "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white dark:border-gray-900",
        statusColors[status],
        size === "xs" && "h-1.5 w-1.5",
        size === "sm" && "h-2 w-2",
        size === "lg" && "h-2.5 w-2.5",
        size === "xl" && "h-3 w-3"
      ),
    } : null,
  };
}



