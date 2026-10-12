'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BirthdayWishData } from '@/types/birthday';
import { getWishBySlug, incrementViews } from '@/lib/storage';
import { BirthdayPageRenderer } from '@/components/templates/BirthdayPageRenderer';
import { Sparkles, Gift, Home } from 'lucide-react';
import Link from 'next/link';

export default function WishPublicPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [wish, setWish] = useState<BirthdayWishData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function loadData() {
      try {
        const found = await getWishBySlug(slug);
        setWish(found);
        if (found) {
          incrementViews(slug);
        }
      } catch (err) {
        console.error('Error fetching birthday wish:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 text-slate-800 p-4">
        <div className="w-16 h-16 rounded-full border-4 border-pink-400 border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500 animate-bounce" />
          Preparing your birthday surprise...
        </h2>
        <p className="text-sm opacity-60 mt-1">Lighting the candles & wrapping the gift 🎁</p>
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Birthday Surprise Not Found</h1>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          We couldn&apos;t find this celebration link. It might have been moved, or you can create a fresh personalized birthday website right now!
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <Link
            href="/editor"
            className="px-6 py-3 rounded-2xl bg-rose-500 text-white font-bold text-sm shadow-md hover:bg-rose-600 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Create A Birthday Site
          </Link>
        </div>
      </div>
    );
  }

  return <BirthdayPageRenderer wish={wish} isPreview={false} />;
}
