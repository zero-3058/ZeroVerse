import React from 'react';
import { TrophyIcon, TargetIcon, BoltIcon, StarIcon, MedalIcon } from '@/components/icons/GameIcons';

const achievements = [
  { id: 'first_win', name: 'First Win', icon: TrophyIcon, unlocked: true },
  { id: 'sharpshooter', name: 'Sharpshooter', icon: TargetIcon, unlocked: true },
  { id: 'speed_demon', name: 'Speed Demon', icon: BoltIcon, unlocked: false },
  { id: 'rising_star', name: 'Rising Star', icon: StarIcon, unlocked: false },
  { id: 'champion', name: 'Champion', icon: MedalIcon, unlocked: false },
];

export function Achievements() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-display">Achievements</h3>
        <button className="text-primary text-sm font-medium">View All</button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <div 
              key={achievement.id} 
              className={`achievement-badge flex-shrink-0 ${!achievement.unlocked ? 'opacity-50' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${achievement.unlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-center text-muted-foreground whitespace-nowrap">
                {achievement.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
