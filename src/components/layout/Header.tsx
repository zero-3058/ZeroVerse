import React from 'react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">

          {/* ⭐ CUSTOM LOGO INSTEAD OF THE Z BOX */}
          <img
            src="/zeroverselogo.png"   // <-- place your logo in /public/
            alt="ZeroVerse Logo"
            className="w-8 h-8 object-contain rounded-lg"
          />

          <h1 className="font-display font-bold text-lg">ZeroVerse</h1>
        </div>
      </div>
    </header>
  );
}
