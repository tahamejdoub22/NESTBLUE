"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Repeat, Plus } from "lucide-react";

interface ExpenseEmptyStateProps {
  onAddExpense: () => void;
}

export function ExpenseEmptyState({ onAddExpense }: ExpenseEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Repeat className="h-12 w-12 text-muted-foreground" />
        </div>
        <Text variant="h5" weight="semibold" className="mb-2">
          No expenses found
        </Text>
        <Text variant="body-sm" className="text-muted-foreground text-center mb-6 max-w-md">
          Get started by adding your first recurring expense. Track subscriptions, bills, and regular payments.
        </Text>
        <Button onClick={onAddExpense} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Expense
        </Button>
      </CardContent>
    </Card>
  );
}

