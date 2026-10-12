'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BirthdayWishData, TemplateType, BackgroundEffectType, FontStyleType } from '@/types/birthday';
import { TEMPLATES, INITIAL_WISH_DATA, SAMPLE_PHOTOS, SAMPLE_TIMELINE } from '@/data/templates';
import { saveWish, generateSlug } from '@/lib/storage';
import { birthdayAudio } from '@/lib/audio';
import { triggerConfettiBurst } from '@/lib/confetti';
import {
  Sparkles,
  Heart,
  Gift,
  Smile,
  Music,
  ArrowRight,
  Palette,
  User,
  Wand2,
  Check,
  Volume2,
  Play,
  RotateCcw,
  Star,
  PartyPopper,
} from 'lucide-react';

interface VibeOption {
  id: TemplateType;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  gradient: string;
  vibeText: string;
  effect: BackgroundEffectType;
  font: FontStyleType;
}

const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'pastel',
    name: 'Pastel Dream',
    tagline: 'Sweet, gentle & cozy',
    emoji: '🌸',
    color: '#ec4899',
    gradient: 'from-pink-300 via-purple-300 to-indigo-300',
    vibeText: 'Dreamy lavender, clouds of love & floating hearts',
    effect: 'hearts',
    font: 'playful',
  },
  {
    id: 'scrapbook',
    name: 'Polaroid Memories',
    tagline: 'Vintage, warm & nostalgic',
    emoji: '📸',
    color: '#b45309',
    gradient: 'from-amber-200 via-orange-200 to-stone-300',
    vibeText: 'Washi tape, polaroid cards & cursive handwriting',
    effect: 'sparkles',
    font: 'handwriting',
  },
  {
    id: 'cinematic',
    name: 'Midnight VIP',
    tagline: 'Luxury, stars & gold',
    emoji: '✨',
    color: '#f59e0b',
    gradient: 'from-slate-900 via-indigo-950 to-amber-950',
    vibeText: 'Dark obsidian, champagne glow & starlight aura',
    effect: 'stars',
    font: 'serif',
  },
  {
    id: 'minimal',
    name: 'Editorial Chic',
    tagline: 'Clean, elegant & quiet',
    emoji: '🌿',
    color: '#18181b',
    gradient: 'from-stone-200 via-neutral-100 to-stone-300',
    vibeText: 'Serene serif, generous whitespace & refined beauty',
    effect: 'minimal',
    font: 'serif',
  },
  {
    id: 'funny',
    name: 'Roast & Laughs',
    tagline: 'Comic, hilarious & bold',
    emoji: '🤪',
    color: '#f43f5e',
    gradient: 'from-amber-300 via-rose-400 to-cyan-400',
    vibeText: 'Playful badges, inside jokes & infectious laughs',
    effect: 'balloons',
    font: 'playful',
  },
  {
    id: 'bestfriends',
    name: 'Besties Forever',
    tagline: 'Lifelong bond & chaos',
    emoji: '👯',
    color: '#0d9488',
    gradient: 'from-teal-300 via-pink-300 to-emerald-300',
    vibeText: 'Friendship photo reels, heartfelt notes & mutual support',
    effect: 'confetti',
    font: 'modern',
  },
];

const RELATIONSHIP_PILLS = [
  { label: 'Best Friend', emoji: '👯‍♀️' },
  { label: 'Soulmate', emoji: '💖' },
  { label: 'Sister', emoji: '🌸' },
  { label: 'Brother', emoji: '⚡' },
  { label: 'Mom', emoji: '💐' },
  { label: 'Dad', emoji: '👑' },
  { label: 'Partner', emoji: '🥂' },
  { label: 'Favorite Human', emoji: '🌟' },
];

