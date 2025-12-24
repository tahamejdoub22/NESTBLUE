import { cn } from "@/lib/utils";
import { createElement } from "react";

type TextVariant = 
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" 
  | "body" | "body-sm" | "body-xs"
  | "lead" | "muted" | "caption" | "overline";

type TextElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  variant?: TextVariant;
  as?: TextElement;
  className?: string;
  children: React.ReactNode;
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  color?: "default" | "muted" | "primary" | "destructive" | "success";
}

const variantStyles: Record<TextVariant, string> = {
  h1: "text-4xl font-bold tracking-tight lg:text-5xl",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold tracking-tight",
  h4: "text-xl font-semibold tracking-tight",
  h5: "text-lg font-semibold",
  h6: "text-base font-semibold",
  body: "text-base",
  "body-sm": "text-sm",
  "body-xs": "text-xs",
  lead: "text-lg text-muted-foreground",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs text-muted-foreground",
  overline: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
};

const weightStyles = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorStyles = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  destructive: "text-destructive",
  success: "text-emerald-600",
};

const defaultTags: Record<TextVariant, TextElement> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  "body-sm": "p",
  "body-xs": "span",
  lead: "p",
  muted: "p",
  caption: "span",
  overline: "span",
};

export function Text({ 
  variant = "body", 
  as, 
  className, 
  children,
  weight,
  color = "default",
  ...htmlProps
}: TextProps) {
  const resolvedVariant = variant || "body";
  const tag: TextElement = (as || defaultTags[resolvedVariant] || "p");
  
  if (!tag || typeof tag !== "string") {
    // Fallback to paragraph if tag is invalid
    return <p className={className}>{children}</p>;
  }
  
  return createElement(
    tag,
    { 
      className: cn(
        variantStyles[resolvedVariant],
        weight && weightStyles[weight],
        colorStyles[color],
        className
      ),
      ...htmlProps
    },
    children
  );
}