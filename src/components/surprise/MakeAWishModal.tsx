'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Heart, X, Send } from 'lucide-react';
import { triggerConfettiBurst } from '@/lib/confetti';
import { birthdayAudio } from '@/lib/audio';

interface MakeAWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  primaryColor: string;
}

export const MakeAWishModal: React.FC<MakeAWishModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  primaryColor,
}) => {
  const [wishText, setWishText] = useState('');
  const [isSealed, setIsSealed] = useState(false);

  const handleCastWish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSealed(true);
    triggerConfettiBurst();
    birthdayAudio.playWishChime();

    setTimeout(() => {
      // Auto close after 2.5 seconds of joyful confirmation
      setIsSealed(false);
      setWishText('');
      onClose();
    }, 2800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSealed ? (
              <>
                {/* Floating Stars */}
                <div className="flex justify-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="text-amber-400"
                  >
                    <Sparkles className="w-8 h-8" />
                  </motion.div>
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
                  Make Your Birthday Wish ✨
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                  Take a quiet moment, close your eyes, and whisper your biggest dream into this golden bottle.
                </p>

                <form onSubmit={handleCastWish} className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={wishText}
                      onChange={(e) => setWishText(e.target.value)}
                      placeholder="My wish for this year is... (kept between you and the stars ✨)"
                      rows={3}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, #f59e0b)`,
                      boxShadow: `0 8px 24px -4px ${primaryColor}66`,
                    }}
                  >
                    <Star className="w-5 h-5 fill-white" />
                    <span>Cast My Wish to the Stars ✨</span>
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 animate-pulse-glow">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                  Wish Sealed & Cast! 🌟
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                  May every ounce of joy you bring to others return to you tenfold this year, {recipientName}!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
