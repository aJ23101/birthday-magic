import { BirthdayWishData } from '@/types/birthday';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_WISH_DATA, TEMPLATES } from '@/data/templates';

const LOCAL_STORAGE_KEY = 'birthday_magic_wishes';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fromDatabaseWish(row: Record<string, unknown>): BirthdayWishData {
  return {
    id: String(row.id),
    slug: String(row.slug),
    userId: typeof row.user_id === 'string' ? row.user_id : undefined,
    isPublished: Boolean(row.is_published),
    isArchived: Boolean(row.is_archived),
    publishedAt: typeof row.published_at === 'string' ? row.published_at : undefined,
    viewsCount: Number(row.views_count || 0),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    recipientName: String(row.recipient_name || ''),
    senderName: String(row.sender_name || ''),
    relationship: String(row.relationship || ''),
    birthDate: typeof row.birth_date === 'string' ? row.birth_date : undefined,
    age: typeof row.age === 'number' || typeof row.age === 'string' ? row.age : undefined,
    greetingHeader: String(row.greeting_header || ''),
    mainMessage: String(row.main_message || ''),
    secretNote: typeof row.secret_note === 'string' ? row.secret_note : undefined,
    template: row.template as BirthdayWishData['template'],
    primaryColor: String(row.primary_color || '#ec4899'),
    fontStyle: row.font_style as BirthdayWishData['fontStyle'],
    backgroundEffect: row.background_effect as BirthdayWishData['backgroundEffect'],
    photos: Array.isArray(row.photos) ? row.photos as BirthdayWishData['photos'] : [],
    timeline: Array.isArray(row.timeline) ? row.timeline as BirthdayWishData['timeline'] : [],
    music: row.music as BirthdayWishData['music'],
    enableGiftBox: Boolean(row.enable_gift_box),
    enableCake: Boolean(row.enable_cake),
    enableMakeAWish: Boolean(row.enable_make_a_wish),
    enablePhotoGallery: Boolean(row.enable_photo_gallery),
    enableTimeline: Boolean(row.enable_timeline),
    enableSecretNote: Boolean(row.enable_secret_note),
    enableSoundFx: Boolean(row.enable_sound_fx),
  };
}

function toDatabaseWish(wish: BirthdayWishData, userId?: string) {
  return {
    ...(UUID_PATTERN.test(wish.id) ? { id: wish.id } : {}),
    slug: wish.slug,
    user_id: userId || wish.userId || null,
    is_published: wish.isPublished,
    is_archived: wish.isArchived || false,
    published_at: wish.publishedAt || (wish.isPublished ? wish.updatedAt : null),
    views_count: wish.viewsCount,
    created_at: wish.createdAt,
    updated_at: wish.updatedAt,
    recipient_name: wish.recipientName,
    sender_name: wish.senderName,
    relationship: wish.relationship,
    birth_date: wish.birthDate || null,
    age: typeof wish.age === 'number' ? wish.age : Number(wish.age) || null,
    greeting_header: wish.greetingHeader,
    main_message: wish.mainMessage,
    secret_note: wish.secretNote || null,
    template: wish.template,
    primary_color: wish.primaryColor,
    font_style: wish.fontStyle,
    background_effect: wish.backgroundEffect,
    photos: wish.photos,
    timeline: wish.timeline,
    music: wish.music,
    enable_gift_box: wish.enableGiftBox,
    enable_cake: wish.enableCake,
    enable_make_a_wish: wish.enableMakeAWish,
    enable_photo_gallery: wish.enablePhotoGallery,
    enable_timeline: wish.enableTimeline,
    enable_secret_note: wish.enableSecretNote,
    enable_sound_fx: wish.enableSoundFx,
  };
}

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
        return fromDatabaseWish(data as Record<string, unknown>);
      }
      if (error) throw error;
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
      if (UUID_PATTERN.test(id)) {
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return fromDatabaseWish(data as Record<string, unknown>);
        }
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    try {
      const pageToSave = {
        ...updatedWish,
        userId: user?.id || updatedWish.userId,
      };
      const { data, error } = await supabase
        .from('wishes')
        .upsert(toDatabaseWish(pageToSave, user?.id), { onConflict: 'slug' })
        .select()
        .single();

      if (!error && data) {
        const savedWish = fromDatabaseWish(data as Record<string, unknown>);
        // Also update local storage cache
        updateLocalList(savedWish);
        return savedWish;
      }
      if (error) {
        if (user) throw error;
        console.warn('Supabase upsert returned error, falling back to local storage:', error.message);
      }
    } catch (e) {
      if (user) throw e;
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
    const index = list.findIndex((w) => w.id === wish.id || w.slug === wish.slug);
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (user) {
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return (data || []).map((row) => fromDatabaseWish(row as Record<string, unknown>));
      }
    } catch (e) {
      console.error('Could not load account birthday websites from Supabase:', e);
      throw e;
    }
  }

  return initLocalSampleWishes();
}

