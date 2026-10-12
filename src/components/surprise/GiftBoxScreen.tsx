'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, Heart, Music } from 'lucide-react';
import { triggerConfettiBurst, triggerSideCannons } from '@/lib/confetti';
import { birthdayAudio } from '@/lib/audio';

interface GiftBoxScreenProps {
  recipientName: string;
  senderName: string;
  template: string;
  primaryColor: string;
  onOpen: () => void;
}

export const GiftBoxScreen: React.FC<GiftBoxScreenProps> = ({
  recipientName,
  senderName,
  template,
  primaryColor,
  onOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Audio fanfare & celebratory audio start
    birthdayAudio.playGiftFanfare();

    // Trigger explosive confetti
    triggerConfettiBurst();
    setTimeout(() => {
      triggerSideCannons();
    }, 400);

    // Give time for the lid lift animation before transitioning
    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  const isDark = template === 'cinematic';
  const isMinimal = template === 'minimal';
  const isScrapbook = template === 'scrapbook';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden ${
        isDark
          ? 'bg-slate-950 text-amber-50'
          : isScrapbook
          ? 'bg-[#faf5eb] text-amber-950'
          : isMinimal
          ? 'bg-stone-50 text-stone-900'
          : 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 text-slate-800'
      }`}
    >
      {/* Ambient background glow & sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse-glow"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse-glow"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Floating Sparkle Icons */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 left-10 md:left-24 text-amber-400 opacity-60 pointer-events-none"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-16 right-10 md:right-24 text-pink-400 opacity-60 pointer-events-none"
      >
        <Heart className="w-8 h-8 fill-pink-400" />
      </motion.div>

      {/* Header text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg mb-8"
      >
        <span
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
          style={{
            backgroundColor: `${primaryColor}22`,
            color: primaryColor,
            border: `1px solid ${primaryColor}44`,
          }}
        >
          <Gift className="w-3.5 h-3.5" />
          Special Delivery For You
        </span>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
          Hey {recipientName}! 🎉
        </h1>
        <p className="text-sm md:text-base opacity-80 max-w-sm mx-auto">
          {senderName} has crafted an exclusive birthday surprise filled with memories, wishes, and love.
        </p>
      </motion.div>

      {/* 3D Interactive Gift Box */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 90 }}
        className="relative z-10 my-4 cursor-pointer group"
        onClick={handleOpenClick}
      >
        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
          {/* Pulsing ring aura */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full blur-2xl -z-10"
            style={{ backgroundColor: primaryColor }}
          />

          {/* Gift Box Container */}
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            {/* Box Lid */}
            <motion.div
              animate={
                isOpening
                  ? { y: -120, rotate: -25, opacity: 0.8 }
                  : { y: [0, -6, 0] }
              }
              transition={
                isOpening
                  ? { duration: 0.9, ease: 'easeOut' }
                  : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }
              className="absolute top-0 left-0 right-0 h-14 md:h-16 rounded-t-2xl shadow-xl z-20 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #db2777)`,
              }}
            >
              {/* Ribbon Bow */}
              <div className="absolute -top-6 flex items-center justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-300 rounded-full border-2 border-white/40 shadow-lg flex items-center justify-center transform -rotate-12">
                  <span className="text-sm">🎀</span>
                </div>
              </div>
              {/* Vertical Lid Ribbon */}
              <div className="w-8 h-full bg-amber-300/80 shadow-inner" />
            </motion.div>

            {/* Box Base */}
            <motion.div
              animate={isOpening ? { scale: 1.05 } : { scale: 1 }}
              className="absolute bottom-0 left-2 right-2 h-28 md:h-34 rounded-b-2xl shadow-2xl flex items-center justify-center overflow-hidden border-t-2 border-white/20"
              style={{
                background: `linear-gradient(180deg, ${primaryColor}dd, ${primaryColor})`,
              }}
            >
              {/* Ribbon bands */}
              <div className="absolute inset-0 flex justify-center">
                <div className="w-8 h-full bg-amber-300/80 shadow-inner" />
              </div>
              <div className="absolute inset-0 flex items-center">
                <div className="h-8 w-full bg-amber-300/80 shadow-inner" />
              </div>

              {/* Sparkle burst inside on opening */}
              {isOpening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: 1, scale: 1.8 }}
                  className="absolute z-30 text-amber-200"
                >
                  <Sparkles className="w-14 h-14" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Button & Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mt-6"
      >
        <button
          onClick={handleOpenClick}
          disabled={isOpening}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, #ec4899)`,
            boxShadow: `0 10px 30px -5px ${primaryColor}66`,
          }}
        >
          <Gift className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span className="text-base md:text-lg">
            {isOpening ? 'Unwrapping Your Gift... ✨' : 'Open Your Surprise 🎁'}
          </span>
          <Sparkles className="w-4 h-4 text-amber-200" />
        </button>

        <p className="mt-3 text-xs opacity-60 flex items-center justify-center gap-1.5">
          <Music className="w-3.5 h-3.5" /> Turn up your volume for music & sound effects
        </p>
      </motion.div>
    </div>
  );
};
