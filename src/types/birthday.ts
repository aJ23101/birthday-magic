export type TemplateType =
  | 'pastel'
  | 'scrapbook'
  | 'cinematic'
  | 'minimal'
  | 'funny'
  | 'bestfriends';

export type FontStyleType = 'sans' | 'serif' | 'handwriting' | 'playful' | 'modern';
export type BackgroundEffectType = 'balloons' | 'confetti' | 'stars' | 'hearts' | 'fireworks' | 'sparkles' | 'minimal';

export interface BirthdayPhoto {
  id: string;
  url: string;
  caption: string;
  dateOrTag?: string;
}

export interface TimelineMilestone {
  id: string;
  yearOrDate: string;
  title: string;
  description: string;
  photoUrl?: string;
}

export interface BirthdayMusic {
  trackId: 'celebration' | 'lofi' | 'acoustic' | 'party' | 'synthesized' | 'custom' | 'none';
  trackTitle: string;
  customAudioUrl?: string;
  enabled: boolean;
}

export interface BirthdayWishData {
  id: string;
  slug: string;
  userId?: string;
  isPublished: boolean;
  isArchived?: boolean;
  publishedAt?: string;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;

  // Personalization
  recipientName: string;
  senderName: string;
  relationship: string;
  birthDate?: string;
  age?: number | string;
  greetingHeader: string;
  mainMessage: string;
  secretNote?: string;

  // Template & Styling
  template: TemplateType;
  primaryColor: string;
  fontStyle: FontStyleType;
  backgroundEffect: BackgroundEffectType;

  // Media & Sections
  photos: BirthdayPhoto[];
  timeline: TimelineMilestone[];
  music: BirthdayMusic;

  // Feature Toggles
  enableGiftBox: boolean;
  enableCake: boolean;
  enableMakeAWish: boolean;
  enablePhotoGallery: boolean;
  enableTimeline: boolean;
  enableSecretNote: boolean;
  enableSoundFx: boolean;
}

export interface TemplateDefinition {
  id: TemplateType;
  name: string;
  tagline: string;
  description: string;
  previewGradient: string;
  badge: string;
  defaultPrimaryColor: string;
  defaultFont: FontStyleType;
  defaultEffect: BackgroundEffectType;
  vibe: string;
}
