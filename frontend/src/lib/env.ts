export function isTossApp(): boolean {
  return typeof window !== 'undefined' &&
    (window.location.hostname.includes('toss.im') ||
     navigator.userAgent.includes('TossApp'));
}

export function isDev(): boolean {
  return import.meta.env.DEV;
}

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || '';
}

export function getSupabaseUrl(): string {
  return import.meta.env.VITE_SUPABASE_URL || '';
}

export function getSupabaseAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}
