"""일배치 진입점. 네이버에서 ETF EOD + 상세 수집 → Supabase upsert.

Stage 1: etfItemList → etf_meta + etf_daily_quote (전 종목 1콜)
Stage 2: etfAnalysis(종목별) → etf_meta 보강 + etf_risk + etf_detail + etf_holding

환경변수: SUPABASE_URL, SUPABASE_SERVICE_KEY (crawler/.env 자동 로드)
옵션: FORCE=1(주말 무시), DRY=1(수집만), DETAIL_LIMIT=N(상세 N개만), NO_DETAIL=1(stage2 생략)
"""
from __future__ import annotations

import os
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import naver
import naver_detail
import supabase_io

KST = ZoneInfo("Asia/Seoul")
WORKERS = 8


def _load_env() -> None:
    """crawler/.env 를 환경변수로 로드(이미 설정된 값은 보존)."""
    env = Path(__file__).with_name(".env")
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


def main() -> int:
    _load_env()
    now = datetime.now(KST)
    trade_date = now.date().isoformat()
    force = os.environ.get("FORCE") == "1"
    dry = os.environ.get("DRY") == "1"
    no_detail = os.environ.get("NO_DETAIL") == "1"
    detail_limit = int(os.environ.get("DETAIL_LIMIT", "0"))

    if now.weekday() >= 5 and not force:
        print(f"[skip] 주말({trade_date}) — 거래일 아님. FORCE=1로 강제 실행 가능.")
        return 0

    # ── Stage 1: 전 종목 시세 ──
    print(f"[stage1] 시세 수집 trade_date={trade_date}")
    items = naver.fetch_etf_list()
    metas, quotes = naver.parse_quotes(items, trade_date)
    print(f"[stage1] {len(quotes)}종목")

    if dry:
        print("[dry] 적재 생략. meta:", metas[0], "\n        quote:", quotes[0])
        return 0

    print("[stage1] etf_meta:", supabase_io.upsert("etf_meta", metas, "code"))
    print("[stage1] etf_daily_quote:", supabase_io.upsert("etf_daily_quote", quotes, "code,date"))

    if no_detail:
        print("[done] (상세 생략)")
        return 0

    # ── Stage 2: 종목별 상세 ──
    codes = [m["code"] for m in metas]
    if detail_limit:
        codes = codes[:detail_limit]
    print(f"[stage2] 상세 수집 {len(codes)}종목 (workers={WORKERS})")

    name_by_code = {m["code"]: m["name"] for m in metas}
    meta_patch, risks, details, holdings = [], [], [], []

    def work(code: str):
        return naver_detail.fetch_detail(code, trade_date)

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for res in ex.map(work, codes):
            if not res:
                continue
            m = res["meta"]
            # 키 고정(벌크 upsert는 모든 행 키 동일 + name NOT NULL 필요). issuer는 stage1 값 보존.
            meta_patch.append(
                {
                    "code": m["code"],
                    "name": name_by_code.get(m["code"], m["code"]),
                    "base_index": m["base_index"],
                    "fee_pct": m["fee_pct"],
                    "tax_category": m["tax_category"],
                    "listing_date": m["listing_date"],
                }
            )
            risks.append(res["risk"])
            details.append(res["detail"])
            holdings.extend(res["holdings"])

    print(f"[stage2] 성공 {len(details)}/{len(codes)}, 구성종목 {len(holdings)}행")
    print("[stage2] etf_meta(보강):", supabase_io.upsert("etf_meta", meta_patch, "code"))
    print("[stage2] etf_risk:", supabase_io.upsert("etf_risk", risks, "code"))
    print("[stage2] etf_detail:", supabase_io.upsert("etf_detail", details, "code"))
    supabase_io.delete_all("etf_holding")
    print("[stage2] etf_holding:", supabase_io.upsert("etf_holding", holdings, "code,stock_code,stock_name"))
    print("[done]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
