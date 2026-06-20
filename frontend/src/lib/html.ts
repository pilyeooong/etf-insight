// 외부(네이버) HTML 설명을 안전한 평문으로 변환 — dangerouslySetInnerHTML 대체.
// 스크립트 실행/리소스 로드 없이 순수 문자열 처리(태그 제거 + 엔티티 디코드 + 줄바꿈 정리).
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function htmlToText(html: string | null | undefined): string {
  if (!html) return '';
  // 블록/줄바꿈 태그는 개행으로 보존한 뒤 나머지 태그 제거
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|tr|h[1-6])\s*>/gi, '\n');
  const stripped = withBreaks.replace(/<[^>]*>/g, '');
  const decoded = stripped.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n =
        code[1] === 'x' || code[1] === 'X'
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
    }
    const named = NAMED_ENTITIES[code.toLowerCase()];
    return named ?? m;
  });
  // 공백+개행 정리, 과다 빈 줄 축소
  return decoded
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
