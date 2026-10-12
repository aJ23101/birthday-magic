import { TemplateDefinition, TemplateType, BirthdayWishData } from '@/types/birthday';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'pastel',
    name: 'Pastel Dreams',
    tagline: 'Dreamy & Whimsical',
    description: 'Soft gradient pastels, rounded clouds, gentle floating hearts, and a cozy fairy-tale aesthetic.',
    previewGradient: 'from-pink-200 via-purple-200 to-indigo-200',
    badge: 'Popular',
    defaultPrimaryColor: '#ec4899',
    defaultFont: 'playful',
    defaultEffect: 'hearts',
    vibe: 'Dreamy, gentle, cute, warm',
  },
  {
    id: 'scrapbook',
    name: 'Memory Lane',
    tagline: 'Polaroids & Washi Tape',
    description: 'Artistic vintage paper textures, taped polaroids, hand-drawn stickers, and handwritten notes.',
    previewGradient: 'from-amber-100 via-orange-100 to-stone-200',
    badge: 'Artistic',
    defaultPrimaryColor: '#b45309',
    defaultFont: 'handwriting',
    defaultEffect: 'sparkles',
    vibe: 'Nostalgic, handcrafted, intimate',
  },
  {
    id: 'cinematic',
    name: 'Midnight Celebration',
    tagline: 'Midnight Glow & Starlight',
    description: 'Deep obsidian luxury theme with shimmering gold accents, ambient neon glow, and starry skies.',
    previewGradient: 'from-slate-900 via-indigo-950 to-amber-950',
    badge: 'Luxury',
    defaultPrimaryColor: '#f59e0b',
    defaultFont: 'serif',
    defaultEffect: 'stars',
    vibe: 'Atmospheric, elegant, VIP',
  },
  {
    id: 'minimal',
    name: 'Minimal Elegance',
    tagline: 'Editorial & Clean',
    description: 'High-end editorial aesthetic with refined serif typography, graceful whitespace, and champagne touches.',
    previewGradient: 'from-stone-100 via-neutral-100 to-zinc-200',
    badge: 'Refined',
    defaultPrimaryColor: '#18181b',
    defaultFont: 'serif',
    defaultEffect: 'minimal',
    vibe: 'Sophisticated, modern, chic',
  },
  {
    id: 'funny',
    name: 'Funny Birthday',
    tagline: 'Laughs, Memes & Comic Fun',
    description: 'Vibrant pop colors, humorous roast badges, hilarious celebration tags, and infectious comic joy.',
    previewGradient: 'from-amber-300 via-rose-400 to-cyan-400',
    badge: 'Hilarious',
    defaultPrimaryColor: '#f43f5e',
    defaultFont: 'playful',
    defaultEffect: 'balloons',
    vibe: 'Witty, energetic, roaring laughs',
  },
  {
    id: 'bestfriends',
    name: 'Best Friends Forever',
    tagline: 'Memories & Inseparable Bond',
    description: 'Warm friendship vibes, dynamic photo collages, hilarious inside jokes, and memory milestone reels.',
    previewGradient: 'from-teal-200 via-emerald-200 to-amber-200',
    badge: 'Heartfelt',
    defaultPrimaryColor: '#0d9488',
    defaultFont: 'modern',
    defaultEffect: 'confetti',
    vibe: 'Warm, emotional, lifelong bond',
  },
];

export const SAMPLE_PHOTOS = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    caption: 'Celebrating life & chasing big dreams together! ✨',
    dateOrTag: 'Unforgettable Day',
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80',
    caption: 'The brightest smile in the whole universe 🎂',
    dateOrTag: 'Pure Joy',
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
    caption: 'Here is to another year of legendary memories and wild laughter! 🎈',
    dateOrTag: 'Good Times',
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80',
    caption: 'May all your secret wishes and boldest dreams come true this year! 🌟',
    dateOrTag: 'Golden Memories',
  },
];

export const SAMPLE_TIMELINE = [
  {
    id: 't1',
    yearOrDate: 'Chapter 1',
    title: 'When Our Paths Crossed',
    description: 'The day we first met and instantly knew we were going to be inseparable partners in crime.',
    photoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 't2',
    yearOrDate: 'Chapter 2',
    title: 'The Great Road Trip Adventure',
    description: 'Blasting our favorite tunes at midnight, laughing until our stomachs hurt, and stargazing.',
    photoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 't3',
    yearOrDate: 'Chapter 3',
    title: 'Today & Forever',
    description: 'Celebrating YOU — your kind heart, your unbreakable resilience, and the light you bring to every room.',
    photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_WISH_DATA: BirthdayWishData = {
  id: 'preview-wish-1',
  slug: 'alex-special-celebration',
  isPublished: true,
  viewsCount: 14,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  recipientName: 'Alex',
  senderName: 'Jordan',
  relationship: 'Best Friend',
  age: 25,
  birthDate: '2001-10-15',
  greetingHeader: 'To The World’s Most Incredible Soul 🎂✨',
  mainMessage:
    "Happy Birthday! Today isn't just another day on the calendar—it's a celebration of the wonderful human you are. Thank you for your warm hugs, your infectious laughter, and for always being the person who lifts everyone up. May this upcoming year bring you boundless happiness, unforgettable adventures, and every dream you've ever whispered to the stars!",
  secretNote:
    'Psst... Secret Birthday Truth: You are genuinely my favorite human being to share coffee with, laugh with, and conquer the world with. Never change your golden sparkle! 💖🎁',

  template: 'pastel',
  primaryColor: '#ec4899',
  fontStyle: 'playful',
  backgroundEffect: 'balloons',

  photos: SAMPLE_PHOTOS,
  timeline: SAMPLE_TIMELINE,
  music: {
    trackId: 'celebration',
    trackTitle: 'Cheerful Birthday Chimes & Melodies',
    enabled: true,
  },

  enableGiftBox: true,
  enableCake: true,
  enableMakeAWish: true,
  enablePhotoGallery: true,
  enableTimeline: true,
  enableSecretNote: true,
  enableSoundFx: true,
};
