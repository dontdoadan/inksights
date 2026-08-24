#!/usr/bin/env python3
"""Prepare a deterministic five-post INKCARE queue export from campaign templates."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

LONDON = ZoneInfo("Europe/London")


def next_monday(now: datetime) -> datetime:
    days = (7 - now.weekday()) % 7
    if days == 0:
        days = 7
    return (now + timedelta(days=days)).replace(hour=12, minute=30, second=0, microsecond=0)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", type=Path, default=Path(__file__).parent / "content" / "campaign-library.json")
    parser.add_argument("--output", type=Path, default=Path(__file__).parent / "seed" / "prepared-week.json")
    args = parser.parse_args()

    library = json.loads(args.library.read_text(encoding="utf-8"))
    campaign = library["campaigns"][0]
    start = next_monday(datetime.now(LONDON))
    posts = []
    for index, template in enumerate(campaign["posts"], start=1):
        item = dict(template)
        item.update(
            {
                "source_key": f"prepared_{start:%Y%m%d}_{index}",
                "campaign_code": campaign["campaign_code"],
                "platforms": ["instagram", "facebook"],
                "scheduled_at": (start + timedelta(days=index - 1)).isoformat(),
                "timezone": "Europe/London",
                "approval_status": "awaiting_approval",
                "publish_status": "queued",
            }
        )
        posts.append(item)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({"posts": posts}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
