'use client';

import React, { useState } from 'react';
import { BirthdayWishData, TemplateType, FontStyleType, BackgroundEffectType } from '@/types/birthday';
import { TEMPLATES, SAMPLE_PHOTOS } from '@/data/templates';
import { uploadMediaFile } from '@/lib/storage';
import {
  User,
  Heart,
  Camera,
  Music,
  Palette,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Lock,
  Bookmark,
  Check,
  Volume2,
} from 'lucide-react';

interface EditorSidebarProps {
  wish: BirthdayWishData;
  onChange: (updated: BirthdayWishData) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({ wish, onChange }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'message' | 'photos' | 'timeline' | 'design' | 'features'>('basics');
  const [isUploading, setIsUploading] = useState(false);

  const updateField = <K extends keyof BirthdayWishData>(key: K, value: BirthdayWishData[K]) => {
    onChange({
      ...wish,
      [key]: value,
    });
  };

  const handleTemplateChange = (templateId: TemplateType) => {
    const templateDef = TEMPLATES.find((t) => t.id === templateId);
    onChange({
      ...wish,
      template: templateId,
      primaryColor: templateDef ? templateDef.defaultPrimaryColor : wish.primaryColor,
      fontStyle: templateDef ? templateDef.defaultFont : wish.fontStyle,
      backgroundEffect: templateDef ? templateDef.defaultEffect : wish.backgroundEffect,
    });
  };

  const handleAddPhoto = () => {
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
      caption: 'A wonderful moment to remember forever ✨',
      dateOrTag: 'Cherished Day',
    };
    updateField('photos', [...wish.photos, newPhoto]);
  };

