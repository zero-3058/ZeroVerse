import React from "react";

export function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">

        <p className="text-muted-foreground text-lg font-display flex items-center gap-1">
          ZeroVerse
          <span className="loading-dots ml-1"></span>
        </p>

      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="game-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}
