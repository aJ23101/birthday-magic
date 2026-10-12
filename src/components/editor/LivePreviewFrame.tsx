'use client';

import React, { useState } from 'react';
import { BirthdayWishData } from '@/types/birthday';
import { BirthdayPageRenderer } from '../templates/BirthdayPageRenderer';
import { Smartphone, Tablet, Monitor, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface LivePreviewFrameProps {
  wish: BirthdayWishData;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({ wish }) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [renderKey, setRenderKey] = useState(0);

  const resetGiftExperience = () => {
    // Re-mounts renderer so the gift box animation resets if enabled
    setRenderKey((prev) => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-950/80 overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Preview
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            • Real-time interactive feedback
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              device === 'mobile'
                ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Mobile Screen Preview"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>

          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              device === 'tablet'
                ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Tablet Screen Preview"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>

          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              device === 'desktop'
                ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Desktop Screen Preview"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
        </div>

        {/* Reset Gift Test */}
        <button
          onClick={resetGiftExperience}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Re-run the opening experience"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Replay Unboxing</span>
        </button>
      </div>

      {/* Frame Viewer Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center">
        {device === 'mobile' ? (
          <div className="w-[380px] min-h-[740px] rounded-[48px] border-[10px] border-slate-800 shadow-2xl bg-white overflow-hidden relative flex flex-col my-auto ring-4 ring-slate-900/10">
            {/* Phone Speaker & Camera Notch */}
            <div className="h-6 bg-slate-800 rounded-b-2xl mx-auto w-32 flex items-center justify-center z-50">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>
            {/* Screen Content */}
            <div className="flex-1 overflow-y-auto">
              <BirthdayPageRenderer key={renderKey} wish={wish} isPreview={true} />
            </div>
          </div>
        ) : device === 'tablet' ? (
          <div className="w-[760px] min-h-[860px] rounded-[36px] border-[12px] border-slate-800 shadow-2xl bg-white overflow-hidden relative flex flex-col my-auto ring-4 ring-slate-900/10">
            <div className="flex-1 overflow-y-auto">
              <BirthdayPageRenderer key={renderKey} wish={wish} isPreview={true} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white">
            <BirthdayPageRenderer key={renderKey} wish={wish} isPreview={true} />
          </div>
        )}
      </div>
    </div>
  );
};
