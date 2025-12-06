export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  url: string;
  icon: 'telegram' | 'twitter' | 'youtube' | 'discord' | 'web';
}

export const tasks: Task[] = [
  {
    id: "task_join_channel",
    title: "Join our Telegram channel",
    description: "Stay updated with ZeroVerse news and updates.",
    reward: 150,
    url: "https://t.me/zeroverse_official",
    icon: "telegram"
  },
  {
    id: "task_follow_twitter",
    title: "Follow us on Twitter",
    description: "Get the latest ZeroVerse announcements.",
    reward: 100,
    url: "https://twitter.com/zeroverse",
    icon: "twitter"
  },
  {
    id: "task_join_discord",
    title: "Join Discord Community",
    description: "Connect with other ZeroVerse players.",
    reward: 120,
    url: "https://discord.gg/zeroverse",
    icon: "discord"
  },
  {
    id: "task_watch_tutorial",
    title: "Watch Tutorial Video",
    description: "Learn how to maximize your zero points.",
    reward: 80,
    url: "https://youtube.com/watch?v=zeroverse",
    icon: "youtube"
  },
  {
    id: "task_visit_website",
    title: "Visit Our Website",
    description: "Explore the ZeroVerse ecosystem.",
    reward: 50,
    url: "https://zeroverse.io",
    icon: "web"
  }
];
