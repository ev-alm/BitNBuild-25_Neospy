import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ConfettiEffectProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  size: number;
}

export default function ConfettiEffect({ 
  isActive, 
  duration = 3000, 
  particleCount = 50 
}: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const colors = [
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#f59e0b', // Amber
    '#10b981', // Emerald
  ];

  const shapes = ['circle', 'square', 'triangle'] as const;

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: Math.random() * 8 + 4,
      });
    }
    setParticles(newParticles);

    // Clear particles after duration
    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, particleCount]);

  const getShapeElement = (particle: Particle) => {
    const baseClasses = "absolute";
    const style = {
      backgroundColor: particle.color,
      width: particle.size,
      height: particle.size,
    };

    switch (particle.shape) {
      case 'circle':
        return (
          <div
            className={`${baseClasses} rounded-full`}
            style={style}
          />
        );
      case 'square':
        return (
          <div
            className={baseClasses}
            style={style}
          />
        );
      case 'triangle':
        return (
          <div
            className={baseClasses}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
            }}
          />
        );
      default:
        return null;
    }
  };

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{
            x: particle.x,
            y: particle.y,
            rotate: particle.rotation,
          }}
          animate={{
            x: particle.x + particle.vx * 100,
            y: window.innerHeight + 100,
            rotate: particle.rotation + particle.rotationSpeed * 100,
          }}
          transition={{
            duration: duration / 1000,
            ease: "easeOut",
          }}
        >
          {getShapeElement(particle)}
        </motion.div>
      ))}
    </div>
  );
}