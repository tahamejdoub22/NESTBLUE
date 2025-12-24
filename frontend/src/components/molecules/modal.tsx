// src/components/molecules/modal.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

// Modal Context for State Management
interface ModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

// Modal Provider for State Management
interface ModalProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ModalProvider({ children, defaultOpen = false, onOpenChange }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Sync internal state with defaultOpen prop changes (controlled component pattern)
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const openModal = useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      onOpenChange?.(newState);
      return newState;
    });
  }, [onOpenChange]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeModal]);

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal, toggleModal }}>
      {children}
    </ModalContext.Provider>
  );
}

// Modal Trigger Component
interface ModalTriggerProps {
  children: ReactNode;
  className?: string;
}

export function ModalTrigger({ children, className }: ModalTriggerProps) {
  const { openModal } = useModal();

  return (
    <div onClick={openModal} className={className}>
      {children}
    </div>
  );
}

// Modal Content Component
interface ModalContentProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export function ModalContent({
  children,
  className,
  size = "lg",
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalContentProps) {
  const { isOpen, closeModal } = useModal();

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      closeModal();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm",
        "animate-in fade-in duration-200",
        "overflow-y-auto"
      )}
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "relative w-full",
          "bg-white dark:bg-gray-900",
          "rounded-lg shadow-xl",
          "animate-in zoom-in-95 duration-200",
          "max-h-[90vh] overflow-hidden flex flex-col",
          "my-auto",
          "max-w-[calc(100vw-2rem)]",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={closeModal}
            className={cn(
              "absolute top-4 right-4 z-10",
              "h-8 w-8 p-0 rounded-full",
              "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {children}
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

// Modal Header Component
interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}

// Modal Body Component
interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("overflow-y-auto", className)}>
      {children}
    </div>
  );
}

// Modal Footer Component
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}

// Compound Component Export
export const Modal = {
  Provider: ModalProvider,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
};
