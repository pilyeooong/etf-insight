import { useMemo, useState } from 'react';
import { ListRow } from '@/components/ListRow';
import { useAsync } from '@/hooks/useAsync';
import { searchByHolding, searchByName, searchByTag } from '@/lib/queries';
import type { EtfListRow } from '@/types/etf';

const THEMES = ['반도체', 'AI', '2차전지', '조선', '방산', '원자력', '미국', '배당'];
const TAGS = ['레버리지', '인버스', '커버드콜', '액티브', '배당'];

async function runSearch(query: string, tag: string | null): Promise<EtfListRow[]> {
  if (tag) return searchByTag(tag, 50);
  const q = query.trim();
  if (!q) return [];
  const [byName, byHolding] = await Promise.all([searchByName(q, 40), searchByHolding(q, 40)]);
  const seen = new Set<string>();
  const merged: EtfListRow[] = [];
  for (const r of [...byName, ...byHolding]) {
    if (seen.has(r.code)) continue;
    seen.add(r.code);
    merged.push(r);
  }
  return merged;
}

export function SearchPage() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const { data, loading, error } = useAsync(() => runSearch(query, tag), [query, tag]);
  const hasResult = useMemo(() => (data?.length ?? 0) > 0, [data]);

  return (
    <div style={{ padding: '20px 16px 88px', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px', color: '#191f28' }}>
        ETF 찾기
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTag(null);
          setQuery(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ETF 이름 또는 종목명 (예: 삼성전자, 반도체)"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px 16px',
            borderRadius: 12,
            border: '1px solid #e5e8eb',
            fontSize: 15,
            outline: 'none',
          }}
        />
      </form>

      <Chips
        label="테마"
        items={THEMES}
        active={null}
        onPick={(t) => {
          setTag(null);
          setInput(t);
          setQuery(t);
        }}
      />
      <Chips
        label="유형"
        items={TAGS}
        active={tag}
        onPick={(t) => {
          setInput('');
          setQuery('');
          setTag((cur) => (cur === t ? null : t));
        }}
      />

      <div style={{ marginTop: 8 }}>
        {loading && <p style={{ color: '#8b95a1', padding: '16px 0' }}>검색 중…</p>}
        {error && <p style={{ color: '#e5443a', padding: '16px 0' }}>오류: {error}</p>}
        {!loading && !error && !hasResult && (query || tag) && (
          <p style={{ color: '#8b95a1', padding: '16px 0' }}>결과가 없습니다.</p>
        )}
        {!loading && !error && !query && !tag && (
          <p style={{ color: '#8b95a1', padding: '16px 0', fontSize: 14, lineHeight: 1.7 }}>
            키워드·종목명으로 검색하거나, 위 칩으로 빠르게 찾아보세요.
            <br />
            종목명(예: 삼성전자)으로 검색하면 그 종목을 담은 ETF를 찾아줍니다.
          </p>
        )}
        {data?.map((row) => <ListRow key={row.code} row={row} />)}
      </div>
    </div>
  );
}

function Chips({
  label,
  items,
  active,
  onPick,
}: {
  label: string;
  items: string[];
  active: string | null;
  onPick: (t: string) => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, color: '#8b95a1', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: active === t ? '#3182f6' : '#f2f4f6',
              color: active === t ? '#fff' : '#4e5968',
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
