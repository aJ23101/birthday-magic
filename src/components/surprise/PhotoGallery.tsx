'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthdayPhoto } from '@/types/birthday';
import { Camera, ChevronLeft, ChevronRight, X, Heart, Sparkles } from 'lucide-react';

interface PhotoGalleryProps {
  photos: BirthdayPhoto[];
  template: string;
  primaryColor: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  template,
  primaryColor,
}) => {
  const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalIdx === null) return;
    setActiveModalIdx((prev) => (prev! === 0 ? photos.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalIdx === null) return;
    setActiveModalIdx((prev) => (prev! === photos.length - 1 ? 0 : prev! + 1));
  };

  const isScrapbook = template === 'scrapbook';
  const isCinematic = template === 'cinematic';
  const isMinimal = template === 'minimal';

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2 shadow-xs"
          style={{
            backgroundColor: `${primaryColor}22`,
            color: primaryColor,
          }}
        >
          <Camera className="w-3.5 h-3.5" />
          Captured Moments
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Treasured Memories & Smiles 📸
        </h2>
        <p className="text-sm opacity-70 mt-1 max-w-md mx-auto">
          Every picture tells a story of pure joy, golden sunsets, and cherished memories.
        </p>
      </div>

      {/* Grid of Polaroid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
        {photos.map((photo, index) => {
          // Add playful slight tilts for polaroid aesthetic
          const tiltDegrees = index % 4 === 0 ? -2 : index % 4 === 1 ? 2.5 : index % 4 === 2 ? -1.5 : 1.8;

          return (
            <motion.div
              key={photo.id || index}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
              style={{ transform: `rotate(${tiltDegrees}deg)` }}
              onClick={() => setActiveModalIdx(index)}
              className={`w-full max-w-xs cursor-pointer transition-all duration-300 polaroid-shadow rounded-2xl overflow-hidden ${
                isCinematic
                  ? 'bg-slate-900 border border-slate-800 p-3'
                  : isScrapbook
                  ? 'bg-[#fefaf3] border border-amber-200/80 p-3 pb-5 relative'
                  : 'bg-white p-3 pb-5'
              }`}
            >
              {/* Scrapbook Washi Tape Effect */}
              {isScrapbook && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-amber-200/70 border border-amber-300/40 transform rotate-1 shadow-xs pointer-events-none z-10 opacity-80" />
              )}

              {/* Photo Image Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Birthday Memory'}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                {photo.dateOrTag && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                    {photo.dateOrTag}
                  </span>
                )}
              </div>

              {/* Caption */}
              <div className="mt-3 px-1 text-center">
                <p
                  className={`text-sm ${
                    isScrapbook
                      ? 'font-handwriting text-lg text-amber-950'
                      : isCinematic
                      ? 'text-slate-200'
                      : 'text-slate-700 font-medium'
                  } line-clamp-2`}
                >
                  {photo.caption || 'Special moment ✨'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal / Slideshow */}
      <AnimatePresence>
        {activeModalIdx !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveModalIdx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalIdx(null)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Left */}
              <button
                onClick={handlePrev}
                className="absolute left-2 md:-left-14 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-black/50 hover:bg-black/80 cursor-pointer transition-transform hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Navigation Right */}
              <button
                onClick={handleNext}
                className="absolute right-2 md:-right-14 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-black/50 hover:bg-black/80 cursor-pointer transition-transform hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden max-h-[70vh] shadow-2xl bg-black">
                <img
                  src={photos[activeModalIdx].url}
                  alt={photos[activeModalIdx].caption}
                  className="max-h-[70vh] w-auto object-contain mx-auto"
                />
              </div>

              {/* Caption Bar */}
              <div className="mt-4 text-center text-white px-4">
                <p className="text-base md:text-lg font-semibold">
                  {photos[activeModalIdx].caption}
                </p>
                {photos[activeModalIdx].dateOrTag && (
                  <span className="text-xs text-white/60 mt-1 inline-block">
                    🏷️ {photos[activeModalIdx].dateOrTag} • {activeModalIdx + 1} of {photos.length}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
