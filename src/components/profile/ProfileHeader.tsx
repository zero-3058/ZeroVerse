import React from 'react';
import { useUser } from '@/contexts/UserContext';

export function ProfileHeader() {
  const { user, telegramUser } = useUser();

  const name = user?.tg_name || telegramUser?.name || "User";
  const username = user?.tg_username || telegramUser?.username;
  const tgId = user?.tg_id || telegramUser?.id;

  // ⭐ PRIORITY: user.photo_url → telegramUser.photo_url → fallback gradient
  const photo =
    user?.photo_url ||
    telegramUser?.photo_url ||
    null;

  // Gradient fallback avatar (your original code)
  const gradientIndex = name.charCodeAt(0) % 5;
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-green-400 to-cyan-500",
    "from-pink-500 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-violet-500 to-indigo-600",
  ];

  return (
    <div className="flex flex-col items-center py-6 animate-fade-in">
      
      {/* ⭐ AVATAR SECTION */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-[3px] border-primary/30 bg-background">
          
          {/* If photo exists → show photo */}
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              referrerPolicy="no-referrer"   // ⭐ REQUIRED FIX FOR TELEGRAM IMAGES
              className="w-full h-full object-cover"
            />
          ) : (
            /* Otherwise → show gradient with Initial */
            <div
              className={`w-full h-full rounded-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center`}
            >
              <span className="text-3xl font-bold text-white font-display">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Online green dot */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-4 border-background" />
      </div>

      {/* Name */}
      <h2 className="text-2xl font-bold font-display">{name}</h2>

      {/* Username */}
      {username && (
        <p className="text-muted-foreground">@{username}</p>
      )}

      {/* Telegram ID */}
      {tgId && (
        <p className="text-muted-foreground text-sm mt-1">ID: {tgId}</p>
      )}
    </div>
  );
}
