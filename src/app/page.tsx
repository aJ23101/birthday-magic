'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATES, SAMPLE_PHOTOS } from '@/data/templates';
import { BirthdayWishData, TemplateType } from '@/types/birthday';
import { saveWish, generateSlug, uploadMediaFile } from '@/lib/storage';
import { triggerConfettiBurst } from '@/lib/confetti';
import { birthdayAudio } from '@/lib/audio';
import { supabase } from '@/lib/supabase';
import {
  Gift,
  Sparkles,
  ArrowRight,
  Heart,
  Share2,
  Music,
  Flame,
  Camera,
  CheckCircle2,
  ChevronRight,
  Smile,
  PartyPopper,
  Star,
  ExternalLink,
  Upload,
  Play,
  Menu,
  X,
  Palette,
  Eye,
  Check,
  TrendingUp,
  SmilePlus,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Could not sign out from BirthdayMagic:', error);
    else setProfileMenuOpen(false);
  };

  // Quick Creation Form State
  const [recipientName, setRecipientName] = useState('Maya');
  const [senderName, setSenderName] = useState('Liam');
  const [birthdayMessage, setBirthdayMessage] = useState(
    "Happy Birthday! Today is all about celebrating the wonderful, radiant human you are. Thank you for your warmth, endless laughs, and for always being by my side. Here is to your happiest year yet! 🎂✨"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('pastel');
  const [primaryColor, setPrimaryColor] = useState('#ec4899');
  const [selectedTrack, setSelectedTrack] = useState<'celebration' | 'lofi' | 'party'>('celebration');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sound test
  const [isPlayingTune, setIsPlayingTune] = useState(false);

  const toggleTune = () => {
    if (isPlayingTune) {
      birthdayAudio.pause();
      setIsPlayingTune(false);
    } else {
      birthdayAudio.resume();
      setIsPlayingTune(true);
      setTimeout(() => {
        birthdayAudio.pause();
        setIsPlayingTune(false);
      }, 5000);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMediaFile(file, 'photos');
      setUploadedPhotos((prev) => [url, ...prev].slice(0, 4));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSurprise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    triggerConfettiBurst();

    const slug = generateSlug(recipientName || 'birthday');
    const newWish: BirthdayWishData = {
      id: `wish-${Date.now()}`,
      slug,
      recipientName: recipientName.trim() || 'Someone Special',
      senderName: senderName.trim() || 'A Secret Friend',
      relationship: 'Friend',
      greetingHeader: `Happy Birthday, ${recipientName || 'Special Someone'}! 🎂✨`,
      mainMessage: birthdayMessage,
      secretNote: 'Secret note: You are genuinely one of the sweetest people in the whole world. Never change! 💖',
      template: selectedTemplate,
      primaryColor,
      fontStyle: selectedTemplate === 'scrapbook' ? 'handwriting' : selectedTemplate === 'cinematic' || selectedTemplate === 'minimal' ? 'serif' : 'playful',
      backgroundEffect: selectedTemplate === 'cinematic' ? 'stars' : selectedTemplate === 'pastel' ? 'hearts' : 'balloons',
      photos: uploadedPhotos.map((url, i) => ({
        id: `p-${i}`,
        url,
        caption: i === 0 ? 'Pure joy & celebration ✨' : 'Unforgettable golden memories 🌟',
        dateOrTag: 'Cherished Moment',
      })),
      timeline: [
        {
          id: 't-1',
          yearOrDate: 'Chapter 1',
          title: 'When Our Paths Crossed',
          description: 'The beginning of endless laughter and legendary conversations.',
        },
      ],
      music: {
        trackId: selectedTrack,
        trackTitle: 'Birthday Melody',
        enabled: true,
      },
      enableGiftBox: true,
      enableCake: true,
      enableMakeAWish: true,
      enablePhotoGallery: true,
      enableTimeline: true,
      enableSecretNote: true,
      enableSoundFx: true,
      isPublished: false,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const savedWish = await saveWish(newWish);
      router.push(`/editor?id=${savedWish.id}`);
    } catch {
      router.push('/editor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 selection:bg-rose-500 selection:text-white">
      {/* 1. NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-[#faf7f2]/90 backdrop-blur-md border-b border-rose-100/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo & Subtitle */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block">
                Birthday<span className="text-rose-500">Magic</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500/90 block -mt-1">
                Good Vibes Studio ✨
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#templates" className="hover:text-rose-600 transition-colors">
              Templates
            </a>
            <a href="#create" className="hover:text-rose-600 transition-colors">
              Create Website
            </a>
            <Link href="/dashboard" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span>My Creations</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </Link>
            {!userEmail && <Link href="/login" className="hover:text-rose-600 transition-colors">Login / Sign Up</Link>}
          </div>

          {/* Nav Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-colors"
            >
              Dashboard
            </Link>
            {userEmail ? (
              <div className="relative">
                <button type="button" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-rose-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">{userEmail.slice(0, 1).toUpperCase()}</span>
                  <span>My Account</span>
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <p className="truncate px-3 py-2 text-xs text-slate-500">{userEmail}</p>
                    <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-rose-50">Dashboard</Link>
                    <Link href="/dashboard#surprises" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-rose-50">My Creations</Link>
                    <Link href="/dashboard#account" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-rose-50">Account Settings</Link>
                    <button type="button" onClick={() => void handleSignOut()} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-colors">
                Login / Sign Up
              </Link>
            )}
            <a
              href="#create"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/25 transition-all hover:scale-102 active:scale-98 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create a Birthday Website</span>
            </a>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-white/80"
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-rose-100 bg-white p-5 space-y-3 shadow-xl">
            <a
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-1"
            >
              Templates
            </a>
            <a
              href="#create"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-1"
            >
              Create Website
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-1"
            >
              My Creations
            </Link>
            {userEmail ? (
              <>
                <Link href="/dashboard#account" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">Account Settings ({userEmail})</Link>
                <button type="button" onClick={() => { setMobileMenuOpen(false); void handleSignOut(); }} className="block text-sm font-semibold text-rose-600 py-1">Logout</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Login / Sign Up
              </Link>
            )}
            <Link
              href="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-rose-500 py-1"
            >
              Open Visual Studio 🚀
            </Link>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
        {/* Soft background ambient gradient glows */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              YOUR PERSONALIZED DIGITAL GIFT
            </div>

            {/* Large Expressive Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight text-slate-900 leading-[1.08]">
              Make Their Birthday{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 underline decoration-rose-300 decoration-wavy decoration-2">
                Unforgettable.
              </span>
            </h1>

            {/* Short Supporting Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Create a personalized birthday website filled with photos, heartfelt messages, music,
              and little surprises. No coding required.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#create"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 shadow-xl shadow-rose-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Your Surprise</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="#templates"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Explore Templates</span>
              </a>

              <Link
                href="/w/alex-special-celebration"
                target="_blank"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-xs text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </Link>
            </div>

            {/* Trust Indicator */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Takes under 2 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No sign-up required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free to share
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Browser Mockup Preview (5 Cols) */}
          <div className="lg:col-span-5 relative">
            {/* Floating Decorative Elements */}
            <div className="absolute -top-6 -right-4 text-3xl animate-float z-20">🎈</div>
            <div className="absolute top-1/2 -left-8 text-2xl animate-float z-20">✨</div>
            <div className="absolute -bottom-4 right-8 text-3xl animate-float z-20">🎉</div>

            {/* Browser-style Card Window */}
            <div className="browser-mockup relative z-10 border border-slate-200 bg-white">
              {/* Window Titlebar */}
              <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="px-3 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono text-slate-500 truncate max-w-[190px]">
                  birthdaymagic.com/w/maya-24th
                </div>
                <div className="w-6" />
              </div>

              {/* Browser Webpage Content */}
              <div className="p-6 bg-gradient-to-b from-pink-50/80 via-white to-amber-50/30 space-y-5 text-center relative overflow-hidden">
                {/* Birthday Ribbon */}
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                  Happy 24th Birthday! 🎂
                </span>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Maya&apos;s Special Day ✨
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto line-clamp-2">
                  &ldquo;To the sweetest soul and brightest smile in the universe. Today is all about YOU!&rdquo;
                </p>

                {/* Illustrated Cake with Flame */}
                <div className="w-24 h-24 mx-auto relative flex flex-col items-center justify-end">
                  {/* Flickering Flame */}
                  <div className="w-3 h-5 rounded-full bg-gradient-to-t from-orange-500 to-yellow-300 shadow-lg shadow-amber-400/80 animate-flame mb-0.5" />
                  <div className="w-1.5 h-4 bg-amber-400 rounded-t-sm" />
                  <div className="w-16 h-8 bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 rounded-t-xl border-b-2 border-rose-300 shadow-sm" />
                  <div className="w-20 h-9 bg-gradient-to-r from-amber-200 via-rose-100 to-amber-200 rounded-t-xl shadow-md" />
                </div>

                {/* Overlapping Polaroid Cards */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="w-24 p-1.5 pb-3 bg-white rounded-xl polaroid-shadow border border-slate-100 transform -rotate-4">
                    <img
                      src={uploadedPhotos[0]}
                      alt="Polaroid 1"
                      className="w-full h-16 object-cover rounded-lg"
                    />
                    <p className="text-[9px] font-handwriting text-slate-700 mt-1">Best times 💖</p>
                  </div>

                  <div className="w-24 p-1.5 pb-3 bg-white rounded-xl polaroid-shadow border border-slate-100 transform rotate-3">
                    <img
                      src={uploadedPhotos[1]}
                      alt="Polaroid 2"
                      className="w-full h-16 object-cover rounded-lg"
                    />
                    <p className="text-[9px] font-handwriting text-slate-700 mt-1">Golden smile ✨</p>
                  </div>
                </div>

                {/* Bottom Unbox Trigger Pill */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-slate-900 text-white shadow-md">
                    <span>Open Your Surprise 🎁</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT BENEFITS */}
      <section className="py-8 bg-white border-y border-rose-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <p className="text-lg font-black text-rose-500">No coding</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                Required
              </p>
            </div>
            <div className="p-3">
              <p className="text-lg font-black text-amber-500">6 templates</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                Personalizable
              </p>
            </div>
            <div className="p-3">
              <p className="text-lg font-black text-purple-500">Photos, music</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                And heartfelt notes
              </p>
            </div>
            <div className="p-3">
              <p className="text-lg font-black text-teal-500">Shareable</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                Birthday websites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TEMPLATE GALLERY: "FIND YOUR BIRTHDAY VIBE" */}
      <section id="templates" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2 block">
            Tailored To Every Personality
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Find Your Birthday Vibe
          </h2>
          <p className="text-base text-slate-600 max-w-md mx-auto mt-2">
            Choose from 6 unique, fully customizable aesthetic templates with custom animations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="magic-card p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Distinct Rendered Thumbnail */}
                <div
                  className={`h-48 rounded-2xl bg-gradient-to-br ${tpl.previewGradient} p-4 flex flex-col justify-between shadow-inner relative overflow-hidden mb-5`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 shadow-xs">
                      {tpl.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-800/80">
                      {tpl.tagline}
                    </span>
                  </div>

                  <div className="z-10 text-slate-900">
                    <h4 className="text-xl font-black drop-shadow-xs">{tpl.name}</h4>
                    <p className="text-xs font-medium opacity-85 mt-0.5">{tpl.vibe}</p>
                  </div>

                  {/* Template aesthetic accents */}
                  <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-white/30 blur-lg pointer-events-none" />
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-lg font-bold text-slate-900">{tpl.name}</h3>
                  <span className="text-xs font-semibold text-rose-500">6 layouts</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {tpl.description}
                </p>
              </div>

              {/* CTA button */}
              <Link
                href={`/editor?template=${tpl.id}`}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-center text-slate-800 bg-slate-100 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1.5 group-hover:bg-rose-500 group-hover:text-white shadow-xs"
              >
                <span>Customize This Template</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CREATION SECTION (Clean, Card-Based Creation Interface) */}
      <section id="create" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="magic-card p-6 sm:p-10 border-2 border-rose-200/80 shadow-2xl relative overflow-hidden bg-white">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 mb-2">
              <Gift className="w-3.5 h-3.5" /> Quick Birthday Creator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Craft Your Personalized Website
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Fill in the details below to generate a beautiful, shareable birthday experience.
            </p>
          </div>

          <form onSubmit={handleCreateSurprise} className="space-y-6">
            {/* Row 1: Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Recipient&apos;s Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Maya, Jordan"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Your Name (Sender) *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Liam, Your Bestie"
                  className="w-full"
                />
              </div>
            </div>

            {/* Row 2: Heartfelt Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Birthday Message *
              </label>
              <textarea
                required
                rows={4}
                value={birthdayMessage}
                onChange={(e) => setBirthdayMessage(e.target.value)}
                placeholder="Write your heartfelt birthday wishes..."
                className="w-full leading-relaxed"
              />
            </div>

            {/* Row 3: Template Selector & Accent Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                  className="w-full font-semibold"
                >
                  <option value="pastel">Pastel Dreams (Dreamy & Soft)</option>
                  <option value="scrapbook">Memory Lane (Vintage Polaroid)</option>
                  <option value="cinematic">Midnight Celebration (Luxury VIP)</option>
                  <option value="minimal">Minimal Elegance (Editorial)</option>
                  <option value="funny">Funny Birthday (Roast & Laughs)</option>
                  <option value="bestfriends">Best Friends Forever (Friendship Reel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Theme Accent Color
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {['#ec4899', '#f43f5e', '#8b5cf6', '#3b82f6', '#0d9488', '#f59e0b'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      style={{ backgroundColor: color }}
                      aria-label={`Use ${color} as accent color`}
                      aria-pressed={primaryColor === color}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        primaryColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer p-0"
                    title="Custom Color"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Photo Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Memorable Photos (Up to 4)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-2xl overflow-hidden border border-slate-200 relative group bg-slate-100"
                  >
                    <img src={url} alt={`Memory ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label={`Remove photo ${idx + 1}`}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {uploadedPhotos.length < 4 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-rose-500 mb-1" />
                    <span className="text-[11px] font-bold text-rose-600">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Row 5: Music selection */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Background Birthday Music</p>
                  <p className="text-[11px] text-slate-500">
                    Plays softly upon opening the surprise box
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTune}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>{isPlayingTune ? 'Stop Preview' : 'Test Audio'}</span>
              </button>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, #f43f5e)`,
                  boxShadow: `0 10px 25px -5px ${primaryColor}66`,
                }}
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {isSubmitting ? 'Generating Your Surprise... 🎁' : 'Preview & Publish Website 🚀'}
                </span>
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                You can fine-tune timeline chapters, scratch notes & animations in the next step.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-rose-100/80 bg-white py-12 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-rose-500" />
            <span className="font-extrabold text-base text-slate-800">BirthdayMagic</span>
          </div>
          <p className="max-w-md mx-auto">
            Crafting joyful digital birthday memories that make recipients smile, laugh, and celebrate together.
          </p>
          <div className="flex justify-center gap-6 pt-2 font-semibold text-slate-600">
            <a href="#templates" className="hover:text-rose-600">
              Templates
            </a>
            <Link href="/editor" className="hover:text-rose-600">
              Visual Editor
            </Link>
            <Link href="/dashboard" className="hover:text-rose-600">
              Creations Dashboard
            </Link>
          </div>
          <p className="opacity-60 pt-4">© 2026 BirthdayMagic • Built with love & celebratory confetti ✨</p>
        </div>
      </footer>
    </div>
  );
}
