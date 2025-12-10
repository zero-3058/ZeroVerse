import React from 'react';
import { Transaction } from '@/types/user';
import { PointsIcon, GamepadIcon, TonIcon } from '@/components/icons/GameIcons';
import { Users, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
}

const typeIcons = {
  game: GamepadIcon,
  task: CheckCircle,
  referral: Users,
  withdraw: TonIcon,
  wallet_link: TonIcon,
};

const typeColors = {
  game: 'bg-blue-500/20 text-blue-400',
  task: 'bg-green-500/20 text-green-400',
  referral: 'bg-purple-500/20 text-purple-400',
  withdraw: 'bg-orange-500/20 text-orange-400',
  wallet_link: 'bg-cyan-500/20 text-cyan-400',
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="game-card text-center py-8">
        <p className="text-muted-foreground">No transactions yet</p>
        <p className="text-sm text-muted-foreground mt-1">Play games or complete tasks to earn zero points!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => {
        const Icon = typeIcons[tx.type] || PointsIcon;
        const colorClass = typeColors[tx.type] || 'bg-muted text-muted-foreground';
        const isPositive = tx.amount > 0;
        const timeAgo = formatDistanceToNow(new Date(tx.created_at), { addSuffix: false });

        return (
          <div 
            key={tx.id} 
            className="game-card flex items-center gap-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{tx.description}</h4>
              <p className="text-muted-foreground text-sm">{timeAgo} ago</p>
            </div>

            <div className={`font-semibold ${isPositive ? 'points-text' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{tx.amount.toLocaleString()} zero_pts
            </div>
          </div>
        );
      })}
    </div>
  );
}
