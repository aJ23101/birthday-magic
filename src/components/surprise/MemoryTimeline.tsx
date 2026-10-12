'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TimelineMilestone } from '@/types/birthday';
import { Sparkles, Calendar, Heart, Bookmark } from 'lucide-react';

interface MemoryTimelineProps {
  timeline: TimelineMilestone[];
  primaryColor: string;
  template: string;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  timeline,
  primaryColor,
  template,
}) => {
  if (!timeline || timeline.length === 0) return null;

  const isCinematic = template === 'cinematic';
  const isScrapbook = template === 'scrapbook';

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2 shadow-xs"
          style={{
            backgroundColor: `${primaryColor}22`,
            color: primaryColor,
          }}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Life Story & Journey
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Memories That Built Us ⏳
        </h2>
        <p className="text-sm opacity-70 mt-1 max-w-sm mx-auto">
          From unforgettable beginnings to lifelong milestones.
        </p>
      </div>

      <div className="relative border-l-2 ml-4 md:ml-32 space-y-8" style={{ borderColor: `${primaryColor}44` }}>
        {timeline.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="relative pl-6 md:pl-10"
          >
            {/* Timeline Node Dot */}
            <div
              className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Time / Year Badge (Desktop left pill) */}
            <span
              className="hidden md:block absolute -left-32 top-1 text-right w-24 text-xs font-extrabold tracking-wider uppercase"
              style={{ color: primaryColor }}
            >
              {item.yearOrDate}
            </span>

            {/* Milestone Card */}
            <div
              className={`rounded-2xl p-5 md:p-6 shadow-lg border transition-all hover:scale-101 ${
                isCinematic
                  ? 'bg-slate-900/90 border-slate-800'
                  : isScrapbook
                  ? 'bg-[#fefaf3] border-amber-200/70'
                  : 'bg-white/90 border-slate-100'
              }`}
            >
              {/* Mobile Date Badge */}
              <div className="md:hidden mb-2">
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}
                >
                  {item.yearOrDate}
                </span>
              </div>

              <h4 className="text-lg md:text-xl font-bold mb-2 flex items-center gap-2">
                {item.title}
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h4>

              <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">
                {item.description}
              </p>

              {item.photoUrl && (
                <div className="mt-4 rounded-xl overflow-hidden aspect-video max-w-sm">
                  <img
                    src={item.photoUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
