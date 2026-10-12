'use client';

import React, { useState } from 'react';
import { BirthdayWishData } from '@/types/birthday';
import { GiftBoxScreen } from '../surprise/GiftBoxScreen';
import { InteractiveCake } from '../surprise/InteractiveCake';
import { MakeAWishModal } from '../surprise/MakeAWishModal';
import { SecretNoteCard } from '../surprise/SecretNoteCard';
import { PhotoGallery } from '../surprise/PhotoGallery';
import { MemoryTimeline } from '../surprise/MemoryTimeline';
import { BackgroundEffects } from '../surprise/BackgroundEffects';
import { MusicPlayerBar } from '../surprise/MusicPlayerBar';
import { triggerConfettiBurst, triggerSideCannons } from '@/lib/confetti';
import { birthdayAudio } from '@/lib/audio';
import {
  Sparkles,
  Heart,
  PartyPopper,
  Share2,
  Calendar,
  Gift,
  Smile,
  Flame,
  Award,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface BirthdayPageRendererProps {
  wish: BirthdayWishData;
  isPreview?: boolean;
}

export const BirthdayPageRenderer: React.FC<BirthdayPageRendererProps> = ({
  wish,
  isPreview = false,
}) => {
  // If previewing or testing, start in opened state unless user requested to test gift reveal
  const [hasOpenedGift, setHasOpenedGift] = useState<boolean>(!wish.enableGiftBox);
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);

  const handleOpenSurprise = () => {
    setHasOpenedGift(true);
    // Auto-start music if enabled
    if (wish.music?.enabled) {
      birthdayAudio.resume(wish.music.customAudioUrl);
    }
  };

  const handleCelebrateClick = () => {
    triggerConfettiBurst();
    triggerSideCannons();
    birthdayAudio.playWishChime();
  };

  const template = wish.template || 'pastel';
  const primaryColor = wish.primaryColor || '#ec4899';

  // Apply template-specific font class
  const fontClass =
    wish.fontStyle === 'handwriting'
      ? 'font-handwriting'
      : wish.fontStyle === 'serif'
      ? 'font-serif-luxury'
      : wish.fontStyle === 'playful'
      ? 'font-playful'
      : wish.fontStyle === 'modern'
      ? 'font-modern'
      : 'font-sans';

  // Template container styles
  const getTemplateContainerClasses = () => {
    switch (template) {
      case 'cinematic':
        return 'bg-slate-950 text-slate-100 min-h-screen selection:bg-amber-500 selection:text-black';
      case 'scrapbook':
        return 'bg-[#faf6ee] text-amber-950 min-h-screen paper-texture';
      case 'minimal':
        return 'bg-[#fcfbf9] text-stone-900 min-h-screen';
      case 'funny':
        return 'bg-gradient-to-br from-amber-50 via-rose-50 to-cyan-50 text-slate-900 min-h-screen';
      case 'bestfriends':
        return 'bg-gradient-to-br from-teal-50 via-pink-50 to-emerald-50 text-slate-800 min-h-screen';
      case 'pastel':
      default:
        return 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 text-slate-800 min-h-screen';
    }
  };

  return (
    <div className={`${getTemplateContainerClasses()} ${fontClass} relative transition-colors duration-500`}>
      {/* Background Animated Floating Effects (Balloons, Stars, etc.) */}
      <BackgroundEffects effect={wish.backgroundEffect} primaryColor={primaryColor} />

      {/* Opening Screen (Gift Box Surprise) */}
      {!hasOpenedGift && wish.enableGiftBox && (
        <GiftBoxScreen
          recipientName={wish.recipientName}
          senderName={wish.senderName}
          template={template}
          primaryColor={primaryColor}
          onOpen={handleOpenSurprise}
        />
      )}

      {/* Floating Music Player Dock */}
      {hasOpenedGift && (
        <MusicPlayerBar music={wish.music} primaryColor={primaryColor} />
      )}

      {/* Make A Wish Interactive Modal */}
      <MakeAWishModal
        isOpen={isWishModalOpen}
        onClose={() => setIsWishModalOpen(false)}
        recipientName={wish.recipientName}
        primaryColor={primaryColor}
      />

      {/* Main Birthday Celebration Content (Rendered after gift box opens or in preview) */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Template Header / Hero Section */}
        {template === 'cinematic' && (
          <header className="text-center pt-8 pb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              Special Birthday Premiere
            </div>
            <h1 className="text-4xl md:text-7xl font-serif-luxury font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 mb-4">
              Happy Birthday, {wish.recipientName}!
            </h1>
            {wish.age && (
              <p className="text-lg md:text-xl text-amber-200/80 font-serif-luxury italic mb-4">
                Celebrating {wish.age} Remarkable Years of Excellence
              </p>
            )}
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
              Presented with admiration & warmest thoughts by{' '}
              <span className="text-amber-300 font-semibold">{wish.senderName}</span>
            </p>
          </header>
        )}

        {template === 'scrapbook' && (
          <header className="text-center pt-6 pb-10 relative">
            {/* Scrapbook Stamps & Doodles */}
            <div className="absolute top-2 right-4 md:right-16 transform rotate-6 border-2 border-dashed border-amber-700/50 p-2 rounded-lg bg-amber-100/60 shadow-sm hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                POSTAGE • SPECIAL DELIVERY
              </span>
            </div>
            <div className="inline-block px-4 py-1 rounded-full bg-amber-200/60 text-amber-900 text-xs font-bold uppercase tracking-widest mb-4">
              ✨ Handcrafted with Love
            </div>
            <h1 className="text-4xl md:text-6xl font-handwriting font-bold text-amber-950 mb-3">
              Happy Birthday, Dearest {wish.recipientName}! 🎈
            </h1>
            <p className="text-lg md:text-xl font-handwriting text-amber-800/90 max-w-md mx-auto">
              A scrapbook dedicated to our sweetest memories, from {wish.senderName}
            </p>
          </header>
        )}

        {template === 'funny' && (
          <header className="text-center pt-6 pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-300 text-slate-900 font-black text-xs uppercase tracking-wider shadow-md transform -rotate-1 mb-4">
              <Smile className="w-4 h-4" /> Official Warning: Another Year Older!
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-3 tracking-tight">
              WOOHOO {wish.recipientName}! 🎉
            </h1>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-xl bg-rose-400 text-white font-bold text-xs shadow-xs">
                Level {wish.age || 'Up'} Unlocked! 🎮
              </span>
              <span className="px-3 py-1 rounded-xl bg-cyan-400 text-slate-900 font-bold text-xs shadow-xs">
                Zero Complaints Allowed Today 😎
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-900 font-bold text-xs shadow-xs">
                Certified Legend 🏆
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Compliments and roasts carefully prepared by {wish.senderName}
            </p>
          </header>
        )}

        {template === 'minimal' && (
          <header className="text-center pt-8 pb-12 border-b border-stone-200">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-4 font-semibold">
              The Celebration of {wish.recipientName}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif-luxury font-normal text-stone-900 tracking-tight mb-4">
              Happy Birthday.
            </h1>
            <p className="text-stone-500 text-sm max-w-sm mx-auto font-light leading-relaxed">
              Wishing you another year of quiet elegance, deep fulfillment, and boundless horizons.
              Sent by {wish.senderName}.
            </p>
          </header>
        )}

        {template === 'bestfriends' && (
          <header className="text-center pt-6 pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs uppercase tracking-widest mb-4">
              <Heart className="w-3.5 h-3.5 fill-teal-600" /> Inseparable Friends Forever
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-3">
              To My Favorite Person, {wish.recipientName}! 💖
            </h1>
            <p className="text-base text-slate-600 max-w-lg mx-auto">
              Life is 1,000x sweeter with you by my side. Happy Birthday from your partner-in-crime,{' '}
              <span className="font-bold text-teal-700">{wish.senderName}</span>!
            </p>
          </header>
        )}

        {template === 'pastel' && (
          <header className="text-center pt-6 pb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-xs"
              style={{
                backgroundColor: `${primaryColor}22`,
                color: primaryColor,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              A Very Special Birthday Wish
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3">
              Happy Birthday, {wish.recipientName}! 🌸
            </h1>
            <p className="text-base opacity-75 max-w-md mx-auto">
              Sending you clouds of happiness, sweet moments, and endless love from {wish.senderName}.
            </p>
          </header>
        )}

        {/* Heartfelt Main Birthday Letter Card */}
        <section className="my-8 max-w-2xl mx-auto">
          <div
            className={`rounded-3xl p-6 md:p-10 shadow-xl border relative overflow-hidden ${
              template === 'cinematic'
                ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                : template === 'scrapbook'
                ? 'bg-[#fefaf3] border-amber-200 text-amber-950 font-handwriting text-2xl'
                : template === 'minimal'
                ? 'bg-white border-stone-200 text-stone-800'
                : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/60 text-slate-800 dark:text-slate-100'
            }`}
          >
            {/* Top decorative badge */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/5 dark:border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                A Message From The Heart
              </span>
              <span className="text-xs opacity-50 font-medium">
                {wish.relationship || 'Celebration'}
              </span>
            </div>

            {/* Main Greeting Headline */}
            {wish.greetingHeader && (
              <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                {wish.greetingHeader}
              </h3>
            )}

            {/* Main Letter Body */}
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-line opacity-90">
              {wish.mainMessage}
            </p>

            {/* Signature */}
            <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold opacity-75">Always cheering for you,</span>
              <span className="text-base md:text-lg font-bold" style={{ color: primaryColor }}>
                {wish.senderName} ❤️
              </span>
            </div>
          </div>
        </section>

        {/* Interactive Cake & Candles */}
        {wish.enableCake && (
          <section className="my-10">
            <InteractiveCake
              primaryColor={primaryColor}
              recipientName={wish.recipientName}
              age={wish.age}
              onAllCandlesBlown={() => {}}
            />
          </section>
        )}

        {/* Photo Gallery & Polaroids */}
        {wish.enablePhotoGallery && wish.photos && wish.photos.length > 0 && (
          <PhotoGallery
            photos={wish.photos}
            template={template}
            primaryColor={primaryColor}
          />
        )}

        {/* Memory Timeline Journey */}
        {wish.enableTimeline && wish.timeline && wish.timeline.length > 0 && (
          <MemoryTimeline
            timeline={wish.timeline}
            primaryColor={primaryColor}
            template={template}
          />
        )}

        {/* Secret Note Envelope / Flip Card */}
        {wish.enableSecretNote && wish.secretNote && (
          <SecretNoteCard
            secretNote={wish.secretNote}
            senderName={wish.senderName}
            primaryColor={primaryColor}
          />
        )}

        {/* Interactive "Make a Wish" & "Celebrate" CTA Bar */}
        <section className="mt-14 mb-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {wish.enableMakeAWish && (
            <button
              onClick={() => setIsWishModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #f59e0b)`,
                boxShadow: `0 8px 25px -4px ${primaryColor}66`,
              }}
            >
              <Star className="w-5 h-5 fill-white" />
              <span>Make A Secret Wish ✨</span>
            </button>
          )}

          <button
            onClick={handleCelebrateClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PartyPopper className="w-5 h-5 text-rose-500" />
            <span>Shower With Confetti! 🎉</span>
          </button>
        </section>

        {/* Footer Brand Banner */}
        <footer className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 text-center">
          <p className="text-xs opacity-60">
            Crafted with love for {wish.recipientName} • Happy Birthday!
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
            >
              <Gift className="w-3.5 h-3.5 text-rose-500" />
              Create your own Birthday Surprise for free on BirthdayMagic ✨
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
};
