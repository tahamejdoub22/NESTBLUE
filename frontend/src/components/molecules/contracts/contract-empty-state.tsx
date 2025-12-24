"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { FileText, Plus } from "lucide-react";

interface ContractEmptyStateProps {
  onAddContract: () => void;
}

export function ContractEmptyState({ onAddContract }: ContractEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <Text variant="h5" weight="semibold" className="mb-2">
          No contracts found
        </Text>
        <Text variant="body-sm" className="text-muted-foreground text-center mb-6 max-w-md">
          Get started by adding your first contract. Track vendor agreements, manage renewals, and monitor contract statuses effectively.
        </Text>
        <Button onClick={onAddContract} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Contract
        </Button>
      </CardContent>
    </Card>
  );
}

