import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
} from "lucide-react";
import { PointsIcon } from "@/components/icons/GameIcons";

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export function SnakeGame({ onGameOver, onBack }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">(
    "idle"
  );
  const [score, setScore] = useState(0);
  const [gameOverTriggered, setGameOverTriggered] = useState(false);

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("snake_highscore");
    return saved ? parseInt(saved) : 0;
  });

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const gameLoopRef = useRef<number>();

  /** ---------------------------------------------
   * CHANGE DIRECTION (safe turn)
   * --------------------------------------------- */
  const changeDirection = (dir: Direction) => {
    const cur = directionRef.current;

    if (
      (dir === "LEFT" && cur === "RIGHT") ||
      (dir === "RIGHT" && cur === "LEFT") ||
      (dir === "UP" && cur === "DOWN") ||
      (dir === "DOWN" && cur === "UP")
    ) {
      return;
    }

    directionRef.current = dir;
  };

  /** ---------------------------------------------
   * SPAWN FOOD
   * --------------------------------------------- */
  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snakeRef.current.some(
        (seg) => seg.x === newFood.x && seg.y === newFood.y
      )
    );
    foodRef.current = newFood;
  }, []);

  /** ---------------------------------------------
   * RESET GAME
   * --------------------------------------------- */
  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = "RIGHT";
    generateFood();
    setScore(0);
    setGameOverTriggered(false);
  }, [generateFood]);

  /** ---------------------------------------------
   * DRAW CANVAS
   * --------------------------------------------- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1a1a28";
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    const food = foodRef.current;
    ctx.fillStyle = "#00d4aa";
    ctx.shadowColor = "#00d4aa";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    snakeRef.current.forEach((segment, index) => {
      const isHead = index === 0;
      const gradient = ctx.createRadialGradient(
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2
      );

      if (isHead) {
        gradient.addColorStop(0, "#8b5cf6");
        gradient.addColorStop(1, "#6366f1");
      } else {
        gradient.addColorStop(0, "#6366f1");
        gradient.addColorStop(1, "#4f46e5");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        3
      );
      ctx.fill();
    });
  }, []);

  /** ---------------------------------------------
   * SAFE GAME OVER
   * --------------------------------------------- */
  const triggerGameOver = (finalScore: number) => {
    if (gameOverTriggered) return;
    setGameOverTriggered(true);

    setGameState("over");

    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("snake_highscore", String(finalScore));
    }

    onGameOver(finalScore);
  };

  /** ---------------------------------------------
   * GAME LOOP
   * --------------------------------------------- */
  const gameLoop = useCallback(() => {
    const snake = snakeRef.current;
    const direction = directionRef.current;
    const head = { ...snake[0] };

    switch (direction) {
      case "UP":
        head.y--;
        break;
      case "DOWN":
        head.y++;
        break;
      case "LEFT":
        head.x--;
        break;
      case "RIGHT":
        head.x++;
        break;
    }

    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      triggerGameOver(score);
      return;
    }

    if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      triggerGameOver(score);
      return;
    }

    snakeRef.current = [head, ...snake];

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((prev) => prev + 10);
      generateFood();
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
    } else {
      snakeRef.current.pop();
    }

    draw();
  }, [score, draw, generateFood]);

  /** ---------------------------------------------
   * START GAME
   * --------------------------------------------- */
  const startGame = () => {
    resetGame();
    setGameState("playing");
  };

  /** ---------------------------------------------
   * INTERVAL LOOP
   * --------------------------------------------- */
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = window.setInterval(gameLoop, INITIAL_SPEED);
    }
    return () =>
      gameLoopRef.current && clearInterval(gameLoopRef.current);
  }, [gameState, gameLoop]);

  useEffect(() => draw(), [draw]);

  /** ---------------------------------------------
   * UI
   * --------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onBack} className="p-2 rounded-lg bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display font-bold text-lg">Snake Game</h2>
        <div className="flex items-center gap-1.5">
          <PointsIcon className="w-4 h-4 text-primary" />
          <span className="font-semibold points-text">{score}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="rounded-xl border border-border"
          />

          {/* Idle Screen */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl">
              <h3 className="text-xl font-bold font-display mb-2">
                Snake Game
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Swipe, use arrows or buttons to move
              </p>
              <button onClick={startGame} className="btn-primary">
                <Play className="w-4 h-4" />
                Start Game
              </button>
            </div>
          )}

          {/* Game Over */}
          {gameState === "over" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl">
              <h3 className="text-xl font-bold font-display mb-1">
                Game Over!
              </h3>
              <p className="text-3xl font-bold points-text mb-1">
                {score} pts
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                High Score: {highScore}
              </p>
              <button onClick={startGame} className="btn-primary">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTROL BUTTONS (premium, gaming style) */}
      {gameState === "playing" && (
        <div className="pb-6 flex flex-col items-center gap-3">
          {/* UP */}
          <button
            onClick={() => changeDirection("UP")}
            className="p-4 rounded-full bg-secondary border border-white/5 shadow-xl active:scale-90 transition"
          >
            <ArrowUp className="w-6 h-6 text-primary" />
          </button>

          {/* LEFT / RIGHT */}
          <div className="flex items-center gap-12">
            <button
              onClick={() => changeDirection("LEFT")}
              className="p-4 rounded-full bg-secondary border border-white/5 shadow-xl active:scale-90 transition"
            >
              <LeftIcon className="w-6 h-6 text-primary" />
            </button>

            <button
              onClick={() => changeDirection("RIGHT")}
              className="p-4 rounded-full bg-secondary border border-white/5 shadow-xl active:scale-90 transition"
            >
              <RightIcon className="w-6 h-6 text-primary" />
            </button>
          </div>

          {/* DOWN */}
          <button
            onClick={() => changeDirection("DOWN")}
            className="p-4 rounded-full bg-secondary border border-white/5 shadow-xl active:scale-90 transition"
          >
            <ArrowDown className="w-6 h-6 text-primary" />
          </button>
        </div>
      )}
    </div>
  );
}
