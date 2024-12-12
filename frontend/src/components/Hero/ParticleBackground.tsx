import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Square {
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  color: string;
  direction: number;
}

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const squares = useRef<Square[]>([]);

  const createSquare = (x: number, y: number): Square => ({
    x,
    y,
    size: Math.random() * 20 + 10,
    rotation: Math.random() * 360,
    speed: Math.random() * 0.5 + 0.2,
    color: `rgba(37, 99, 235, ${Math.random() * 0.2 + 0.1})`,
    direction: Math.random() > 0.5 ? 1 : -1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initSquares = () => {
      squares.current = [];
      const squareCount = Math.min(Math.max(window.innerWidth / 40, 20), 50);
      
      for (let i = 0; i < squareCount; i++) {
        squares.current.push(
          createSquare(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          )
        );
      }
    };

    const drawSquare = (square: Square) => {
      if (!ctx) return;

      ctx.save();
      ctx.translate(square.x + square.size / 2, square.y + square.size / 2);
      ctx.rotate((square.rotation * Math.PI) / 180);
      ctx.fillStyle = square.color;
      ctx.fillRect(-square.size / 2, -square.size / 2, square.size, square.size);
      ctx.restore();
    };

    const updateSquare = (square: Square) => {
      // Move diagonally
      square.x += square.speed * square.direction;
      square.y += square.speed * square.direction;
      square.rotation += 0.2 * square.direction;

      // Wrap around screen
      if (square.x > canvas.width + square.size) {
        square.x = -square.size;
      } else if (square.x < -square.size) {
        square.x = canvas.width + square.size;
      }

      if (square.y > canvas.height + square.size) {
        square.y = -square.size;
      } else if (square.y < -square.size) {
        square.y = canvas.height + square.size;
      }
    };

    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      squares.current.forEach((square) => {
        updateSquare(square);
        drawSquare(square);
      });

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    initSquares();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initSquares();
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-0"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-50 dark:opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-light dark:to-background-dark" />
    </motion.div>
  );
};