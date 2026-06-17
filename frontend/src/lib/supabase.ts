import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env';

// 추가 의존성(@supabase/supabase-js) 없이 PostgREST를 직접 호출하는 경량 클라이언트.
// 읽기 전용(anon 키). 쓰기는 크롤러(service_role)만 수행.

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

// table: 'etf_daily_quote' 등, query: PostgREST 쿼리스트링('select=...&order=...')
export async function selectFrom(table: string, query: string): Promise<any[]> {
  const base = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!base || !key) {
    throw new Error('Supabase 환경변수 미설정 (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const url = `${base.replace(/\/$/, '')}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase 조회 실패 ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}
