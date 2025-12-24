"use client";

import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Skeleton, SkeletonTaskRow } from "@/components/atoms/skeleton";
import { cn } from "@/lib/utils";

export function TasksSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonTaskRow key={i} />
        ))}
      </div>
    </div>
  );
}