const MESSAGE_PRESETS = [
  {
    label: 'Deep & Heartfelt 💖',
    header: 'To The World’s Most Radiant Soul ✨',
    message:
      "Happy Birthday! Today is a celebration of the extraordinary light, joy, and warmth you bring into every room. Thank you for always listening, for lifting everyone around you, and for being your genuine, beautiful self. May this year bring you the grand adventures and deep happiness you deserve!",
    secret:
      "Secret Truth: You are genuinely one of the biggest blessings in my entire life. Keep shining brightly!",
  },
  {
    label: 'Funny & Playful 🤪',
    header: 'Officially Another Year Wiser (Allegedly) 🎂',
    message:
      "Happy Birthday to someone who is smart, hilarious, handsome/gorgeous, and reminds me a lot of myself! Let us eat excessive cake, make questionable life choices, and celebrate the fact that you still look young enough to get carded for energy drinks.",
    secret:
      "Confidential note: I did not buy you an expensive gift because having me as a friend is honestly reward enough. Love you! 😂",
  },
  {
    label: 'Milestone Glory 🏆',
    header: 'Entering A Golden New Chapter 🌟',
    message:
      "Happy Birthday! Standing here celebrating another milestone with you feels incredible. Look at everything you've conquered, the dreams you've built, and the lives you've touched. The best chapters of your story are only just beginning. Cheers to your boldest year yet!",
    secret:
      "We are throwing an unforgettable celebration soon. Clear your calendar and prepare for greatness!",
  },
];

interface VibeCreatorStudioProps {
  onWishCreated: (wish: BirthdayWishData) => void;
}

