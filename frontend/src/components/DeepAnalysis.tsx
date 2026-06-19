import { useState } from 'react';
import { Text } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { AdGate } from '@/components/AdGate';
import { useAsync } from '@/hooks/useAsync';
import { fetchPeerComparison } from '@/lib/queries';
import type { PeerComparison, PeerMetric } from '@/lib/queries';
import type { EtfDetail, EtfHolding, EtfMeta } from '@/types/etf';

// 리워드 게이트 + 지연 페치 래퍼. 상세 화면에 그대로 꽂아 써요(자체 훅 보유).
export function DeepAnalysisSection({
  meta,
  detail,
  holdings,
}: {
  meta: EtfMeta;
  detail: EtfDetail | null;
  holdings: EtfHolding[];
}) {
  const [revealed, setRevealed] = useState(false);
  const comparison = useAsync(
    () => (revealed ? fetchPeerComparison(meta, detail) : Promise.resolve(null)),
    [revealed, meta.code],
  );

  const hasConc = holdings.filter((h) => h.weight != null && h.weight > 0).length >= 3;
  const maybeHasPeer = Boolean(meta.base_index || meta.category);
  if (!maybeHasPeer && !hasConc) return null; // 분석할 재료가 전혀 없으면 섹션 숨김

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <Text typography="t6" fontWeight="bold" color={colors.grey900}>
          심화 분석
        </Text>
      </div>
      {!revealed ? (
        <>
          <div style={{ marginBottom: 12, lineHeight: 1.6 }}>
            <Text typography="st12" color={colors.grey500}>
              동종 ETF 중 비용·분배수익률 위치와 구성 집중도를 광고 시청 후 확인할 수 있어요.
            </Text>
          </div>
          <AdGate cta="광고 보고 심화 분석 보기" onRewardGranted={() => setRevealed(true)} />
        </>
      ) : comparison.loading ? (
        <Text typography="st12" color={colors.grey500}>
          분석 중…
        </Text>
      ) : comparison.data || hasConc ? (
        <DeepAnalysis comparison={comparison.data ?? null} holdings={holdings} />
      ) : (
        <Text typography="st12" color={colors.grey400}>
          동종 그룹 데이터가 부족해 분석을 제공하기 어려워요.
        </Text>
      )}
    </div>
  );
}

// 보유 데이터로 산출하는 심화 분석: 동종 그룹 내 상대 위치 + 구성 집중도.
// 모두 객관적 통계(사실)이며 매수/매도 권유·종합 등급이 아니에요.
export function DeepAnalysis({
  comparison,
  holdings,
}: {
  comparison: PeerComparison | null;
  holdings: EtfHolding[];
}) {
  const weighted = holdings.filter((h) => h.weight != null && h.weight > 0);
  const top10 = weighted.reduce((a, h) => a + (h.weight ?? 0), 0);
  const top3 = weighted.slice(0, 3).reduce((a, h) => a + (h.weight ?? 0), 0);
  const hasConc = weighted.length >= 3;
  const concLabel = top3 >= 55 ? '집중형' : top3 >= 30 ? '보통' : '분산형';

  return (
    <div>
      {comparison && (
        <>
          <div style={{ marginBottom: 4 }}>
            <Text typography="st12" color={colors.grey500}>
              {comparison.groupLabel} · {comparison.count}개 ETF 중 위치
            </Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 10 }}>
            {comparison.metrics.map((m) => (
              <MetricRow key={m.key} m={m} />
            ))}
          </div>
        </>
      )}

      {hasConc && (
        <div style={{ marginTop: comparison ? 26 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <Text typography="st11" fontWeight="bold" color={colors.grey900}>
              구성 집중도
            </Text>
            <Text typography="st12" fontWeight="bold" color={colors.blue500}>
              {concLabel}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <ConcCell label="상위 3종목" value={top3} />
            <ConcCell label="상위 10종목" value={top10} />
          </div>
          <div style={{ marginTop: 8 }}>
            <Text typography="st13" color={colors.grey400}>
              상위 3종목 비중이 높을수록 소수 종목 쏠림이 커요(TOP10 기준).
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricRow({ m }: { m: PeerMetric }) {
  // 마커는 '순위 백분위'로 배치(왼쪽=1위/좋은 쪽). 순위 텍스트와 어긋나지 않게.
  const frac = m.total <= 1 ? 0.5 : (m.rank - 1) / (m.total - 1);
  const left = `${Math.min(98, Math.max(2, frac * 100))}%`;
  const isTop = m.rank === 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <Text typography="st12" color={colors.grey500}>
          {m.label}
        </Text>
        <div>
          <Text typography="st12" fontWeight="bold" color={colors.grey900}>
            {fmtPct(m.value)}
          </Text>
          <Text typography="st12" color={colors.grey400}>
            {' '}
            · {m.total}개 중{' '}
          </Text>
          <Text typography="st12" fontWeight="bold" color={isTop ? colors.blue500 : colors.grey700}>
            {m.rank}위
          </Text>
        </div>
      </div>
      <div style={{ position: 'relative', height: 6, background: colors.grey100, borderRadius: 3 }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left,
            width: 12,
            height: 12,
            borderRadius: 6,
            background: colors.blue500,
            border: `2px solid ${colors.white}`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <Text typography="st13" color={colors.grey400}>
          {m.better === 'low' ? '낮음' : '높음'} {fmtPct(m.better === 'low' ? m.min : m.max)}
        </Text>
        <Text typography="st13" color={colors.grey400}>
          {fmtPct(m.better === 'low' ? m.max : m.min)} {m.better === 'low' ? '높음' : '낮음'}
        </Text>
      </div>
    </div>
  );
}

function ConcCell({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, background: colors.grey50, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ marginBottom: 4 }}>
        <Text typography="st13" color={colors.grey500}>
          {label}
        </Text>
      </div>
      <Text typography="t5" fontWeight="bold" color={colors.grey900}>
        {value.toFixed(1)}%
      </Text>
    </div>
  );
}

function fmtPct(v: number): string {
  return `${Number(v.toFixed(2))}%`;
}
