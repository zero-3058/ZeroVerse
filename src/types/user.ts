export interface User {
  id: string;
  tg_id: string;
  tg_name: string;
  tg_username?: string;
  zero_points: number;
  ton_wallet_address?: string;
  referrer_id?: string;

  referral_count: number;
  referral_points_earned: number;

  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'game' | 'task' | 'referral' | 'withdraw' | 'wallet_link';
  description: string;
  amount: number;
  created_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  points_earned: number;
  played_at: string;
}

export interface CompletedTask {
  id: string;
  user_id: string;
  task_id: string;
  reward: number;
  completed_at: string;
}
