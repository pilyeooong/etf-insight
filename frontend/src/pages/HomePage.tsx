import { useState } from 'react';
import { ListRow } from '@/components/ListRow';
import { useAsync } from '@/hooks/useAsync';
import { fetchTopList, type ListMode } from '@/lib/queries';
import { isSupabaseConfigured } from '@/lib/supabase';

const TABS: { mode: ListMode; label: string }[] = [
  { mode: 'volume', label: '거래량' },
  { mode: 'gainers', label: '상승' },
  { mode: 'losers', label: '하락' },
];

export function HomePage() {
  const [mode, setMode] = useState<ListMode>('volume');
  const { data, loading, error } = useAsync(() => fetchTopList(mode, 30), [mode]);

  return (
    <div style={{ padding: '20px 16px 88px', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 2px', color: '#191f28' }}>ETF나우</h1>
      <p style={{ fontSize: 13, color: '#8b95a1', margin: '0 0 16px' }}>
        국내 ETF · 종가 기준 괴리율
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {TABS.map((t) => (
          <button
            key={t.mode}
            onClick={() => setMode(t.mode)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              background: mode === t.mode ? '#191f28' : '#f2f4f6',
              color: mode === t.mode ? '#fff' : '#4e5968',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!isSupabaseConfigured() && (
        <Notice>Supabase 환경변수(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)를 설정하세요.</Notice>
      )}
      {loading && <p style={{ color: '#8b95a1', padding: '20px 0' }}>불러오는 중…</p>}
      {error && <Notice>오류: {error}</Notice>}
      {data?.map((row) => <ListRow key={row.code} row={row} />)}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#f6f8fa',
        borderRadius: 10,
        padding: '12px 14px',
        fontSize: 13,
        color: '#4e5968',
        lineHeight: 1.6,
        margin: '12px 0',
      }}
    >
      {children}
    </div>
  );
}
