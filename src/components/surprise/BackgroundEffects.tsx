'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BackgroundEffectType } from '@/types/birthday';

interface BackgroundEffectsProps {
  effect: BackgroundEffectType;
  primaryColor: string;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  effect,
  primaryColor,
}) => {
  if (effect === 'minimal') return null;

  // Floating Balloons Effect
  if (effect === 'balloons') {
    const balloonColors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
    const items = [
      { id: 1, left: '8%', delay: 0, duration: 14, size: 48, color: balloonColors[0] },
      { id: 2, left: '22%', delay: 2.5, duration: 18, size: 56, color: balloonColors[1] },
      { id: 3, left: '42%', delay: 1, duration: 15, size: 52, color: balloonColors[2] },
      { id: 4, left: '65%', delay: 4, duration: 20, size: 60, color: balloonColors[3] },
      { id: 5, left: '82%', delay: 0.8, duration: 16, size: 50, color: balloonColors[4] },
      { id: 6, left: '92%', delay: 3.2, duration: 17, size: 54, color: balloonColors[5] },
    ];

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {items.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{
              y: '-20vh',
              opacity: [0, 0.8, 0.8, 0],
              x: [0, 15, -15, 0],
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              delay: b.delay,
              ease: 'linear',
            }}
            style={{ left: b.left }}
            className="absolute flex flex-col items-center"
          >
            {/* Balloon Body */}
            <div
              className="rounded-full shadow-lg opacity-85 relative"
              style={{
                width: b.size,
                height: b.size * 1.25,
                background: `radial-gradient(circle at 30% 30%, #ffffff88, ${b.color})`,
              }}
            >
              {/* Balloon knot */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: b.color }}
              />
            </div>
            {/* Balloon string */}
            <div className="w-0.5 h-16 bg-slate-400/40 transform rotate-1" />
          </motion.div>
        ))}
      </div>
    );
  }

  // Floating Hearts Effect
  if (effect === 'hearts') {
    const hearts = [
      { id: 1, left: '10%', delay: 0, duration: 12, size: 24 },
      { id: 2, left: '28%', delay: 2, duration: 15, size: 30 },
      { id: 3, left: '50%', delay: 1, duration: 14, size: 20 },
      { id: 4, left: '72%', delay: 3, duration: 16, size: 28 },
      { id: 5, left: '88%', delay: 0.5, duration: 13, size: 22 },
    ];

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ y: '105vh', opacity: 0, scale: 0.8 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.7, 0.7, 0],
              x: [0, 20, -20, 0],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: h.duration,
              repeat: Infinity,
              delay: h.delay,
              ease: 'linear',
            }}
            style={{ left: h.left }}
            className="absolute text-pink-400/60"
          >
            <span style={{ fontSize: `${h.size}px` }}>💖</span>
          </motion.div>
        ))}
      </div>
    );
  }

  // Twinkling Stars Effect (Cinematic / luxury)
  if (effect === 'stars' || effect === 'sparkles') {
    const stars = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      top: `${(i * 13) % 95}%`,
      left: `${(i * 23) % 95}%`,
      delay: (i % 5) * 0.7,
      duration: 2 + (i % 3),
      size: 10 + (i % 8) * 2,
    }));

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeInOut',
            }}
            style={{
              top: s.top,
              left: s.left,
              fontSize: `${s.size}px`,
            }}
            className="absolute text-amber-300/70 select-none"
          >
            ✦
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
};
