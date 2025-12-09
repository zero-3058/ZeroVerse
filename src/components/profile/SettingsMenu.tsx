import React from 'react';
import { 
  Trophy, 
  Crown, 
  Star, 
  Zap, 
  Gift, 
  Users, 
  Copy, 
  Target, 
  Flame,
  Medal,
  Award,
  Sparkles
} from 'lucide-react';

// Level System Card
function LevelCard() {
  const currentXP = 2450;
  const maxXP = 3000;
  const level = 12;
  const progress = (currentXP / maxXP) * 100;

  return (
    <div className="animate-fade-in rounded-2xl bg-muted p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Level</p>
            <p className="text-2xl font-bold font-display">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">XP</p>
          <p className="font-semibold">{currentXP.toLocaleString()} / {maxXP.toLocaleString()}</p>
        </div>
      </div>
      <div className="h-3 bg-background rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">{maxXP - currentXP} XP to Level {level + 1}</p>
    </div>
  );
}

// Rank Card
function RankCard() {
  return (
    <div className="animate-fade-in rounded-2xl bg-muted p-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Current Rank</p>
          <p className="text-xl font-bold font-display">Diamond Elite</p>
          <p className="text-sm text-muted-foreground">Top 5% of players</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">#127</p>
          <p className="text-xs text-muted-foreground">Global</p>
        </div>
      </div>
    </div>
  );
}

// Achievement Showcase
function AchievementShowcase() {
  const achievements = [
    { icon: Trophy, label: 'First Win', unlocked: true },
    { icon: Medal, label: '10 Streak', unlocked: true },
    { icon: Award, label: 'Champion', unlocked: false },
  ];

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold font-display mb-3">Achievements</h3>
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <div 
              key={index}
              className={`rounded-2xl p-4 flex flex-col items-center gap-2 ${
                achievement.unlocked ? 'bg-muted' : 'bg-muted/50 opacity-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                achievement.unlocked ? 'bg-primary/10' : 'bg-background'
              }`}>
                <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <p className="text-xs font-medium text-center">{achievement.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Referral & Invite Power Card
function ReferralCard() {
  const referralCode = "PLAYER2024";
  const inviteCount = 7;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
  };

  return (
    <div className="animate-fade-in rounded-2xl bg-muted p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold font-display">Invite Friends</p>
          <p className="text-sm text-muted-foreground">Earn 500 XP per invite</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-background rounded-xl px-4 py-3 font-mono text-sm">
          {referralCode}
        </div>
        <button 
          onClick={handleCopy}
          className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center"
        >
          <Copy className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{inviteCount}</span> friends invited • <span className="text-primary font-semibold">{inviteCount * 500} XP</span> earned
      </p>
    </div>
  );
}

// Daily Reward Card
function DailyRewardCard() {
  const currentDay = 4;
  const rewards = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="animate-fade-in rounded-2xl bg-muted p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold font-display">Daily Rewards</p>
            <p className="text-sm text-muted-foreground">Day {currentDay} of 7</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
          Claim
        </button>
      </div>
      <div className="flex gap-2">
        {rewards.map((day) => (
          <div 
            key={day}
            className={`flex-1 h-2 rounded-full ${
              day <= currentDay ? 'bg-primary' : 'bg-background'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Mission / Quest Preview
function MissionPreview() {
  const missions = [
    { icon: Target, label: 'Win 3 Games', progress: 2, total: 3, reward: 150 },
    { icon: Flame, label: 'Get 5 Streak', progress: 3, total: 5, reward: 200 },
    { icon: Sparkles, label: 'Score 1000 Points', progress: 750, total: 1000, reward: 300 },
  ];

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold font-display mb-3">Active Missions</h3>
      <div className="space-y-3">
        {missions.map((mission, index) => {
          const Icon = mission.icon;
          const progress = (mission.progress / mission.total) * 100;
          return (
            <div key={index} className="rounded-2xl bg-muted p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{mission.label}</p>
                  <p className="text-xs text-muted-foreground">{mission.progress} / {mission.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">+{mission.reward} XP</p>
                </div>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Streak Progress Bar (Style C - Chunked)
function StreakProgressBar() {
  const currentStreak = 5;
  const maxStreak = 7;
  const chunks = Array.from({ length: maxStreak }, (_, i) => i + 1);

  return (
    <div className="animate-fade-in rounded-2xl bg-muted p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold font-display">Current Streak</p>
            <p className="text-sm text-muted-foreground">{currentStreak} days in a row</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-primary">{currentStreak}🔥</div>
      </div>
      <div className="flex gap-2">
        {chunks.map((day) => (
          <div 
            key={day}
            className={`flex-1 h-8 rounded-xl flex items-center justify-center text-xs font-medium ${
              day <= currentStreak 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background text-muted-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsMenu() {
  return (
    <div className="space-y-6">
      <LevelCard />
      <RankCard />
      <AchievementShowcase />
      <DailyRewardCard />
      <StreakProgressBar />
      <ReferralCard />
      <MissionPreview />
    </div>
  );
}