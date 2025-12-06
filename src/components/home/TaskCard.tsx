import React, { useState } from 'react';
import { ExternalLink, Check, Loader2 } from 'lucide-react';
import { Task } from '@/data/tasks';
import { PointsIcon } from '@/components/icons/GameIcons';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onComplete: (taskId: string) => Promise<void>;
}

export function TaskCard({ task, isCompleted, onComplete }: TaskCardProps) {
  const [hasOpened, setHasOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenTask = () => {
    // Use Telegram's openLink if available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(task.url);
    } else {
      window.open(task.url, '_blank');
    }
    setHasOpened(true);
  };

  const handleComplete = async () => {
    if (!hasOpened || isCompleted || isLoading) return;
    
    setIsLoading(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{task.title}</h3>
          <p className="text-muted-foreground text-sm">{task.description}</p>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <PointsIcon className="w-4 h-4 text-primary" />
          <span className="points-text font-semibold">+{task.reward}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {!isCompleted ? (
          <>
            <button
              onClick={handleOpenTask}
              className="btn-secondary flex-1 text-sm py-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Task
            </button>
            <button
              onClick={handleComplete}
              disabled={!hasOpened || isLoading}
              className={`btn-primary flex-1 text-sm py-2 ${!hasOpened ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Complete
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-primary w-full justify-center py-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
