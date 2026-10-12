import { BirthdayWishData } from '@/types/birthday';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_WISH_DATA, TEMPLATES } from '@/data/templates';

const LOCAL_STORAGE_KEY = 'birthday_magic_wishes';

// Initialize sample wishes in local storage if empty
export function initLocalSampleWishes(): BirthdayWishData[] {
  if (typeof window === 'undefined') return [INITIAL_WISH_DATA];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Pre-create 2 diverse sample creations so user has instant examples to explore
    const samplePastel = { ...INITIAL_WISH_DATA };
    const sampleCinematic: BirthdayWishData = {
      ...INITIAL_WISH_DATA,
      id: 'preview-wish-cinematic',
      slug: 'marcus-vip-celebration',
      recipientName: 'Marcus',
      senderName: 'Elena & The Crew',
      relationship: 'Friend',
      age: 30,
      birthDate: '1996-05-20',
      template: 'cinematic',
      primaryColor: '#f59e0b',
      fontStyle: 'serif',
      backgroundEffect: 'stars',
      greetingHeader: 'To A True Legend Under The Stars 🌟',
      mainMessage:
        'Wishing an extraordinary 30th birthday to someone who commands the room with grace, wisdom, and unmatched energy. Here is to a decade of groundbreaking triumphs, endless champagne toasts, and legendary stories!',
      secretNote: 'The VIP lounge table is booked for this Friday night! Be ready for the surprise of the year. 🥂✨',
    };

    const initialList = [samplePastel, sampleCinematic];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialList));
    return initialList;
  } catch (err) {
    console.warn('Local storage access error:', err);
    return [INITIAL_WISH_DATA];
  }
}

// Fetch a wish by unique slug
export async function getWishBySlug(slug: string): Promise<BirthdayWishData | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return data as BirthdayWishData;
      }
    } catch (e) {
      console.warn('Supabase fetch error, checking local storage fallback:', e);
    }
  }

  // Fallback to local storage
  const list = initLocalSampleWishes();
  const found = list.find((item) => item.slug === slug || item.id === slug);
  return found || null;
}

// Fetch a wish by ID
export async function getWishById(id: string): Promise<BirthdayWishData | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as BirthdayWishData;
      }
    } catch (e) {
      console.warn('Supabase fetch error:', e);
    }
  }

  const list = initLocalSampleWishes();
  return list.find((item) => item.id === id) || null;
}

// Save or update wish
export async function saveWish(wish: BirthdayWishData): Promise<BirthdayWishData> {
  const updatedWish: BirthdayWishData = {
    ...wish,
    updatedAt: new Date().toISOString(),
  };

  // Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .upsert(updatedWish, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        // Also update local storage cache
        updateLocalList(data as BirthdayWishData);
        return data as BirthdayWishData;
      }
      if (error) {
        console.warn('Supabase upsert returned error, falling back to local storage:', error.message);
      }
    } catch (e) {
      console.warn('Supabase upsert exception:', e);
    }
  }

  // Local storage save
  updateLocalList(updatedWish);
  return updatedWish;
}

function updateLocalList(wish: BirthdayWishData) {
  if (typeof window === 'undefined') return;
  try {
    const list = initLocalSampleWishes();
    const index = list.findIndex((w) => w.id === wish.id);
    if (index >= 0) {
      list[index] = wish;
    } else {
      list.unshift(wish);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to update localStorage:', err);
  }
}

// Get all wishes created by current user / session
export async function getUserWishes(): Promise<BirthdayWishData[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as BirthdayWishData[];
        }
      }
    } catch (e) {
      console.warn('Supabase getUserWishes error:', e);
    }
  }

  return initLocalSampleWishes();
}

// Delete wish
export async function deleteWish(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('wishes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const list = initLocalSampleWishes().filter((w) => w.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return true;
}

// Increment views count
export async function incrementViews(slug: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const list = initLocalSampleWishes();
    const item = list.find((w) => w.slug === slug);
    if (item) {
      item.viewsCount = (item.viewsCount || 0) + 1;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.rpc('increment_views', { wish_slug: slug });
    }
  } catch {}
}

// File upload handler (Supabase Storage with automatic Base64 local fallback)
export async function uploadMediaFile(
  file: File,
  bucket: 'photos' | 'audio'
): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, converting to Base64 data URL:', err);
    }
  }

  // Client-side fallback as Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Generate URL slug from recipient name
export function generateSlug(recipientName: string): string {
  const cleanName = recipientName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${cleanName || 'birthday'}-${randomSuffix}`;
}
