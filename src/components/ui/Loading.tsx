import React from "react";

export function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex items-center gap-3">

        {/* Logo */}
        <img
          src="/zeroverselogo.png"
          alt="ZeroVerse Logo"
          className="w-7 h-7"
        />

        {/* ZeroVerse text */}
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text"
        >
          ZeroVerse
        </h1>

        {/* Animated dots */}
        <div className="flex items-center gap-2 ml-2">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>
      </div>
    </div>
  );
}
