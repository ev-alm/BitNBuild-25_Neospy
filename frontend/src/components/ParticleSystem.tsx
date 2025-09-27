import { motion } from 'motion/react';
import { Sparkles, Star, Trophy, Hexagon, Crown } from 'lucide-react';

interface ParticleSystemProps {
  count?: number;
  type?: 'sparkles' | 'badges' | 'mixed';
}

export default function ParticleSystem({ count = 8, type = 'mixed' }: ParticleSystemProps) {
  const icons = [Sparkles, Star, Trophy, Hexagon, Crown];
  
  const getRandomIcon = () => {
    if (type === 'sparkles') return Sparkles;
    if (type === 'badges') return Hexagon;
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const getRandomColor = () => {
    const colors = ['text-purple-400', 'text-pink-400', 'text-blue-400', 'text-cyan-400', 'text-yellow-400'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => {
        const Icon = getRandomIcon();
        const duration = 8 + Math.random() * 10;
        const delay = Math.random() * 5;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 50;
        const endY = startY + (Math.random() - 0.5) * 50;

        return (
          <motion.div
            key={i}
            className={`absolute opacity-20 ${getRandomColor()}`}
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
            }}
            animate={{
              x: [0, (endX - startX) * 4, 0],
              y: [0, (endY - startY) * 4, 0],
              rotate: [0, 360, 720],
              scale: [0.5, 1.2, 0.5],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        );
      })}
      
      {/* Additional floating orbs */}
      {[...Array(Math.floor(count / 2))].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute w-4 h-4 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, 0],
            scale: [0.8, 1.5, 0.8],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}