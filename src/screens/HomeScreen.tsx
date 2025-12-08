import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { PointsDisplay } from "@/components/home/PointsDisplay";
import { GameCard } from "@/components/home/GameCard";
import { TaskCard } from "@/components/home/TaskCard";
import { SnakeGame } from "@/components/games/SnakeGame";
import { games } from "@/data/games";
import { tasks } from "@/data/tasks";
import { PointsIcon } from "@/components/icons/GameIcons";
import { toast } from "@/hooks/use-toast";
import { Transaction } from "@/types/user";

export function HomeScreen() {
  const { user, telegramUser, updateUserPoints, addTransaction } = useUser();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const userName = user?.tg_name || telegramUser?.name || "Player";
  const featuredGame = games.find((g) => g.isFeatured);
  const otherGames = games.filter((g) => !g.isFeatured);

  /** -----------------------------------------
   * SAVE TRANSACTION TO DB
   * ----------------------------------------- */
  const saveTransactionToDB = async (tx: Transaction) => {
    try {
      const response = await fetch("/api/addTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });

      const data = await response.json();
      if (!data.ok) console.error("Transaction save failed:", data.error);
    } catch (err) {
      console.error("addTransaction error:", err);
    }
  };

  const handlePlayGame = (gameId: string) => {
    setActiveGame(gameId);
  };

  /** -----------------------------------------
   * GAME OVER → ADD POINTS + TRANSACTION
   * ----------------------------------------- */
  const handleGameOver = async (score: number) => {
    if (!user) return;

    const pointsEarned = score;
    const newPoints = (user.zero_points || 0) + pointsEarned;

    await updateUserPoints(newPoints);

    const tx: Transaction = {
      id: Date.now().toString(),
      user_id: user.id,
      type: "game" as const, // ⭐ FIX
      description: `${activeGame?.charAt(0).toUpperCase()}${activeGame?.slice(1)} Game Reward`,
      amount: pointsEarned,
      created_at: new Date().toISOString(),
    };

    addTransaction(tx);      // local
    saveTransactionToDB(tx); // DB

    toast({
      title: "Game Complete!",
      description: `You earned ${pointsEarned} zero points!`,
    });
  };

  /** -----------------------------------------
   * TASK COMPLETE → ADD POINTS + TRANSACTION
   * ----------------------------------------- */
  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newPoints = (user.zero_points || 0) + task.reward;
    await updateUserPoints(newPoints);

    const tx: Transaction = {
      id: Date.now().toString(),
      user_id: user.id,
      type: "task" as const, // ⭐ FIX
      description: task.title,
      amount: task.reward,
      created_at: new Date().toISOString(),
    };

    addTransaction(tx);      // local
    saveTransactionToDB(tx); // DB

    setCompletedTasks((prev) => [...prev, taskId]);

    toast({
      title: "Task Completed!",
      description: `You earned ${task.reward} zero points!`,
    });
  };

  const handleBackFromGame = () => {
    setActiveGame(null);
  };

  if (activeGame === "snake") {
    return (
      <SnakeGame
        onGameOver={handleGameOver}
        onBack={handleBackFromGame}
      />
    );
  }

  if (activeGame) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold font-display mb-4">
          {games.find((g) => g.id === activeGame)?.name}
        </h2>
        <p className="text-muted-foreground mb-6">Coming soon!</p>
        <button onClick={handleBackFromGame} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6">
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
          <PointsIcon className="w-4 h-4 text-primary" />
          <span className="text-primary text-xs font-semibold">
            PLAY & EARN
          </span>
        </div>
        <h1 className="text-3xl font-bold font-display mb-1">
          Ready to Win?
        </h1>
        <p className="text-muted-foreground">Welcome back, {userName}</p>
      </div>

      <PointsDisplay />

      {featuredGame && (
        <GameCard
          game={featuredGame}
          onPlay={handlePlayGame}
          variant="featured"
        />
      )}

      <section>
        <h2 className="text-lg font-semibold font-display mb-3">
          Game Library
        </h2>
        <div className="space-y-3">
          {otherGames.map((game) => (
            <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold font-display">Tasks</h2>
          <span className="text-primary text-sm font-medium">
            View All
          </span>
        </div>
        <div className="space-y-3">
          {tasks.slice(0, 3).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted={completedTasks.includes(task.id)}
              onComplete={handleCompleteTask}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
