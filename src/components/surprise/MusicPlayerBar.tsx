'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { birthdayAudio } from '@/lib/audio';
import { BirthdayMusic } from '@/types/birthday';

interface MusicPlayerBarProps {
  music: BirthdayMusic;
  primaryColor: string;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  music,
  primaryColor,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const unsub = birthdayAudio.subscribe(() => {
      const state = birthdayAudio.getState();
      setIsPlaying(state.isPlaying);
      setIsMuted(state.isMuted);
    });

    const state = birthdayAudio.getState();
    setIsPlaying(state.isPlaying);
    setIsMuted(state.isMuted);

    return () => unsub();
  }, []);

  if (!music || !music.enabled) return null;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      birthdayAudio.pause();
    } else {
      birthdayAudio.resume(music.customAudioUrl);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    birthdayAudio.toggleMute();
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 p-2.5 pr-4 rounded-full bg-slate-900/95 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md"
      >
        {/* Play / Pause Round Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-108 active:scale-95 cursor-pointer"
          style={{ backgroundColor: primaryColor || '#ec4899' }}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        {/* Track Info & Equalizer */}
        <div className="flex items-center gap-3">
          <div className="max-w-[150px] sm:max-w-[190px]">
            <p className="text-xs font-bold truncate text-white">
              {music.trackTitle || 'Birthday Melody'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isPlaying && !isMuted ? (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-rose-400 rounded-full animate-pulse h-2" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-3" />
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-1.5" />
                  <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-2.5" />
                </div>
              ) : (
                <div className="flex items-end gap-0.5 h-3 opacity-30">
                  <span className="w-0.5 bg-slate-400 rounded-full h-1" />
                  <span className="w-0.5 bg-slate-400 rounded-full h-1" />
                  <span className="w-0.5 bg-slate-400 rounded-full h-1" />
                </div>
              )}
              <span className="text-[10px] font-semibold text-slate-300">
                {isMuted ? 'Muted' : isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 ring-1 ring-rose-500/50'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Click to Unmute Sound' : 'Click to Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
