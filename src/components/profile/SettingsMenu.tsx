import React from "react";
import { Flame, Star, Trophy, Gift, Users, Target } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export function SettingsMenu() {
  const { user, transactions } = useUser();

  const points = user?.zero_points ?? 0;
  const bestStreak = user?.best_streak ?? 0;
  const gamesPlayed = transactions.filter(t => t.type === "game").length;
  const referrals = user?.referral_count ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Level Card */}
      <div className="menu-item w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Star className="w-6 h-6 text-primary" />
          <div>
            <p className="font-display font-semibold text-base">Player Level</p>
            <p className="text-muted-foreground text-sm">
              Level {Math.floor(points / 1000)}
            </p>
          </div>
        </div>
      </div>

      {/* Rank Card */}
      <div className="menu-item w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="font-display font-semibold text-base">Rank</p>
            <p className="text-muted-foreground text-sm">
              {points >= 20000
                ? "Diamond"
                : points >= 15000
                ? "Gold"
                : points >= 5000
                ? "Silver"
                : points >= 1000
                ? "Bronze"
                : "Rookie"}
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Showcase */}
      <div>
        <h3 className="text-lg font-semibold font-display mb-3">
          Achievements
        </h3>
        <div className="flex space-x-3">
          <div className="menu-item w-16 h-16 flex items-center justify-center">
            🏅
          </div>
          <div className="menu-item w-16 h-16 flex items-center justify-center">
            🎯
          </div>
          <div className="menu-item w-16 h-16 flex items-center justify-center">
            🔥
          </div>
        </div>
      </div>

      {/* Daily Reward Card */}
      <div className="menu-item w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Gift className="w-6 h-6 text-green-400" />
          <div>
            <p className="font-display font-semibold text-base">
              Daily Reward
            </p>
            <p className="text-muted-foreground text-sm">
              Claim your daily bonus!
            </p>
          </div>
        </div>
      </div>

      {/* Referral & Invite Card */}
      <div className="menu-item w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-400" />
          <div>
            <p className="font-display font-semibold text-base">
              Refer & Earn
            </p>
            <p className="text-muted-foreground text-sm">
              {referrals} total referrals
            </p>
          </div>
        </div>
      </div>

      {/* Player Stats Breakdown */}
      <div>
        <h3 className="text-lg font-semibold font-display mb-3">Stats</h3>
        <div className="menu-item w-full flex justify-between">
          <span>Games Played</span>
          <span>{gamesPlayed}</span>
        </div>
        <div className="menu-item w-full flex justify-between">
          <span>Best Streak</span>
          <span>{bestStreak} days</span>
        </div>
        <div className="menu-item w-full flex justify-between">
          <span>Total Points</span>
          <span>{points}</span>
        </div>
      </div>

      {/* Mission / Quest Preview */}
      <div>
        <h3 className="text-lg font-semibold font-display mb-3">
          Daily Missions
        </h3>

        <div className="menu-item w-full flex justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-purple-400" />
            <span>Play 1 Game</span>
          </div>
          <span className="text-primary">+50</span>
        </div>

        <div className="menu-item w-full flex justify-between">
          <div className="flex items-center space-x-3">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>Maintain Streak</span>
          </div>
          <span className="text-primary">+20</span>
        </div>

        <div className="menu-item w-full flex justify-between">
          <div className="flex items-center space-x-3">
            <Star className="w-5 h-5 text-yellow-300" />
            <span>Earn 100 Points</span>
          </div>
          <span className="text-primary">+40</span>
        </div>

      </div>
    </div>
  );
}
