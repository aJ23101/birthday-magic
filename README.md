# 🎂 BirthdayMagic - Modern Happy Birthday Website Generator

A modern, fully functional, personalized **Happy Birthday Website Generator** built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

Anyone can easily craft breathtaking, customized birthday surprise websites, preview them in real time, and share them with loved ones through unique links and 1-click WhatsApp messages.

---

## ✨ Key Features

### 1. 🌟 High-Converting Landing Page
- Modern hero section with animated celebratory visuals and sample preview CTA.
- Interactive showcase for all 6 unique aesthetic templates.
- Clear 3-step "How It Works" guide.
- Feature breakdown highlighting interactive gift unboxing, candles, photo reels, and instant sharing.

### 2. 🎨 6 Distinct Aesthetic Templates
- **Pastel Aesthetic:** Soft gradients (blush, lavender, mint), rounded clouds, floating hearts, and dreamy whimsical charm.
- **Scrapbook Memories:** Handcrafted vintage paper textures, taped polaroids with washi tape, hand-drawn stickers, and cursive typography.
- **Cinematic Dark:** Obsidian midnight mode with luxury gold foil typography, starlight aura, and VIP spotlight atmosphere.
- **Minimal Elegance:** Editorial high-fashion aesthetic with refined serif typography, champagne borders, and generous whitespace.
- **Funny Birthday:** Playful pop colors, funny comic roast badges, meme-worthy celebration tags, and energetic joy.
- **Best Friends:** Warm friendship vibes, dynamic photo collages, inside joke tags, and memory milestone reels.

### 3. 🛠️ Visual Website Editor
- **Real-Time Live Preview:** Split-screen editor with device view switcher (Mobile iPhone shell, Tablet, and Desktop).
- **Personalization Details:** Recipient's name, sender's nickname, relationship, age, birthday date, and greeting header.
- **Heartfelt Message & Confidential Note:** Main letter plus a secret lockable message revealed only when the recipient unseals the envelope.
- **Photo Gallery Management:** Drag-and-drop / file upload with Base64 & Supabase Storage integration, customizable captions, and dates.
- **Memory Journey Timeline:** Add milestone chapters, dates, descriptions, and photos.
- **Styling Controls:** 1-click template switcher, primary accent color palette, typography styles, and animated background effects (balloons, hearts, stars, sparkles, minimal).
- **Music & Feature Toggles:** Choose background tracks, toggle gift box surprise, cake & candles, photo galleries, and sound effects.
- **Replay Unboxing Button:** Test what the recipient will experience without leaving the editor.

### 4. 🎁 Birthday Surprise Experience (Recipient View)
- Accessible publicly at `/w/[slug]` without requiring an account.
- **3D Gift Box Screen:** Interactive gift box with vibrating ribbons. Clicking plays celebratory fanfare, bursts multi-stage confetti cannons, and launches background music.
- **Interactive Cake & Candles:** 3-tier birthday cake with flickering candle flames. Recipient can tap individual candles to blow them out (with rising smoke animation and wish chime) or use the "Blow Out Candles" button.
- **"Make A Wish" Sparkler Interaction:** Interactive wish casting modal with animated starlight and confirmation.
- **Polaroid Photo Slideshow:** Tilted polaroid frames with zoomable lightbox gallery.
- **Memory Timeline:** Interactive journey connecting milestone chapters.
- **Confetti Cannons:** Floating "Shower With Confetti! 🎉" button to re-trigger confetti anytime.

### 5. 🎵 Built-In Audio Engine & Music Player
- **Zero-Dependency Web Audio API Synthesizer:** Melodic "Happy Birthday" harmonized chimes and sound effects (gift fanfare, candle blow whoosh, chime) that work reliably offline and on any device without external CDN latency or broken audio files.
- **Custom Audio Support:** Upload audio files or stream custom tracks.
- **Floating Audio Dock:** Equalizer bars, play/pause, track title, and mute/unmute controls. Complies with browser autoplay policies by gracefully starting upon the first gift unboxing tap.

### 6. 🚀 1-Click WhatsApp & QR Code Sharing
- Generates unique permanent URLs (e.g. `/w/alex-special-celebration`).
- Instant 1-click WhatsApp share with pre-filled joyful message:
  `"🎉 Hey Alex! I made a personalized birthday surprise website just for you! Open your gift box here: ... 🎁✨"`
- Quick copy-to-clipboard button with confirmation toast.
- QR Code generation so recipients can scan the surprise directly with any mobile camera.

### 7. 📂 Dashboard & Save Management
- View all drafts and published websites at `/dashboard`.
- Real-time recipient view counter.
- Edit existing pages, copy links, or delete creations.
- Supabase Auth integration for cloud synchronization across devices, combined with instant localStorage persistence so guests can start creating immediately.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer-motion.com/) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio:** Web Audio API Melodic Engine + HTML5 Audio
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested with Node.js v24)
- npm or pnpm or yarn

### 2. Installation
```bash
# Clone the repository and navigate into the folder
cd Birthday_Wish

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL="BirthdayMagic <birthday@your-verified-domain.com>"
```
> **Note:** The application includes automatic local fallback. If Supabase keys are not set, it uses `localStorage` for drafts and Base64 for images, allowing you to run and test everything out of the box!
>
> Keep `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` server-only. Never expose them with a `NEXT_PUBLIC_` prefix.

### 4. Database Setup (Supabase)
To enable multi-device sync, open your Supabase project's **SQL Editor** and run the provided SQL script:
```bash
supabase/schema.sql
```
Then run [`supabase/migrations/202610120001_auth_dashboard.sql`](./supabase/migrations/202610120001_auth_dashboard.sql) in the SQL Editor to add account profiles, ownership-safe row-level security, archived/published timestamps, and private email-send history. New accounts use Supabase Auth; configure the Supabase Auth email templates and allowed redirect URLs for signup verification and password recovery.

Email sharing is sent through Resend. Verify the sender domain/address in Resend and set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and the server-only Supabase service-role key in the deployment environment. The dashboard counts only emails accepted by Resend; delivery confirmation is not configured.
This automatically sets up:
- The `wishes` table with indexing on `slug`
- Row-Level Security (RLS) policies
- Storage buckets for `photos` and `audio`
- Atomic RPC function `increment_views`

### 5. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel](https://vercel.com/) and click **"New Project"**.
3. Import your repository.
4. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your deployed Vercel domain)
5. Click **"Deploy"**.

---

## 📁 Project Structure

```
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── dashboard/      # Creations & drafts dashboard
│   │   ├── editor/         # Visual website editor & live preview
│   │   ├── w/[slug]/       # Recipient surprise experience
│   │   ├── globals.css     # Tailwind v4 styles, keyframes & fonts
│   │   ├── layout.tsx      # Root HTML layout with metadata
│   │   └── page.tsx        # Landing homepage
│   ├── components/
│   │   ├── editor/         # EditorSidebar, LivePreviewFrame
│   │   ├── share/          # ShareModal with WhatsApp & QR code
│   │   ├── surprise/       # GiftBoxScreen, InteractiveCake, PhotoGallery,
│   │   │                   # MakeAWishModal, SecretNoteCard, MusicPlayerBar,
│   │   │                   # MemoryTimeline, BackgroundEffects
│   │   └── templates/      # BirthdayPageRenderer & 6 template layouts
│   ├── data/               # Template definitions & initial presets
│   ├── lib/                # Audio engine, confetti, storage & Supabase
│   └── types/              # Comprehensive TypeScript interfaces
├── supabase/
│   └── schema.sql          # Complete Supabase PostgreSQL schema & RLS
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🎁 License
MIT © BirthdayMagic
