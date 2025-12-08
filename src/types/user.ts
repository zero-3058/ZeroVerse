// src/types/user.ts

export interface User {
  id: string;                         // Supabase row ID (UUID)
  tg_id: string;                      // Telegram user ID
  tg_name: string;                    // Full name from Telegram
  tg_username?: string | null;        // Telegram @username

  photo_url?: string | null;          // ⭐ Telegram profile photo (fix applied)

  zero_points: number;                // User points balance
  ton_wallet_address?: string | null; // Optional TON wallet

  referrer_id?: string | null;        // Who referred this user

  referral_count: number;             // Total successful referrals
  referral_points_earned: number;     // Total points earned through referrals

  created_at: string;                 // Timestamp
  updated_at: string;                 // Timestamp
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "game" | "task" | "referral" | "withdraw" | "wallet_link";
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
