"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton, SkeletonAvatar } from "@/components/atoms/skeleton";

export function MessagesSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Conversations List */}
      <div className="w-full md:w-80 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <SkeletonAvatar size="md" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="hidden md:flex flex-1 flex-col">
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <SkeletonAvatar size="sm" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-16 w-3/4 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input */}
            <div className="pt-4 border-t">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