export async function getUserEmailDashboardData(): Promise<{
  total: number;
  scheduled: number;
  failedAttempts: number;
  delivered: number;
  byWish: Record<string, number>;
  events: Array<{
    id: string;
    birthdayPageId: string;
    jobId: string | null;
    recipientEmail: string;
    senderDisplayName: string;
    status: string;
    deliveryStatus: string | null;
    createdAt: string;
    providerMessageId: string | null;
    errorMessage: string | null;
  }>;
  jobs: Array<{
    id: string;
    birthdayPageId: string;
    recipientEmail: string;
    senderDisplayName: string;
    scheduledAt: string;
    timeZone: string;
    status: string;
    deliveryStatus: string | null;
    attemptCount: number;
    maxAttempts: number;
    providerMessageId: string | null;
    lastError: string | null;
    createdAt: string;
  }>;
}> {
  const empty = { total: 0, scheduled: 0, failedAttempts: 0, delivered: 0, byWish: {}, events: [], jobs: [] };
  if (!isSupabaseConfigured || !supabase) return empty;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return empty;

  const [eventsResult, jobsResult] = await Promise.all([
    supabase
      .from('birthday_send_events')
      .select('id, birthday_page_id, email_job_id, recipient_email, sender_display_name, status, delivery_status, created_at, provider_message_id, error_message')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('birthday_email_jobs')
      .select('id, birthday_page_id, recipient_email, sender_display_name, scheduled_at, timezone, status, delivery_status, attempt_count, max_attempts, provider_message_id, last_error, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  if (eventsResult.error) {
    console.error('Could not load birthday email attempt history:', eventsResult.error);
    throw eventsResult.error;
  }
  if (jobsResult.error) {
    console.error('Could not load scheduled birthday emails:', jobsResult.error);
    throw jobsResult.error;
  }

  const data = eventsResult.data || [];
  const jobs = jobsResult.data || [];
  const byWish: Record<string, number> = {};
  for (const event of data) {
    if (!event.email_job_id && (event.status === 'accepted' || event.status === 'delivered')) {
      byWish[event.birthday_page_id] = (byWish[event.birthday_page_id] || 0) + 1;
    }
  }
  const acceptedJobs = jobs.filter((job) => job.status === 'accepted' || job.status === 'delivered');
  for (const job of acceptedJobs) {
    byWish[job.birthday_page_id] = (byWish[job.birthday_page_id] || 0) + 1;
  }
  const legacyAccepted = data.filter((event) => !event.email_job_id && (event.status === 'accepted' || event.status === 'delivered'));
  return {
    total: acceptedJobs.length + legacyAccepted.length,
    scheduled: jobs.filter((job) => job.status === 'scheduled' || job.status === 'processing').length,
    failedAttempts: data.filter((event) => event.status === 'failed').length,
    delivered: jobs.filter((job) => job.delivery_status === 'delivered').length +
      data.filter((event) => !event.email_job_id && event.status === 'delivered').length,
    byWish,
    events: data.map((event) => ({
      id: event.id,
      birthdayPageId: event.birthday_page_id,
      jobId: event.email_job_id,
      recipientEmail: event.recipient_email,
      senderDisplayName: event.sender_display_name || '',
      status: event.status,
      deliveryStatus: event.delivery_status,
      createdAt: event.created_at,
      providerMessageId: event.provider_message_id,
      errorMessage: event.error_message,
    })),
    jobs: jobs.map((job) => ({
      id: job.id,
      birthdayPageId: job.birthday_page_id,
      recipientEmail: job.recipient_email,
      senderDisplayName: job.sender_display_name,
      scheduledAt: job.scheduled_at,
      timeZone: job.timezone,
      status: job.status,
      deliveryStatus: job.delivery_status,
      attemptCount: job.attempt_count,
      maxAttempts: job.max_attempts,
      providerMessageId: job.provider_message_id,
      lastError: job.last_error,
      createdAt: job.created_at,
    })),
  };
}

export async function importGuestWishes(): Promise<number> {
  if (typeof window === 'undefined' || !isSupabaseConfigured || !supabase) return 0;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return 0;

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return 0;
  const stored: unknown = JSON.parse(raw);
  if (!Array.isArray(stored)) return 0;

  const guestWishes = stored.filter(
    (item): item is BirthdayWishData =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      typeof item.id === 'string' &&
      !item.id.startsWith('preview-wish') &&
      'slug' in item &&
      typeof item.slug === 'string' &&
      (!('userId' in item) || !item.userId || item.userId === user.id),
  );

  let imported = 0;
  for (const wish of guestWishes) {
    const saved = await saveWish({ ...wish, userId: user.id });
    updateLocalList(saved);
    imported += 1;
  }
  return imported;
}

// Delete wish
export async function deleteWish(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (user && UUID_PATTERN.test(id)) {
      const { error } = await supabase.from('wishes').delete().eq('id', id);
      if (error) {
        console.error('Could not delete account birthday website:', error);
        throw error;
      }
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
