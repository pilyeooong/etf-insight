import { useRef, useState } from 'react';
import { Text } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { SearchIcon, CloseIcon } from '@/components/icons';

// 홈·비교 공유 검색창.
// 기본은 돋보기 아이콘 pill(접힘) → 탭하면 입력창이 펼쳐짐(콘텐츠 폭 100% = 테마 칩 행과 정렬).
// 닫기 버튼은 검색을 초기화하고 다시 접어요.
export function SearchField({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder,
  collapsedLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void; // 닫기 시 검색 상태 초기화
  placeholder: string;
  collapsedLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function expand() {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function collapse() {
    onClear();
    setExpanded(false);
  }

  // 접힘: 돋보기 아이콘 버튼 (입력값이 없을 때만)
  if (!expanded && !value) {
    return (
      <button
        type="button"
        onClick={expand}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 14px',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: colors.grey100,
        }}
      >
        <SearchIcon size={18} color={colors.grey600} />
        <Text typography="st13" fontWeight="medium" color={colors.grey600}>
          {collapsedLabel}
        </Text>
      </button>
    );
  }

  // 펼침: 콘텐츠 폭에 꽉 차는 입력창
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        boxSizing: 'border-box',
        padding: '11px 14px',
        borderRadius: 12,
        background: colors.grey50,
        border: `1px solid ${colors.grey200}`,
      }}
    >
      <SearchIcon size={18} color={colors.grey500} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 15,
          color: colors.grey900,
          padding: 0,
        }}
      />
      <button
        type="button"
        onClick={collapse}
        aria-label="검색 닫기"
        style={{
          display: 'inline-flex',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: 2,
        }}
      >
        <CloseIcon size={16} color={colors.grey500} />
      </button>
    </form>
  );
}
