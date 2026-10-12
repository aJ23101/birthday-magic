'use client';

import React, { useEffect, useState } from 'react';
import { BirthdayWishData } from '@/types/birthday';
import { getUserWishes, deleteWish, initLocalSampleWishes } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ShareModal } from '@/components/share/ShareModal';
import { VibeCreatorStudio } from '@/components/dashboard/VibeCreatorStudio';
import { triggerConfettiBurst, triggerSideCannons } from '@/lib/confetti';
import { birthdayAudio } from '@/lib/audio';
import {
  Gift,
  Plus,
  Eye,
  Edit,
  Trash2,
  Share2,
  Calendar,
  Sparkles,
  ExternalLink,
  LogIn,
  LogOut,
  User,
  Heart,
  TrendingUp,
  PartyPopper,
  Smile,
  Music,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [wishes, setWishes] = useState<BirthdayWishData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWishForShare, setSelectedWishForShare] = useState<BirthdayWishData | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  useEffect(() => {
    loadWishes();

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setUserEmail(user.email);
        }
      });
    }
  }, []);

  const loadWishes = async () => {
    try {
      const data = await getUserWishes();
      setWishes(data);
    } catch (err) {
      console.error(err);
      setWishes(initLocalSampleWishes());
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this birthday website?')) return;

    await deleteWish(id);
    setWishes((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard.writeText(`${origin}/w/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleCelebrate = () => {
    triggerConfettiBurst();
    triggerSideCannons();
    birthdayAudio.playWishChime();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setAuthMsg('Supabase is running in local mode. Credentials not configured yet.');
      return;
    }

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMsg('Account created! Please check your email to confirm or sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setUserEmail(data.user?.email || null);
        setShowAuthModal(false);
        loadWishes();
      }
    } catch (err: any) {
      setAuthMsg(err.message || 'Authentication failed');
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
      setUserEmail(null);
    }
  };

  const totalViews = wishes.reduce((acc, w) => acc + (w.viewsCount || 0), 0);

  const filteredWishes = wishes.filter((w) => {
    if (filter === 'published') return w.isPublished;
    if (filter === 'drafts') return !w.isPublished;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Top Application Navbar */}
      <header className="h-20 border-b border-rose-100/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight block">
                Birthday<span className="text-rose-500">Magic</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500/80 block -mt-1">
                Good Vibes Studio ✨
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Confetti cheer button */}
          <button
            onClick={handleCelebrate}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-100/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-200 transition-colors cursor-pointer"
            title="Pop confetti"
          >
            <PartyPopper className="w-4 h-4 text-amber-600" />
            <span>Good Vibes Confetti 🎉</span>
          </button>

          {userEmail ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="hidden md:inline">Logged in as {userEmail}</span>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Sign In / Sync' : 'Guest Mode (Local)'}</span>
            </button>
          )}

          <Link
            href="/editor"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 shadow-md shadow-rose-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open Full Editor</span>
          </Link>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12">
        {/* Good Vibes Hero Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Hello, Sunshine! ☀️
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
              Who is getting showered with love, cakes, and confetti today?
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-black text-xs">
                🎁
              </div>
              <div>
                <p className="text-sm font-black">{wishes.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Created</p>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs">
                👀
              </div>
              <div>
                <p className="text-sm font-black">{totalViews}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. INTERACTIVE VIBE CREATOR STUDIO (The interactive option picker) */}
        <VibeCreatorStudio
          onWishCreated={(newWish) => {
            setWishes((prev) => [newWish, ...prev]);
          }}
        />

        {/* 2. INSPIRATION SPARKLERS */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-rose-100/60 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Good Vibes Pro Tips For Creating Magic
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/30">
              <span className="font-bold text-rose-600 block mb-1">💌 Confidential Note:</span>
              Add a funny childhood memory or secret party location in the locked scratch-note!
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30">
              <span className="font-bold text-amber-600 block mb-1">🎂 Interactive Cake:</span>
              Call them on FaceTime and watch them tap the candles to blow them out live!
            </div>
            <div className="p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100/80 dark:border-teal-900/30">
              <span className="font-bold text-teal-600 block mb-1">📲 WhatsApp Magic:</span>
              Share with 1 click directly to WhatsApp with pre-filled joyful birthday emojis.
            </div>
          </div>
        </div>

        {/* 3. YOUR CELEBRATIONS GALLERY */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Your Birthday Celebrations 💖
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active websites, drafts, and shareable links ready for your friends.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({wishes.length})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'published'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setFilter('drafts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'drafts'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Drafts
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading your joyful creations...</p>
            </div>
          ) : filteredWishes.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-rose-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 text-2xl">
                🎁
              </div>
              <h3 className="text-lg font-bold mb-1">No Celebrations in this list</h3>
              <p className="text-xs text-slate-500 mb-6">
                Use the Vibe Studio above to pick options and build your first personalized website!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWishes.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
                >
                  {/* Card Banner Preview */}
                  <div
                    className="h-36 relative p-5 flex flex-col justify-between overflow-hidden text-white"
                    style={{
                      background: `linear-gradient(135deg, ${item.primaryColor || '#ec4899'}, #f43f5e)`,
                    }}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/25 backdrop-blur-xs capitalize">
                        {item.template} theme
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-900 shadow-xs">
                        {item.isPublished ? 'Live & Ready ✨' : 'Draft'}
                      </span>
                    </div>

                    <div className="z-10">
                      <h3 className="text-xl font-black drop-shadow-xs truncate">
                        {item.recipientName}&apos;s Birthday 🎂
                      </h3>
                      <p className="text-xs text-white/90 font-medium mt-0.5">
                        From: {item.senderName} • {item.relationship || 'Celebration'}
                      </p>
                    </div>

                    {/* Ambient Glow */}
                    <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/20 blur-xl pointer-events-none" />
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Eye className="w-3.5 h-3.5" />
                          {item.viewsCount || 0} visits
                        </span>
                        <span className="text-[11px] opacity-75">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.mainMessage}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Link
                        href={`/w/${item.slug}`}
                        target="_blank"
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Surprise 🎁</span>
                      </Link>

                      <Link
                        href={`/editor?id=${item.id}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={(e) => handleCopyLink(item.slug, e)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Copy direct share link"
                      >
                        {copiedSlug === item.slug ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedWishForShare(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Share on WhatsApp & QR Code"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete creation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Share Modal Dialog */}
      {selectedWishForShare && (
        <ShareModal
          isOpen={true}
          onClose={() => setSelectedWishForShare(null)}
          wish={selectedWishForShare}
        />
      )}

      {/* Supabase Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-1">
              {authMode === 'signin' ? 'Sign In to Your Account' : 'Create Free Account'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Sync your creations across devices with Supabase Cloud
            </p>

            {authMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-medium">
                {authMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors text-sm shadow-md cursor-pointer"
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white underline cursor-pointer"
              >
                {authMode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full py-2 rounded-xl text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
