'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BirthdayWishData, TemplateType } from '@/types/birthday';
import { INITIAL_WISH_DATA, TEMPLATES } from '@/data/templates';
import { getWishById, saveWish, generateSlug } from '@/lib/storage';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { LivePreviewFrame } from '@/components/editor/LivePreviewFrame';
import { ShareModal } from '@/components/share/ShareModal';
import { triggerConfettiBurst } from '@/lib/confetti';
import {
  Sparkles,
  Save,
  Share2,
  ArrowLeft,
  Eye,
  Edit3,
  Check,
  Gift,
  LayoutDashboard,
  Undo2,
  Redo2,
} from 'lucide-react';
import Link from 'next/link';

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wishIdParam = searchParams.get('id');
  const templateParam = searchParams.get('template') as TemplateType | null;

  const [wish, setWish] = useState<BirthdayWishData>(() => {
    const base = { ...INITIAL_WISH_DATA, id: `wish-${Date.now()}` };
    if (templateParam) {
      const tDef = TEMPLATES.find((t) => t.id === templateParam);
      if (tDef) {
        base.template = templateParam;
        base.primaryColor = tDef.defaultPrimaryColor;
        base.fontStyle = tDef.defaultFont;
        base.backgroundEffect = tDef.defaultEffect;
      }
    }
    return base;
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<BirthdayWishData[]>([wish]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Load existing wish if ID is provided
  useEffect(() => {
    if (!wishIdParam) return;

    async function load() {
      const existing = await getWishById(wishIdParam!);
      if (existing) {
        setWish(existing);
        setHistory([existing]);
        setHistoryIndex(0);
      }
    }
    load();
  }, [wishIdParam]);

  const handleWishChange = (updated: BirthdayWishData) => {
    setWish(updated);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), updated]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setWish(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setWish(history[nextIdx]);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveWish(wish);
      showToast('Draft saved successfully! 💾');
    } catch (err) {
      console.error(err);
      showToast('Error saving draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      triggerConfettiBurst();
      const finalSlug = wish.slug || generateSlug(wish.recipientName || 'birthday');
      const publishedWish = {
        ...wish,
        slug: finalSlug,
        isPublished: true,
      };
      setWish(publishedWish);
      await saveWish(publishedWish);
      setIsShareModalOpen(true);
    } catch (err) {
      console.error(err);
      showToast('Error publishing creation');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#faf7f2] text-slate-800 overflow-hidden">
      {/* Top Application Header */}
      <header className="h-16 border-b border-rose-100/80 bg-white/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group text-slate-700 hover:text-rose-500 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight hidden sm:inline">
              Birthday<span className="text-rose-500">Magic</span>
            </span>
          </Link>

          <span className="text-slate-300">/</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              For: {wish.recipientName || 'Someone Special'}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 capitalize">
              {wish.template} theme
            </span>
          </div>
        </div>

        {/* Undo / Redo controls */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              historyIndex > 0 ? 'text-slate-700 hover:bg-white' : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              historyIndex < history.length - 1
                ? 'text-slate-700 hover:bg-white'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View Toggle Buttons */}
        <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMobileTab('edit')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'edit'
                ? 'bg-white text-rose-500 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-white text-rose-500 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black text-white shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${wish.primaryColor || '#ec4899'}, #f43f5e)`,
              boxShadow: `0 4px 14px -2px ${wish.primaryColor || '#ec4899'}88`,
            }}
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Publish & Share 🚀</span>
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-xs shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Split View Editor & Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Customization Sidebar (480px) */}
        <div
          className={`w-full lg:w-[480px] xl:w-[520px] h-full flex-shrink-0 ${
            mobileTab === 'edit' ? 'block' : 'hidden lg:block'
          }`}
        >
          <EditorSidebar wish={wish} onChange={handleWishChange} />
        </div>

        {/* Right Live Interactive Preview */}
        <div
          className={`flex-1 h-full overflow-hidden ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <LivePreviewFrame wish={wish} />
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        wish={wish}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-12 h-12 rounded-full border-4 border-rose-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