  const handleRemovePhoto = (id: string) => {
    updateField('photos', wish.photos.filter((p) => p.id !== id));
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadMediaFile(file, 'photos');
      const updatedPhotos = wish.photos.map((p) => (p.id === photoId ? { ...p, url } : p));
      updateField('photos', updatedPhotos);
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTimeline = () => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      yearOrDate: 'Next Chapter',
      title: 'A Golden Memory',
      description: 'Write about an unforgettable milestone or memory shared together...',
    };
    updateField('timeline', [...wish.timeline, newMilestone]);
  };

  const handleRemoveTimeline = (id: string) => {
    updateField('timeline', wish.timeline.filter((m) => m.id !== id));
  };

  const colorPresets = [
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#8b5cf6', // Violet
    '#3b82f6', // Blue
    '#0d9488', // Teal
    '#f59e0b', // Amber/Gold
    '#b45309', // Vintage Bronze
    '#18181b', // Obsidian Black
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-1.5 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('basics')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'basics'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Basics
        </button>

        <button
          onClick={() => setActiveTab('message')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'message'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Message
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Photos ({wish.photos?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Timeline
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'design'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Theme & Colors
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'features'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Music & Magic
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* BASICS TAB */}
        {activeTab === 'basics' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Recipient&apos;s Name *
              </label>
              <input
                type="text"
                value={wish.recipientName}
                onChange={(e) => updateField('recipientName', e.target.value)}
                placeholder="e.g. Sarah, Marcus, Mom"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Sender&apos;s Name / Nickname *
              </label>
              <input
                type="text"
                value={wish.senderName}
                onChange={(e) => updateField('senderName', e.target.value)}
                placeholder="e.g. Jordan, Your Bestie, Alex & Crew"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Age / Milestone (Optional)
                </label>
                <input
                  type="text"
                  value={wish.age || ''}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="e.g. 21, 30, 50"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Relationship
                </label>
                <select
                  value={wish.relationship}
                  onChange={(e) => updateField('relationship', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Best Friend">Best Friend</option>
                  <option value="Partner / Soulmate">Partner / Soulmate</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Mom">Mom</option>
                  <option value="Dad">Dad</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Close Friend">Close Friend</option>
                  <option value="Family">Family</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Custom Web URL Slug
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs">
                <span className="opacity-50 mr-1">/w/</span>
                <input
                  type="text"
                  value={wish.slug}
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full bg-transparent font-mono text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* MESSAGE TAB */}
        {activeTab === 'message' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Greeting Headline
              </label>
              <input
                type="text"
                value={wish.greetingHeader}
                onChange={(e) => updateField('greetingHeader', e.target.value)}
                placeholder="e.g. To The World’s Most Incredible Soul 🎂✨"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Main Birthday Message / Letter *
              </label>
              <textarea
                value={wish.mainMessage}
                onChange={(e) => updateField('mainMessage', e.target.value)}
                rows={6}
                placeholder="Write your heartfelt birthday wishes, jokes, and blessings..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed resize-y"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Secret / Confidential Note
                </label>
                <input
                  type="checkbox"
                  checked={wish.enableSecretNote}
                  onChange={(e) => updateField('enableSecretNote', e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                />
              </div>
              <p className="text-xs opacity-60 mb-2">
                Revealed only when the recipient clicks the sealed envelope!
              </p>
              {wish.enableSecretNote && (
                <textarea
                  value={wish.secretNote || ''}
                  onChange={(e) => updateField('secretNote', e.target.value)}
                  rows={3}
                  placeholder="Psst... Write your secret birthday confession, inside joke, or surprise plan here!"
                  className="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              )}
            </div>
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Photo Gallery ({wish.photos.length})
                </h4>
                <p className="text-xs opacity-60">Upload photos or edit captions</p>
              </div>
              <button
                onClick={handleAddPhoto}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Photo
              </button>
            </div>

            <div className="space-y-4">
              {wish.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      <img
                        src={photo.url}
                        alt="Photo thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Replace / Upload Image
                      </label>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50">
                        <Upload className="w-3 h-3" />
                        <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoFileUpload(e, photo.id)}
                        />
                      </label>
                    </div>
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => {
                        const updated = wish.photos.map((p) =>
                          p.id === photo.id ? { ...p, caption: e.target.value } : p
                        );
                        updateField('photos', updated);
                      }}
                      placeholder="Photo caption (e.g. Best summer memory ☀️)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={photo.dateOrTag || ''}
                      onChange={(e) => {
                        const updated = wish.photos.map((p) =>
                          p.id === photo.id ? { ...p, dateOrTag: e.target.value } : p
                        );
                        updateField('photos', updated);
                      }}
                      placeholder="Tag / Year (e.g. 2024, Golden Hour)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => updateField('photos', SAMPLE_PHOTOS)}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
            >
              Reset to 4 high-res sample presets
            </button>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Memory Journey Timeline
                </h4>
                <p className="text-xs opacity-60">Story chapters & milestones</p>
              </div>
              <button
                onClick={handleAddTimeline}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {wish.timeline.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.yearOrDate}
                      onChange={(e) => {
                        const next = wish.timeline.map((m) =>
                          m.id === item.id ? { ...m, yearOrDate: e.target.value } : m
                        );
                        updateField('timeline', next);
                      }}
                      placeholder="Chapter / Year"
                      className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold w-32"
                    />
                    <button
                      onClick={() => handleRemoveTimeline(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const next = wish.timeline.map((m) =>
                        m.id === item.id ? { ...m, title: e.target.value } : m
                      );
                      updateField('timeline', next);
                    }}
                    placeholder="Milestone Title"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  />

                  <textarea
                    value={item.description}
                    onChange={(e) => {
                      const next = wish.timeline.map((m) =>
                        m.id === item.id ? { ...m, description: e.target.value } : m
                      );
                      updateField('timeline', next);
                    }}
                    rows={2}
                    placeholder="Story description..."
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DESIGN & THEMES TAB */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* 6 Templates Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Select Template Design (6 Styles)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => {
                  const isSelected = wish.template === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleTemplateChange(tpl.id)}
                      className={`relative p-3 rounded-2xl cursor-pointer border-2 transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`h-10 rounded-xl bg-gradient-to-r ${tpl.previewGradient} mb-2 shadow-inner flex items-center justify-center`}
                      >
                        <span className="text-xs font-bold text-slate-800/80 drop-shadow-xs">
                          {tpl.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{tpl.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] opacity-60 line-clamp-1 mt-0.5">{tpl.tagline}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Primary Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateField('primaryColor', color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      wish.primaryColor === color
                        ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={wish.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent"
                  title="Custom HEX picker"
                />
              </div>
            </div>

            {/* Typography Font Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Typography Vibe
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'playful', label: 'Playful & Bubbly' },
                  { id: 'handwriting', label: 'Handwritten Cursive' },
                  { id: 'serif', label: 'Romantic Serif' },
                  { id: 'modern', label: 'Clean Modern' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateField('fontStyle', f.id as FontStyleType)}
                    className={`py-2 px-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      wish.fontStyle === f.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 font-bold'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Animations */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Background Animated Atmosphere
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'balloons', label: '🎈 Balloons' },
                  { id: 'hearts', label: '💖 Hearts' },
                  { id: 'stars', label: '✦ Stars' },
                  { id: 'confetti', label: '🎉 Confetti' },
                  { id: 'minimal', label: 'Minimalist' },
                ].map((eff) => (
                  <button
                    key={eff.id}
                    onClick={() => updateField('backgroundEffect', eff.id as BackgroundEffectType)}
                    className={`py-2 px-2.5 rounded-xl border text-center cursor-pointer transition-colors ${
                      wish.backgroundEffect === eff.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 font-bold'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {eff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEATURES & MUSIC TAB */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {/* Music Controls */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Background Birthday Music
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={wish.music?.enabled}
                  onChange={(e) =>
                    updateField('music', { ...wish.music, enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                />
              </div>

              {wish.music?.enabled && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold opacity-75">Track Selection</label>
                  <select
                    value={wish.music.trackId}
                    onChange={(e) =>
                      updateField('music', {
                        ...wish.music,
                        trackId: e.target.value as any,
                        trackTitle:
                          e.target.value === 'celebration'
                            ? 'Cheerful Birthday Chimes'
                            : e.target.value === 'lofi'
                            ? 'Lofi Birthday Breeze'
                            : 'Synthesized Serenade',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="celebration">Cheerful Birthday Chimes (Built-in Web Audio)</option>
                    <option value="lofi">Lofi Birthday Breeze (Chime Loop)</option>
                    <option value="party">Party Celebration Melody</option>
                  </select>
                </div>
              )}
            </div>

            {/* Interactive Feature Toggles */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Interactive Birthday Experience Elements
              </label>

              {[
                {
                  id: 'enableGiftBox',
                  label: '🎁 3D Animated Gift Box Opening Screen',
                  desc: 'Recipient must tap the gift box to unwrap the surprise with fanfare & confetti!',
                  val: wish.enableGiftBox,
                },
                {
                  id: 'enableCake',
                  label: '🎂 Interactive Cake & Candle Blow-Out',
                  desc: 'Recipient taps candle flames to blow them out with puff of smoke & cheer!',
                  val: wish.enableCake,
                },
                {
                  id: 'enableMakeAWish',
                  label: '✨ "Make a Wish" Interaction',
                  desc: 'Allows recipient to seal and cast their secret birthday wish to the stars.',
                  val: wish.enableMakeAWish,
                },
                {
                  id: 'enablePhotoGallery',
                  label: '📸 Polaroid Photo Gallery & Slideshow',
                  desc: 'Displays the photos in stylish tilted polaroid cards with lightbox.',
                  val: wish.enablePhotoGallery,
                },
                {
                  id: 'enableTimeline',
                  label: '⏳ Memory Milestone Timeline',
                  desc: 'Chronicles your special journey and chapters together.',
                  val: wish.enableTimeline,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="pr-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-[11px] opacity-60 mt-0.5">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => updateField(item.id as any, e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 mt-1 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