export const VibeCreatorStudio: React.FC<VibeCreatorStudioProps> = ({ onWishCreated }) => {
  const router = useRouter();

  const [selectedVibe, setSelectedVibe] = useState<VibeOption>(VIBE_OPTIONS[0]);
  const [recipientName, setRecipientName] = useState('Sarah');
  const [senderName, setSenderName] = useState('Alex');
  const [age, setAge] = useState('24');
  const [relationship, setRelationship] = useState('Best Friend');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [primaryColor, setPrimaryColor] = useState(VIBE_OPTIONS[0].color);
  const [backgroundEffect, setBackgroundEffect] = useState<BackgroundEffectType>('balloons');
  const [isAudioPreviewing, setIsAudioPreviewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleVibeSelect = (vibe: VibeOption) => {
    setSelectedVibe(vibe);
    setPrimaryColor(vibe.color);
    setBackgroundEffect(vibe.effect);
  };

  const handlePlayAudioPreview = () => {
    if (isAudioPreviewing) {
      birthdayAudio.pause();
      setIsAudioPreviewing(false);
    } else {
      birthdayAudio.resume();
      setIsAudioPreviewing(true);
      setTimeout(() => {
        birthdayAudio.pause();
        setIsAudioPreviewing(false);
      }, 5000);
    }
  };

  const handleCreateAndOpenEditor = async () => {
    setIsCreating(true);
    triggerConfettiBurst();

    const chosenPreset = MESSAGE_PRESETS[selectedPresetIdx];
    const newSlug = generateSlug(recipientName || 'birthday');

    const newWish: BirthdayWishData = {
      ...INITIAL_WISH_DATA,
      id: `wish-${Date.now()}`,
      slug: newSlug,
      recipientName: recipientName.trim() || 'Someone Special',
      senderName: senderName.trim() || 'A Secret Admirer',
      relationship,
      age: age ? parseInt(age, 10) || age : '',
      greetingHeader: chosenPreset.header,
      mainMessage: chosenPreset.message,
      secretNote: chosenPreset.secret,
      template: selectedVibe.id,
      primaryColor,
      fontStyle: selectedVibe.font,
      backgroundEffect,
      isPublished: true,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveWish(newWish);
      onWishCreated(newWish);
      router.push(`/editor?id=${newWish.id}`);
    } catch (err) {
      console.error(err);
      router.push(`/editor`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative rounded-[36px] bg-gradient-to-br from-white via-rose-50/40 to-amber-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 md:p-10 shadow-2xl border border-rose-100/80 dark:border-slate-800 overflow-hidden">
      {/* Decorative ambient blurred blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-amber-300/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-300/15 to-rose-300/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-rose-100/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Vibe Studio
          </div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Create A Birthday Website In 30 Seconds 🎈
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick a vibe, customize the lucky recipient, and generate an unforgettable surprise link.
          </p>
        </div>

        {/* Good vibes audio preview button */}
        <button
          onClick={handlePlayAudioPreview}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isAudioPreviewing
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>{isAudioPreviewing ? 'Playing Melody 🎶' : 'Test Birthday Tune'}</span>
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Option Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-7">
          {/* 1. CHOOSE THE VIBE */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                Pick Your Celebration Vibe
              </span>
              <span className="text-[11px] font-semibold text-rose-500">
                {selectedVibe.name} Selected
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VIBE_OPTIONS.map((vibe) => {
                const isSelected = selectedVibe.id === vibe.id;
                return (
                  <motion.div
                    key={vibe.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVibeSelect(vibe)}
                    className={`relative p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-white dark:bg-slate-800 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/20'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{vibe.emoji}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {vibe.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {vibe.tagline}
                      </p>
                    </div>

                    {/* Color dot bar */}
                    <div
                      className="mt-2.5 h-1 rounded-full w-full"
                      style={{ backgroundColor: vibe.color }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 2. RECIPIENT & SENDER */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              Who Are We Celebrating?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="sm:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Recipient&apos;s Name *
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Maya, Jordan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Sender (Your Name) *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Liam, Your Bestie"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Milestone Age (Optional)
                </label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 21, 30"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Relationship pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Role:</span>
              {RELATIONSHIP_PILLS.map((rel) => (
                <button
                  key={rel.label}
                  type="button"
                  onClick={() => setRelationship(rel.label)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    relationship === rel.label
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-1">{rel.emoji}</span>
                  {rel.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. MESSAGE & ATMOSPHERE PRESETS */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              Instant Message & Good Vibes Tone
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              {MESSAGE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSelectedPresetIdx(idx)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedPresetIdx === idx
                      ? 'border-rose-500 bg-white dark:bg-slate-800 shadow-md ring-1 ring-rose-500/30'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-850 hover:bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {preset.label}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                    &ldquo;{preset.message}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Floating Preview Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-[32px] bg-white dark:bg-slate-850 border-2 border-slate-200/80 dark:border-slate-750 shadow-2xl overflow-hidden relative">
            {/* Top Preview Banner */}
            <div
              className={`p-6 relative text-white transition-all duration-500 overflow-hidden`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #f43f5e)`,
              }}
            >
              {/* Floating micro stickers */}
              <div className="absolute top-3 right-3 text-2xl animate-float">
                {selectedVibe.emoji}
              </div>

              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/25 backdrop-blur-xs mb-3">
                Live Surprise Preview
              </span>

              <h3 className="text-2xl font-black drop-shadow-xs truncate">
                {recipientName || 'Alex'}&apos;s Birthday 🎂
              </h3>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                From: {senderName || 'Jordan'} • {relationship}
              </p>

              {age && (
                <div className="mt-3 inline-block px-3 py-1 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-bold">
                  ★ Turning {age} & Thriving ★
                </div>
              )}
            </div>

            {/* Preview Card Body */}
            <div className="p-5 space-y-4 bg-white dark:bg-slate-900">
              {/* Unboxing Teaser */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-sm">
                  🎁
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    3D Interactive Gift Box
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {recipientName} taps to unwrap confetti & music
                  </p>
                </div>
              </div>

              {/* Message Snippet */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-rose-500 mb-1">
                  {MESSAGE_PRESETS[selectedPresetIdx].header}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {MESSAGE_PRESETS[selectedPresetIdx].message}
                </p>
              </div>

              {/* Secret Note Teaser */}
              <div className="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-center">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                  🔒 Confidential Note Included
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleCreateAndOpenEditor}
                  disabled={isCreating}
                  className="w-full py-4 rounded-2xl font-black text-white text-sm shadow-xl transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #f43f5e)`,
                    boxShadow: `0 8px 24px -4px ${primaryColor}77`,
                  }}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>
                    {isCreating ? 'Generating Magic... ✨' : 'Launch In Visual Studio 🚀'}
                  </span>
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  ✨ No sign-up required • 100% Free • Ready to share on WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

