'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BirthdayWishData } from '@/types/birthday';
import { getUserAcceptedEmailCounts, getUserWishes, deleteWish, saveWish } from '@/lib/storage';
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
  Sparkles,
  ExternalLink,
  LogIn,
  LogOut,
  PartyPopper,
  Copy,
  Check,
  Search,
  Archive,
  Mail,
  LayoutDashboard,
  Settings,
  Clock3,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [wishes, setWishes] = useState<BirthdayWishData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWishForShare, setSelectedWishForShare] = useState<BirthdayWishData | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts' | 'archived'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [emailCounts, setEmailCounts] = useState<Awaited<ReturnType<typeof getUserAcceptedEmailCounts>>>({ total: 0, byWish: {}, events: [] });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'updated'>('newest');
  const [visibleCount, setVisibleCount] = useState(9);
  const [detailsWish, setDetailsWish] = useState<BirthdayWishData | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountFeedback, setAccountFeedback] = useState<string | null>(null);

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadWishes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          setUserEmail(null);
          setWishes([]);
          setEmailCounts({ total: 0, byWish: {}, events: [] });
          return;
        }
        setUserEmail(user.email || null);
        setAccountName(typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : '');
        const [data, sends] = await Promise.all([getUserWishes(), getUserAcceptedEmailCounts()]);
        setWishes(data);
        setEmailCounts(sends);
        return;
      }

      const data = await getUserWishes();
      setWishes(data);
    } catch (err) {
      console.error(err);
      setLoadError('We could not load your account history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWishes().then(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('importFailed') === '1') {
          setLoadError('You are signed in, but your local drafts could not be imported. They remain saved on this device; please try again.');
        } else if (Number(params.get('imported')) > 0) {
          setAccountFeedback(`${params.get('imported')} local draft(s) were imported to your account.`);
        }
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWishes]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this birthday website?')) return;

    try {
      await deleteWish(id);
      setWishes((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Could not delete birthday website:', error);
      setLoadError('Could not delete that birthday website. Please try again.');
    }
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

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLoadError('Could not sign out. Please try again.');
        return;
      }
      setUserEmail(null);
      setWishes([]);
      setEmailCounts({ total: 0, byWish: {}, events: [] });
    }
  };

  const handleSaveAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setAccountFeedback('Please sign in again to update your account.');
      return;
    }
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: accountName.trim() });
    if (profileError) {
      console.error('Could not save profile:', profileError);
      setAccountFeedback('Could not save your account settings.');
      return;
    }
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { full_name: accountName.trim() },
    });
    if (metadataError) console.error('Could not update account display name:', metadataError);
    setAccountFeedback('Account settings saved.');
  };

  const totalViews = wishes.reduce((acc, wish) => acc + (
    wish.isPublished && !wish.isArchived ? wish.viewsCount || 0 : 0
  ), 0);
  const publishedCount = wishes.filter((wish) => wish.isPublished && !wish.isArchived).length;

  const filteredWishes = wishes.filter((w) => {
    if (filter === 'archived') return Boolean(w.isArchived);
    if (filter === 'published') return w.isPublished && !w.isArchived;
    if (filter === 'drafts') return !w.isPublished && !w.isArchived;
    return !w.isArchived;
  }).filter((wish) => wish.recipientName.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      const first = sortOrder === 'updated' ? a.updatedAt : a.createdAt;
      const second = sortOrder === 'updated' ? b.updatedAt : b.createdAt;
      const difference = new Date(second).getTime() - new Date(first).getTime();
      return sortOrder === 'oldest' ? -difference : difference;
    });

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 py-12 text-slate-800">
        <section className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><Gift className="h-8 w-8" /></div>
          <h1 className="text-3xl font-black">My Birthday Dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Connect Supabase to sign in and see your saved birthday surprises and accurate account statistics.</p>
          <Link href="/login" className="mt-6 inline-flex items-center justify-center rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white hover:bg-rose-600">Account setup</Link>
          <Link href="/" className="mt-4 block text-sm font-semibold text-slate-500 hover:text-rose-600">Back to BirthdayMagic</Link>
        </section>
      </main>
    );
  }

  if (isSupabaseConfigured && !userEmail && !loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 py-12 text-slate-800">
        <section className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><Gift className="h-8 w-8" /></div>
          <h1 className="text-3xl font-black">Your Birthday Dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Log in to access your private birthday surprises, email history, and saved drafts.</p>
          <Link href="/login" className="mt-6 inline-flex items-center justify-center rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white hover:bg-rose-600">Login or create an account</Link>
          <Link href="/" className="mt-4 block text-sm font-semibold text-slate-500 hover:text-rose-600">Back to BirthdayMagic</Link>
        </section>
      </main>
    );
  }

  const handleArchive = async (wish: BirthdayWishData) => {
    try {
      const updated = await saveWish({ ...wish, isArchived: !wish.isArchived });
      setWishes((current) => current.map((item) => item.id === wish.id ? updated : item));
    } catch (error) {
      console.error('Could not update birthday archive status:', error);
      setLoadError('Could not update the archive status. Please try again.');
    }
  };

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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 font-black uppercase text-rose-600" aria-label={`Signed in as ${userEmail}`}>
                {userEmail.slice(0, 1)}
              </span>
              <span className="hidden md:inline">Logged in as {userEmail}</span>
              <a href="#account" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Account settings" title="Account settings"><Settings className="h-4 w-4" /></a>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Sign Up</span>
            </Link>
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
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-8 md:py-12 flex gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-28 space-y-2 rounded-2xl border border-rose-100 bg-white p-3 shadow-sm" aria-label="Dashboard navigation">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-700"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
            <a href="#surprises" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Gift className="h-4 w-4" /> My Creations</a>
            <Link href="/#templates" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Sparkles className="h-4 w-4" /> Templates</Link>
            <a href="#account" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Settings className="h-4 w-4" /> Account Settings</a>
            {userEmail && <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4" /> Logout</button>}
          </nav>
        </aside>
        <div className="min-w-0 flex-1 space-y-10">
        {/* Good Vibes Hero Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              My Birthday Dashboard
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
              All the little surprises you&apos;ve sent, in one place.
            </p>
          </div>

        </div>

        {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError} <button type="button" onClick={() => void loadWishes()} className="ml-2 font-bold underline">Retry</button></div>}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Birthday dashboard statistics">
          {[
            { label: 'Total Surprises Created', value: wishes.length, icon: <Gift className="h-4 w-4" />, color: 'bg-pink-100 text-pink-600' },
            { label: 'Published Websites', value: publishedCount, icon: <ExternalLink className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Emails Sent', value: emailCounts.total, icon: <Mail className="h-4 w-4" />, color: 'bg-amber-100 text-amber-600' },
            { label: 'Total Views', value: totalViews, icon: <Eye className="h-4 w-4" />, color: 'bg-purple-100 text-purple-600' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${metric.color}`}>{metric.icon}</div>
              <p className="text-2xl font-black">{loading ? '—' : metric.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{metric.label}</p>
            </div>
          ))}
        </section>

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

        {userEmail && (
          <section id="account" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Account Settings</h2>
            <p className="mt-1 text-sm text-slate-500">{userEmail}</p>
            <form onSubmit={handleSaveAccount} className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Full name</span>
                <input value={accountName} onChange={(event) => setAccountName(event.target.value)} maxLength={100} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <button type="submit" className="self-end rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Save</button>
            </form>
            {accountFeedback && <p role="status" className="mt-3 text-sm text-slate-600">{accountFeedback}</p>}
          </section>
        )}

        {/* 3. YOUR CELEBRATIONS GALLERY */}
        <div id="surprises" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Your Birthday Surprises</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your saved birthday websites, drafts, and email history.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input aria-label="Search recipients" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(9); }} placeholder="Search recipient" className="w-36 border-0 bg-transparent text-xs outline-none" />
              </label>
              <select aria-label="Sort birthday websites" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="updated">Recently updated</option>
              </select>
            </div>
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
              <button
                onClick={() => setFilter('archived')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'archived' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Archived
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
              <h3 className="text-lg font-bold mb-1">{wishes.length === 0 ? 'No birthday surprises yet!' : 'No surprises match these filters'}</h3>
              <p className="text-xs text-slate-500 mb-6">
                {wishes.length === 0
                  ? 'Create your first personalized birthday website and make someone&apos;s day special.'
                  : 'Try changing your search or status filter.'}
              </p>
              {wishes.length === 0 && <Link href="/editor" className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white hover:bg-rose-600"><Plus className="h-4 w-4" /> Create Birthday Surprise</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWishes.slice(0, visibleCount).map((item) => (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
                >
                  {/* Card Banner Preview */}
                  <div className="h-36 relative overflow-hidden bg-slate-100"
                  >
                    {item.photos?.[0]?.url ? <img src={item.photos[0].url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${item.primaryColor || '#ec4899'}, #f43f5e)` }} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-between overflow-hidden text-white">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/25 backdrop-blur-xs capitalize">
                        {item.template} theme
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-900 shadow-xs">
                        {item.isArchived ? 'Archived' : item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="z-10">
                      <h3 className="text-xl font-black drop-shadow-xs truncate">
                        {item.greetingHeader || `${item.recipientName}'s Birthday 🎂`}
                      </h3>
                      <p className="text-xs text-white/90 font-medium mt-0.5">
                        From: {item.senderName} • {item.relationship || 'Celebration'}
                      </p>
                    </div>

                    {/* Ambient Glow */}
                    <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/20 blur-xl pointer-events-none" />
                    </div>
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
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500"><Clock3 className="h-3 w-3" /> Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500"><Mail className="h-3 w-3" /> {emailCounts.byWish[item.id] || 0} provider-accepted emails</p>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.mainMessage}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Link
                        href={item.isPublished ? `/w/${item.slug}` : `/editor?id=${item.id}`}
                        target={item.isPublished ? '_blank' : undefined}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>

                      <Link
                        href={`/editor?id=${item.id}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      {item.isPublished && (
                        <>
                          <button
                            onClick={(e) => handleCopyLink(item.slug, e)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Copy direct share link"
                            aria-label="Copy birthday website link"
                          >
                            {copiedSlug === item.slug ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setSelectedWishForShare(item)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Share on WhatsApp, email, and QR Code"
                            aria-label="Share birthday website"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setDetailsWish(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50"
                        title="View sending history"
                        aria-label={`View details for ${item.recipientName}`}
                      >
                        <Mail className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleArchive(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50"
                        title={item.isArchived ? 'Restore from archive' : 'Archive creation'}
                        aria-label={item.isArchived ? 'Restore from archive' : 'Archive creation'}
                      >
                        <Archive className="w-4 h-4" />
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
          {!loading && filteredWishes.length > visibleCount && (
            <button type="button" onClick={() => setVisibleCount((count) => count + 9)} className="mx-auto block rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Load more</button>
          )}
        </div>
        </div>
      </main>

      {/* Share Modal Dialog */}
      {selectedWishForShare && (
        <ShareModal
          isOpen={true}
          onClose={() => setSelectedWishForShare(null)}
          wish={selectedWishForShare}
          onEmailSent={() => void loadWishes()}
        />
      )}

      {detailsWish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="send-history-title">
          <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="send-history-title" className="text-xl font-black">Sending history</h2>
                <p className="mt-1 text-sm text-slate-500">For {detailsWish.recipientName}&apos;s birthday website</p>
              </div>
              <button type="button" onClick={() => setDetailsWish(null)} aria-label="Close sending history" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="mt-5 space-y-3">
              {emailCounts.events.filter((event) => event.birthdayPageId === detailsWish.id).length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No email send attempts recorded yet.</p>
              ) : emailCounts.events.filter((event) => event.birthdayPageId === detailsWish.id).map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm">
                  <div><p className="font-semibold">{event.recipientEmail}</p><p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p></div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${event.status === 'accepted' || event.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{event.status === 'accepted' ? 'Accepted by provider' : event.status}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Email status reflects provider acceptance. Delivery confirmation is not configured.</p>
          </section>
        </div>
      )}
    </div>
  );
}
