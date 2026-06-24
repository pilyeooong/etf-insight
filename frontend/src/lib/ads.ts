// 광고 그룹 ID — dev/prod 분기.
// 개발 단계(dev)에서는 테스트 ID를 사용해요(실제 ID로 테스트 시 정책 위반).
// 프로덕션 빌드에서는 콘솔 발급 prod ID(.env VITE_AD_*)만 사용해요.
//   ⚠️ 출시 번들에 테스트 ID 문자열이 남아 있으면 콘솔 검수에서 거절돼요.
//   → 테스트 ID는 `import.meta.env.DEV` 분기 안에만 둬서 prod 빌드 시 트리셰이킹으로 제거되게 함.

import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 전면/보상형 풀스크린 광고 SDK 지원 여부(미지원 환경=브라우저/구버전 토스앱).
export function isFullScreenAdSupported(): boolean {
  try {
    return loadFullScreenAd.isSupported() && showFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

// 개발 목(mock) 광고 모드. 실제 광고 SDK가 없는 브라우저(dev)에서 광고 '위치/타이밍/흐름'을
// 눈으로 확인하기 위한 가짜 광고를 켜요. 프로덕션 빌드에서는 항상 false → 절대 노출 안 됨.
export const AD_MOCK = import.meta.env.DEV;

// import.meta.env.DEV는 Vite가 빌드 타임에 true/false 리터럴로 치환 → prod에선 dev 분기 전체가
// 죽은 코드로 제거되어 'ait-ad-test-*' 문자열이 번들에 포함되지 않아요.
export const AD_IDS = import.meta.env.DEV
  ? {
      banner: 'ait-ad-test-banner-id',
      nativeImage: 'ait-ad-test-native-image-id',
      interstitial: 'ait-ad-test-interstitial-id',
      rewarded: 'ait-ad-test-rewarded-id',
    }
  : {
      banner: import.meta.env.VITE_AD_BANNER_ID ?? '',
      nativeImage: import.meta.env.VITE_AD_NATIVE_ID ?? '',
      interstitial: import.meta.env.VITE_AD_INTERSTITIAL_ID ?? '',
      rewarded: import.meta.env.VITE_AD_REWARDED_ID ?? '',
    };
