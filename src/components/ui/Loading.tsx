import React from 'react';

export function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">

        {/* XP Orb */}
        <div className="relative w-16 h-16 flex items-center justify-center">

          {/* Pulse Rings */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-primary/20 animate-xp-pulse"></div>
          <div className="absolute w-20 h-20 rounded-full border-2 border-primary/10 animate-xp-pulse-slow"></div>

          {/* XP Core */}
          <div className="w-10 h-10 rounded-full bg-primary/70 blur-[1px] shadow-[0_0_20px_8px_var(--tw-shadow-color)] shadow-primary/40 animate-xp-core" />

          {/* Orbiting particle */}
          <div className="absolute w-3 h-3 bg-primary rounded-full animate-xp-orbit shadow-[0_0_10px_3px_rgba(0,0,0,0.4)]" />
        </div>

        {/* Loading Text */}
        <p className="text-muted-foreground text-sm animate-pulse">
          Gaining XP...
        </p>

      </div>
    </div>
  );
}
