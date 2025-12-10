import React from "react";

export function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex items-center gap-3">

        {/* ZeroVerse Text */}
        <h1 className="text-3xl font-bold text-gradient-primary">
          ZeroVerse
        </h1>

        {/* Animated dots */}
        <div className="flex gap-1 ml-2">
          <span className="loading-dot animate-dot delay-0" />
          <span className="loading-dot animate-dot delay-200" />
          <span className="loading-dot animate-dot delay-400" />
        </div>
      </div>
    </div>
  );
}
