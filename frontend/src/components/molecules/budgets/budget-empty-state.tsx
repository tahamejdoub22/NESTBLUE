"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Wallet, Plus } from "lucide-react";

interface BudgetEmptyStateProps {
  onAddBudget: () => void;
}

export function BudgetEmptyState({ onAddBudget }: BudgetEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Wallet className="h-12 w-12 text-muted-foreground" />
        </div>
        <Text variant="h5" weight="semibold" className="mb-2">
          No budgets found
        </Text>
        <Text variant="body-sm" className="text-muted-foreground text-center mb-6 max-w-md">
          Get started by creating your first budget. Set spending limits and track your financial goals effectively.
        </Text>
        <Button onClick={onAddBudget} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Budget
        </Button>
      </CardContent>
    </Card>
  );
}

