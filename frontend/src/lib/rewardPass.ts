// 리워드 광고 유예 패스. 심화 분석을 보려고 광고를 1회 시청하면
// 이후 GRACE회까지는 광고 없이 바로 열람할 수 있어요(매번 시청 강요 회피).
// 세션 단위(모듈 메모리). 앱을 새로 켜면 초기화돼요.
const GRACE = 3;

let credits = 0;

export function getRewardCredits(): number {
  return credits;
}

// 광고 시청 완료 시 호출 — 이후 GRACE회 유예 부여.
export function grantRewardPass(): void {
  credits = GRACE;
}

// 유예 1회 사용(남은 횟수 반환). 0이면 변화 없음.
export function consumeRewardCredit(): number {
  if (credits > 0) credits -= 1;
  return credits;
}
