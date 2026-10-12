'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, RotateCcw } from 'lucide-react';
import { birthdayAudio } from '@/lib/audio';
import { triggerConfettiBurst } from '@/lib/confetti';

interface InteractiveCakeProps {
  primaryColor: string;
  recipientName: string;
  age?: number | string;
  onAllCandlesBlown?: () => void;
}

export const InteractiveCake: React.FC<InteractiveCakeProps> = ({
  primaryColor,
  recipientName,
  age,
  onAllCandlesBlown,
}) => {
  // Candle state: true = lit, false = blown out
  const [candles, setCandles] = useState<boolean[]>([true, true, true]);
  const [allBlown, setAllBlown] = useState<boolean>(false);

  const blowOutCandle = (index: number) => {
    if (!candles[index]) return;
    birthdayAudio.playCandleBlowFx();

    const next = [...candles];
    next[index] = false;
    setCandles(next);

    if (next.every((c) => !c)) {
      handleAllBlown();
    }
  };

  const blowOutAll = () => {
    birthdayAudio.playCandleBlowFx();
    setCandles([false, false, false]);
    handleAllBlown();
  };

  const handleAllBlown = () => {
    setAllBlown(true);
    triggerConfettiBurst();
    birthdayAudio.playWishChime();
    if (onAllCandlesBlown) {
      onAllCandlesBlown();
    }
  };

  const relightCandles = () => {
    setCandles([true, true, true]);
    setAllBlown(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-extrabold flex items-center justify-center gap-2">
          Make A Wish & Blow The Candles! 🎂
        </h3>
        <p className="text-sm opacity-75 mt-1">
          {allBlown
            ? '✨ Your birthday wish has been delivered to the universe!'
            : 'Tap on each candle flame or use the button below to blow them out.'}
        </p>
      </div>

      {/* The Birthday Cake Visual */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex flex-col items-center justify-end select-none">
        {/* Glow behind cake */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-25 -z-10"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Candles Container */}
        <div className="flex items-end justify-center gap-6 mb-1 z-20">
          {candles.map((isLit, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => blowOutCandle(idx)}
              title="Click to blow out candle"
            >
              {/* Flame or Smoke */}
              <div className="h-9 flex items-center justify-center relative">
                <AnimatePresence>
                  {isLit ? (
                    <motion.div
                      key="flame"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.15, 0.95, 1], rotate: [-2, 2, -1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="relative w-4 h-7 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-flame"
                    >
                      {/* Inner blue base */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400 opacity-80" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="smoke"
                      initial={{ opacity: 0.8, y: 0, scale: 0.6 }}
                      animate={{ opacity: 0, y: -20, scale: 1.4 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="w-3 h-3 rounded-full bg-slate-400 blur-xs"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Candle Wick */}
              <div className="w-0.5 h-2 bg-stone-700" />

              {/* Candle Stick */}
              <div
                className="w-3.5 h-12 rounded-t-sm shadow-md border border-white/40 flex flex-col justify-around py-1"
                style={{
                  background:
                    idx === 0
                      ? 'linear-gradient(180deg, #f472b6, #ec4899)'
                      : idx === 1
                      ? 'linear-gradient(180deg, #60a5fa, #3b82f6)'
                      : 'linear-gradient(180deg, #facc15, #eab308)',
                }}
              >
                {/* Candle spiral stripes */}
                <div className="w-full h-1 bg-white/40 transform -rotate-12" />
                <div className="w-full h-1 bg-white/40 transform -rotate-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Cake Tier 1 (Top) */}
        <div className="relative w-36 h-14 bg-gradient-to-r from-pink-200 via-rose-100 to-pink-200 rounded-t-2xl shadow-md border-b border-rose-200 flex items-center justify-center overflow-hidden z-10">
          {/* Icing Drips */}
          <div className="absolute top-0 inset-x-0 h-4 bg-white/90 rounded-b-xl shadow-inner flex justify-around">
            <span className="w-2 h-3 bg-white rounded-b-full shadow-xs" />
            <span className="w-2.5 h-4 bg-white rounded-b-full shadow-xs" />
            <span className="w-2 h-3 bg-white rounded-b-full shadow-xs" />
            <span className="w-2.5 h-3.5 bg-white rounded-b-full shadow-xs" />
          </div>
          {/* Decorative cherries/strawberries */}
          <div className="flex gap-4 mt-2">
            <span className="text-sm">🍓</span>
            <span className="text-sm">✨</span>
            <span className="text-sm">🍓</span>
          </div>
        </div>

        {/* Cake Tier 2 (Middle) */}
        <div className="relative w-48 h-16 bg-gradient-to-r from-amber-100 via-rose-50 to-amber-100 rounded-t-xl shadow-md border-b border-amber-200 flex items-center justify-center overflow-hidden z-10">
          {/* Icing scalloped border */}
          <div className="absolute top-0 inset-x-0 h-4 bg-white/90 rounded-b-xl flex justify-around">
            <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
            <span className="w-3 h-4 bg-white rounded-full shadow-xs" />
            <span className="w-3 h-3.5 bg-white rounded-full shadow-xs" />
            <span className="w-3 h-4 bg-white rounded-full shadow-xs" />
            <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
          </div>
          {age ? (
            <span className="font-extrabold text-base tracking-wider text-rose-500 mt-2">
              ★ {age} & FABULOUS ★
            </span>
          ) : (
            <span className="font-bold text-sm text-rose-400 mt-2">HAPPY BIRTHDAY</span>
          )}
        </div>

        {/* Cake Tier 3 (Base) */}
        <div className="relative w-60 md:w-64 h-20 bg-gradient-to-r from-pink-300 via-rose-200 to-purple-300 rounded-t-2xl shadow-xl flex items-center justify-center overflow-hidden z-10">
          {/* Icing sprinkles */}
          <div className="absolute inset-0 flex flex-wrap gap-3 p-3 opacity-70">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 transform rotate-45" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>

          <span className="font-black text-sm md:text-base tracking-widest text-slate-800/80 drop-shadow-xs uppercase">
            {recipientName}
          </span>
        </div>

        {/* Plate / Stand */}
        <div className="w-68 md:w-72 h-4 bg-gradient-to-r from-stone-200 via-white to-stone-300 rounded-full shadow-2xl border border-stone-300 z-0" />
      </div>

      {/* Interactive Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {!allBlown ? (
          <button
            onClick={blowOutAll}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #f43f5e)`,
            }}
          >
            <Wind className="w-4 h-4" />
            Blow Out All Candles 🎂
          </button>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              All 3 candles blown! Wish granted! ✨
            </div>
            <button
              onClick={relightCandles}
              className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1.5 mt-1 underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Relight the candles
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
