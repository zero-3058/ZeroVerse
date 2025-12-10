import React from "react";

/**
 * Premium ZeroVerse Loading Screen
 * - Neon gradient brand text
 * - Animated dots (... ... ...)
 * - Glow pulse effect
 * - Pure black app background
 */

export function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-inner">
        {/* Brand Name */}
        <h1 className="loading-title">
          ZeroVerse
          <span className="loading-dots ml-1 inline-block w-5"></span>
        </h1>

        {/* Optional tagline */}
        <p className="loading-subtitle">Initializing...</p>
      </div>
    </div>
  );
}
