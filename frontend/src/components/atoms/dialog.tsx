"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(
  undefined,
);

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function DialogContent({
  children,
  className,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("DialogContent must be used within a Dialog");
  }

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      context.onOpenChange(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "relative w-full mx-4 bg-card rounded-2xl shadow-2xl border border-border/40",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          "max-h-[90vh] overflow-hidden flex flex-col",
          "max-w-lg",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => context.onOpenChange(false)}
            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full hover:bg-muted"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {children}
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DialogHeader({
  children,
  className,
  ...props
}: DialogHeaderProps) {
  return (
    <div className={cn("px-8 pt-8 pb-4 space-y-2.5", className)} {...props}>
      {children}
    </div>
  );
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function DialogTitle({
  children,
  className,
  ...props
}: DialogTitleProps) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold leading-none tracking-tight text-foreground/90",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function DialogDescription({
  children,
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <p
      className={cn(
        "text-base text-muted-foreground/80 leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DialogFooter({
  children,
  className,
  ...props
}: DialogFooterProps) {
  return (
    <div
      className={cn(
        "px-8 py-6 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
