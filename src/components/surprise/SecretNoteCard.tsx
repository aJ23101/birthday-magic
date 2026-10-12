'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, Lock, Sparkles, Heart } from 'lucide-react';
import { birthdayAudio } from '@/lib/audio';

interface SecretNoteCardProps {
  secretNote?: string;
  senderName: string;
  primaryColor: string;
}

export const SecretNoteCard: React.FC<SecretNoteCardProps> = ({
  secretNote,
  senderName,
  primaryColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!secretNote || secretNote.trim().length === 0) return null;

  const toggleNote = () => {
    if (!isOpen) {
      birthdayAudio.playWishChime();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full max-w-lg mx-auto my-8 px-4">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`relative rounded-3xl p-6 md:p-8 cursor-pointer shadow-xl transition-all border ${
          isOpen
            ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50'
            : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800'
        }`}
        onClick={toggleNote}
      >
        {/* Corner Wax Seal / Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="p-2.5 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              {isOpen ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </span>
            <div>
              <h4 className="font-bold text-base md:text-lg flex items-center gap-1.5">
                {isOpen ? 'Secret Birthday Note Revealed' : 'Confidential Birthday Letter'}
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h4>
              <p className="text-xs opacity-60">From: {senderName}</p>
            </div>
          </div>

          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
              borderColor: `${primaryColor}33`,
            }}
          >
            {isOpen ? 'Tap to close' : 'Tap to unlock 🔐'}
          </span>
        </div>

        {/* Content Reveal */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm">
                Contains an exclusive personal note meant only for your eyes.
              </p>
              <p className="text-xs opacity-60">Click anywhere on this card to unseal 💌</p>
            </motion.div>
          ) : (
            <motion.div
              key="opened"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="pt-2"
            >
              <div className="relative p-5 rounded-2xl bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                <p className="font-handwriting text-xl md:text-2xl leading-relaxed text-amber-950 dark:text-amber-100 whitespace-pre-line">
                  {secretNote}
                </p>
                <div className="mt-4 flex items-center justify-end gap-1.5 text-xs font-semibold text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>With all my heart, {senderName}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
