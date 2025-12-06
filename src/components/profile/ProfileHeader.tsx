import React from 'react';
import { useUser } from '@/contexts/UserContext';

export function ProfileHeader() {
  const { user, telegramUser } = useUser();
  
  const name = user?.tg_name || telegramUser?.name || 'User';
  const username = user?.tg_username || telegramUser?.username;
  const tgId = user?.tg_id || telegramUser?.id;

  // Generate avatar gradient based on name
  const gradientIndex = name.charCodeAt(0) % 5;
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-400 to-cyan-500',
    'from-pink-500 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-violet-500 to-indigo-600',
  ];

  return (
    <div className="flex flex-col items-center py-6 animate-fade-in">
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-primary via-accent to-primary">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center`}>
            <span className="text-3xl font-bold text-white font-display">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-4 border-background" />
      </div>

      {/* Name & Username */}
      <h2 className="text-2xl font-bold font-display">{name}</h2>
      {username && (
        <p className="text-muted-foreground">@{username}</p>
      )}
      {tgId && (
        <p className="text-muted-foreground text-sm mt-1">ID: {tgId}</p>
      )}
    </div>
  );
}
