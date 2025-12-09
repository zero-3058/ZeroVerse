import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { GamepadIcon, PointsIcon } from '@/components/icons/GameIcons';
import { Flame } from 'lucide-react';

export function StatsGrid() {
  const { user, transactions } = useUser();
  
  const gamesPlayed = transactions.filter(t => t.type === 'game').length;
  const totalEarned = user?.zero_points ?? 0;

  // Pull dynamic streak (0 until backend streak system is added)
  const bestStreak = user?.best_streak ?? 0;

  const stats = [
    {
      icon: GamepadIcon,
      value: gamesPlayed.toString(),
      label: 'Games\nPlayed',
      color: 'text-blue-400 bg-blue-500/20',
    },
    {
      icon: PointsIcon,
      value: totalEarned.toLocaleString(),
      label: 'Points\nEarned',
      color: 'text-primary bg-primary/20',
    },
    {
      icon: Flame,
      value: `${bestStreak} days`,
      label: 'Best\nStreak',
      color: 'text-green-400 bg-green-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display">{stat.value}</span>
            <span className="text-xs text-muted-foreground text-center whitespace-pre-line">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
