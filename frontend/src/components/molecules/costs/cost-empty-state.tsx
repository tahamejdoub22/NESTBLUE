"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Receipt, Plus } from "lucide-react";

interface CostEmptyStateProps {
  onAddCost: () => void;
}

export function CostEmptyState({ onAddCost }: CostEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Receipt className="h-12 w-12 text-muted-foreground" />
        </div>
        <Text variant="h5" weight="semibold" className="mb-2">
          No costs found
        </Text>
        <Text variant="body-sm" className="text-muted-foreground text-center mb-6 max-w-md">
          Get started by adding your first cost entry. Track your expenses and manage your budget effectively.
        </Text>
        <Button onClick={onAddCost} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Cost
        </Button>
      </CardContent>
    </Card>
  );
}

