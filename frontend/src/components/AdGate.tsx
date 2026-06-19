import { useEffect } from 'react';
import { Text } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { useRewardedAd } from '@/hooks/useRewardedAd';

// 보상형 광고 게이트: 광고 시청 완료 시 onRewardGranted 호출.
// 정책상 '클릭 보상'이 아니라 '시청 완료 시 기능 언락'이라 CTA를 명확히 표기.
export function AdGate({
  cta,
  onRewardGranted,
}: {
  cta: string;
  onRewardGranted: () => void;
}) {
  const { status, showAd } = useRewardedAd();

  useEffect(() => {
    if (status === 'rewarded') onRewardGranted();
  }, [status, onRewardGranted]);

  const disabled = status !== 'loaded';
  const label =
    status === 'showing'
      ? '광고 재생 중…'
      : status === 'error'
        ? '광고를 불러오지 못했어요'
        : status === 'loading'
          ? '광고 준비 중…'
          : cta;

  return (
    <button
      onClick={showAd}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '15px 0',
        borderRadius: 14,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        background: status === 'error' ? colors.grey200 : colors.blue500,
        opacity: status === 'loading' || status === 'showing' ? 0.6 : 1,
      }}
    >
      <Text typography="t5" fontWeight="bold" color={status === 'error' ? colors.grey600 : colors.white}>
        {label}
      </Text>
    </button>
  );
}
