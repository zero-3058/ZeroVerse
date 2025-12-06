import React from 'react';
import { ChevronRight, Play } from 'lucide-react';
import { Game } from '@/data/games';
import { SnakeIcon, FruitIcon, RunnerIcon, PointsIcon } from '@/components/icons/GameIcons';

interface GameCardProps {
  game: Game;
  onPlay: (gameId: string) => void;
  variant?: 'featured' | 'list';
}

const iconMap = {
  snake: SnakeIcon,
  fruit: FruitIcon,
  runner: RunnerIcon,
};

export function GameCard({ game, onPlay, variant = 'list' }: GameCardProps) {
  const Icon = iconMap[game.icon];

  if (variant === 'featured') {
    return (
      <div className="featured-game-card animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl ${game.gradient} flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {game.isNew && <span className="new-badge">NEW</span>}
        </div>

        <div className="mb-1">
          <span className="text-primary text-xs font-semibold tracking-wider">FEATURED GAME</span>
        </div>
        <h3 className="text-xl font-display font-bold mb-2">{game.name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{game.description}</p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <PointsIcon className="w-4 h-4 text-primary" />
            <span className="points-text font-semibold">{game.basePoints}</span>
            <span className="text-muted-foreground text-sm">pts</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <span>👥</span>
            <span>12.5k plays</span>
          </div>
        </div>

        <button
          onClick={() => onPlay(game.id)}
          className="btn-primary w-full"
        >
          <Play className="w-4 h-4" />
          Play Now
        </button>
      </div>
    );
  }

  return (
    <div 
      className="game-card flex items-center gap-4 cursor-pointer"
      onClick={() => onPlay(game.id)}
    >
      <div className={`w-14 h-14 rounded-xl ${game.gradient} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{game.name}</h3>
          {game.isNew && <span className="new-badge">NEW</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <PointsIcon className="w-4 h-4 text-primary" />
          <span className="points-text font-medium">{game.basePoints}</span>
          <span className="text-muted-foreground text-sm">points</span>
        </div>
      </div>

      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}
