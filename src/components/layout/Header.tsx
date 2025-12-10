import React from 'react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/30">
      <div className="flex items-center justify-between px-4 py-3">

        {/* Left: Logo + Title */}
        <div className="flex items-center gap-1.5">
          <img
            src="/zeroverselogo.png"
            alt="ZeroVerse Logo"
            className="w-9 h-9 object-contain drop-shadow-lg"
          />

          <h1 className="font-display font-bold text-xl tracking-tight">
            ZeroVerse
          </h1>
        </div>

      </div>
    </header>
  );
}
