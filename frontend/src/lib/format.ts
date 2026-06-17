export function fmt(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: digits });
}

export function pct(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined) return '-';
  return `${n > 0 ? '+' : ''}${n.toLocaleString('ko-KR', { maximumFractionDigits: digits })}%`;
}

// 한국식 등락 색상: 상승=빨강, 하락=파랑
export function signColor(n: number | null | undefined): string {
  if (n === null || n === undefined) return '#8b95a1';
  if (n > 0) return '#e5443a';
  if (n < 0) return '#1a73e8';
  return '#8b95a1';
}

// 억원 → 사람이 읽는 단위(조/억)
export function won억(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-';
  if (n >= 10000) return `${(n / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}조`;
  return `${n.toLocaleString('ko-KR')}억`;
}
