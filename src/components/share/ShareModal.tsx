'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  Share2,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { BirthdayWishData } from '@/types/birthday';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  wish: BirthdayWishData;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  wish,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const shareUrl = `${origin}/w/${wish.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `🎉 Hey ${wish.recipientName}! I created an exclusive personalized birthday surprise website just for you! Open your gift box here: ${shareUrl} 🎁✨`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(`Birthday Surprise for ${wish.recipientName}! 🎂`)}`;

  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Birthday Surprise for ${wish.recipientName}!`,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      copyToClipboard();
    }
  };

  // QR code image URL (using reliable quickchart qr endpoint)
  const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    shareUrl
  )}&size=240&margin=2`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">
              Your Birthday Gift Is Live! 🎁
            </h3>
            <p className="text-sm opacity-70 mt-1">
              Share this unique link with {wish.recipientName}. No login required for them!
            </p>
          </div>

          {/* URL Box with Copy Button */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Shareable Website Link
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent px-3 py-1.5 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none select-all"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* WhatsApp Share Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-white bg-[#25D366] hover:bg-[#20ba5a] transition-transform hover:scale-102 active:scale-98 shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Share on WhatsApp</span>
            </a>

            {/* Native Share / Open Live */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-transform hover:scale-102 active:scale-98 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live Website</span>
            </a>
          </div>

          {/* Secondary Actions (QR Code toggle, Telegram) */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-semibold opacity-75 hover:opacity-100 flex items-center gap-1.5 cursor-pointer underline"
            >
              <QrCode className="w-4 h-4" />
              {showQr ? 'Hide QR Code' : 'Show QR Code'}
            </button>
            <span className="opacity-30">•</span>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold opacity-75 hover:opacity-100 flex items-center gap-1 cursor-pointer"
            >
              Telegram
            </a>
            <span className="opacity-30">•</span>
            <button
              onClick={handleNativeShare}
              className="text-xs font-semibold opacity-75 hover:opacity-100 flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              More Options
            </button>
          </div>

          {/* QR Code Container */}
          {showQr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700"
            >
              <p className="text-xs font-semibold opacity-70 mb-3">
                Scan with any phone camera to open the surprise:
              </p>
              <div className="p-3 bg-white rounded-xl shadow-md">
                <img
                  src={qrImageUrl}
                  alt="Birthday Surprise QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
