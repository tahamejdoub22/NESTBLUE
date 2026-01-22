"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/40 bg-card p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl max-h-[90vh] overflow-hidden flex flex-col outline-none",
        "w-[calc(100%-2rem)] mx-auto", // Responsive width adjustment
        className
      )}
      {...props}
    >
      <div
        role="dialog"
        aria-modal="true"
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
            aria-label="Close"
            onClick={() => context.onOpenChange(false)}
            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full hover:bg-muted"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

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
    />
  );
}
