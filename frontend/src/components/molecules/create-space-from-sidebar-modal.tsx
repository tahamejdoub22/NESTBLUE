"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Hash, Sparkles, Users, MessageSquare } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamSpacesApi } from "@/core/services/api-helpers";
import { toast } from "sonner";

interface CreateSpaceFromSidebarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceFromSidebarModal({
  open,
  onOpenChange,
}: CreateSpaceFromSidebarModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
    }
  }, [open]);

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      teamSpacesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-spaces"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("🎉 Team space created successfully!");
      setName("");
      setDescription("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create space");
    },
  });

  const isFormValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header with gradient background */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-sm">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Create New Team Space
              </DialogTitle>
              <DialogDescription className="text-sm mt-1.5 text-muted-foreground">
                Organize your projects and bring your team together in one place
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Space Name */}
          <div className="space-y-2.5">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              Space Name
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="e.g., Frontend Team, Backend Team, Design Squad..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 pl-4 pr-4 text-base border-2 focus:border-primary/50 transition-colors"
                autoFocus
              />
              {name.trim().length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              This will be visible to all team members
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Description
              <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <textarea
              id="description"
              placeholder="Tell your team what this space is for... (e.g., 'Collaboration hub for frontend development discussions and project planning')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="flex w-full rounded-md border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              Help your team understand the purpose of this space
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-muted/50 border border-muted p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  What can you do with a team space?
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Group related projects together</li>
                  <li>Organize team conversations</li>
                  <li>Share resources and updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {isFormValid ? (
              <span className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Ready to create
              </span>
            ) : (
              "Enter a space name to continue"
            )}
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="px-5"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate({
                name: name.trim(),
                description: description.trim() || undefined,
              })}
              disabled={!isFormValid || createMutation.isPending}
              className="px-6 min-w-[140px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
            >
              {createMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Space
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

