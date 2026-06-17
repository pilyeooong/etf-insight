"""네이버 금융 ETF 데이터 수집.

공개 엔드포인트 etfItemList.nhn 한 번으로 전 종목(약 1,100+)의
현재가/기준가(NAV)/등락률/거래량/거래대금/시총/분류를 받는다. 로그인·OTP 불필요.

비고: 이 엔드포인트는 '최신 세션' 스냅샷이라 거래일 파라미터가 없다.
크롤러는 호출 시점의 KST 거래일로 스탬프한다(장 마감 후 평일 실행 전제).
KRX 공식(data.krx.co.kr)은 ETF 전종목 시세가 로그인 게이트라 미사용.
"""
from __future__ import annotations

import requests

ETF_LIST_URL = "https://finance.naver.com/api/sise/etfItemList.nhn"

# etfTabCode → 분류(category). finder 테마와는 별개의 큰 분류.
TAB_CATEGORY = {
    1: "국내 시장지수",
    2: "국내 업종/테마",
    3: "국내 파생",
    4: "해외 주식",
    5: "원자재",
    6: "채권",
    7: "기타",
}

# 종목명 접두 브랜드 → 운용사. (네이버 list엔 운용사가 없어 접두로 추정)
ISSUER_BY_BRAND = {
    "KODEX": "삼성자산운용",
    "TIGER": "미래에셋자산운용",
    "RISE": "KB자산운용",        # 구 KBSTAR
    "KBSTAR": "KB자산운용",
    "ACE": "한국투자신탁운용",     # 구 KINDEX
    "KINDEX": "한국투자신탁운용",
    "SOL": "신한자산운용",
    "PLUS": "한화자산운용",        # 구 ARIRANG
    "ARIRANG": "한화자산운용",
    "HANARO": "NH아문디자산운용",
    "KOSEF": "키움투자자산운용",
    "히어로즈": "키움투자자산운용",
    "WON": "우리자산운용",
    "TIMEFOLIO": "타임폴리오자산운용",
    "BNK": "BNK자산운용",
    "마이다스": "마이다스에셋자산운용",
    "파워": "교보악사자산운용",
    "FOCUS": "브이아이자산운용",
    "TREX": "유리자산운용",
    "다같이": "케이비자산운용",
}

_session = requests.Session()
_session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Referer": "https://finance.naver.com/sise/etf.naver",
    }
)


def _issuer(name: str) -> str | None:
    head = name.strip().split(" ", 1)[0]
    return ISSUER_BY_BRAND.get(head)


# 종목명 키워드 → finder 태그
TAG_RULES = [
    ("레버리지", "레버리지"),
    ("인버스", "인버스"),
    ("커버드콜", "커버드콜"),
    ("액티브", "액티브"),
    ("배당", "배당"),
    ("고배당", "배당"),
]


def _tags(name: str) -> list[str]:
    out: list[str] = []
    for kw, tag in TAG_RULES:
        if kw in name and tag not in out:
            out.append(tag)
    return out


def fetch_etf_list() -> list[dict]:
    """전 종목 원시 항목 리스트."""
    r = _session.get(ETF_LIST_URL, timeout=30)
    r.raise_for_status()
    data = r.json()
    if data.get("resultCode") != "success":
        raise RuntimeError(f"네이버 응답 비정상: {data.get('resultCode')}")
    return data["result"]["etfItemList"]


def parse_quotes(items: list[dict], trade_date: str) -> tuple[list[dict], list[dict]]:
    """원시 항목 → (meta rows, daily_quote rows).

    trade_date: 'YYYY-MM-DD' (스탬프할 거래일)
    """
    metas, quotes = [], []
    for it in items:
        code = str(it.get("itemcode", "")).strip()
        if not code:
            continue
        name = str(it.get("itemname", "")).strip()
        close = it.get("nowVal")
        nav = it.get("nav")
        premium = None
        if isinstance(close, (int, float)) and isinstance(nav, (int, float)) and nav:
            premium = round((close - nav) / nav * 100, 4)

        metas.append(
            {
                "code": code,
                "name": name,
                "issuer": _issuer(name),
                "category": TAB_CATEGORY.get(it.get("etfTabCode")),
                "tags": _tags(name),
            }
        )
        quotes.append(
            {
                "code": code,
                "date": trade_date,
                "close": close,
                "change_pct": it.get("changeRate"),
                "volume": it.get("quant"),
                "trading_value": it.get("amonut"),  # 단위: 백만원
                "nav": nav,
                "premium_pct": premium,
                "market_cap": it.get("marketSum"),  # 단위: 억원
                "net_assets": None,  # 이 엔드포인트엔 없음(추후 상세에서 보강)
            }
        )
    return metas, quotes


if __name__ == "__main__":
    items = fetch_etf_list()
    metas, quotes = parse_quotes(items, "2026-06-16")
    print(f"{len(items)} 종목")
    print("meta[0]:", metas[0])
    print("quote[0]:", quotes[0])
