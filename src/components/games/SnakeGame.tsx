import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { PointsIcon } from '@/components/icons/GameIcons';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

export function SnakeGame({ onGameOver, onBack }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake_highscore');
    return saved ? parseInt(saved) : 0;
  });

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const gameLoopRef = useRef<number>();

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeRef.current.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    foodRef.current = newFood;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    generateFood();
    setScore(0);
  }, [generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#1a1a28';
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

    // Draw food
    const food = foodRef.current;
    ctx.fillStyle = '#00d4aa';
    ctx.shadowColor = '#00d4aa';
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

    // Draw snake
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
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#6366f1');
      } else {
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#4f46e5');
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

  const gameLoop = useCallback(() => {
    const snake = snakeRef.current;
    const direction = directionRef.current;
    const head = { ...snake[0] };

    // Move head
    switch (direction) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameState('over');
      const finalScore = score;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('snake_highscore', String(finalScore));
      }
      onGameOver(finalScore);
      return;
    }

    // Check self collision
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      setGameState('over');
      const finalScore = score;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('snake_highscore', String(finalScore));
      }
      onGameOver(finalScore);
      return;
    }

    // Add new head
    snakeRef.current = [head, ...snake];

    // Check food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(prev => prev + 10);
      generateFood();
      // Haptic feedback
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    } else {
      snakeRef.current.pop();
    }

    draw();
  }, [score, highScore, generateFood, draw, onGameOver]);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    const key = e.key;
    const currentDir = directionRef.current;

    switch (key) {
      case 'ArrowUp':
      case 'w':
        if (currentDir !== 'DOWN') directionRef.current = 'UP';
        break;
      case 'ArrowDown':
      case 's':
        if (currentDir !== 'UP') directionRef.current = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
        if (currentDir !== 'RIGHT') directionRef.current = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
        if (currentDir !== 'LEFT') directionRef.current = 'RIGHT';
        break;
    }
  }, [gameState]);

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const currentDir = directionRef.current;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 30 && currentDir !== 'LEFT') directionRef.current = 'RIGHT';
      else if (deltaX < -30 && currentDir !== 'RIGHT') directionRef.current = 'LEFT';
    } else {
      if (deltaY > 30 && currentDir !== 'UP') directionRef.current = 'DOWN';
      else if (deltaY < -30 && currentDir !== 'DOWN') directionRef.current = 'UP';
    }

    touchStartRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = window.setInterval(gameLoop, INITIAL_SPEED);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    draw();
  }, [draw]);

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

      {/* Game area */}
      <div 
        className="flex-1 flex items-center justify-center p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="rounded-xl border border-border"
          />

          {/* Overlays */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl">
              <h3 className="text-xl font-bold font-display mb-2">Snake Game</h3>
              <p className="text-muted-foreground text-sm mb-4">Swipe or use arrows to move</p>
              <button onClick={startGame} className="btn-primary">
                <Play className="w-4 h-4" />
                Start Game
              </button>
            </div>
          )}

          {gameState === 'over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl">
              <h3 className="text-xl font-bold font-display mb-1">Game Over!</h3>
              <p className="text-3xl font-bold points-text mb-1">{score} pts</p>
              <p className="text-muted-foreground text-sm mb-4">High Score: {highScore}</p>
              <button onClick={startGame} className="btn-primary">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls hint */}
      {gameState === 'playing' && (
        <div className="p-4 text-center">
          <p className="text-muted-foreground text-sm">Swipe to change direction</p>
        </div>
      )}
    </div>
  );
}
