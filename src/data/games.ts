export interface Game {
  id: string;
  name: string;
  description: string;
  basePoints: number;
  gradient: string;
  icon: 'snake' | 'fruit' | 'runner';
  isNew?: boolean;
  isFeatured?: boolean;
}

export const games: Game[] = [
  {
    id: "snake",
    name: "Snake Game",
    description: "Classic snake with a modern twist. Eat, grow, and survive!",
    basePoints: 500,
    gradient: "gradient-game-snake",
    icon: "snake",
    isNew: true,
    isFeatured: true
  },
  {
    id: "fruit",
    name: "Fruit Cutter",
    description: "Slice fruits and earn zero points. Don't miss!",
    basePoints: 300,
    gradient: "gradient-game-fruit",
    icon: "fruit"
  },
  {
    id: "runner",
    name: "Endless Runner",
    description: "Run as far as you can. Dodge obstacles!",
    basePoints: 450,
    gradient: "gradient-game-runner",
    icon: "runner",
    isNew: true
  }
];
