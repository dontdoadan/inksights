#!/usr/bin/env python3
"""Approval-gated INKCARE Instagram/Facebook queue runner."""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

GRAPH_VERSION = os.getenv("META_GRAPH_VERSION", "v23.0")


def env_bool(name: str, default: bool = True) -> bool:
    raw = os.getenv(name)
    return default if raw is None else raw.lower() not in {"0", "false", "no", "off"}


def request(method: str, url: str, headers: dict[str, str] | None = None,
            json_body: Any | None = None, form: dict[str, Any] | None = None) -> Any:
    body = None
    headers = dict(headers or {})
    if json_body is not None:
        body = json.dumps(json_body).encode()
        headers["Content-Type"] = "application/json"
    elif form is not None:
        body = urllib.parse.urlencode(form).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=body, headers=headers, method=method), timeout=45) as response:
            raw = response.read().decode()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {detail[:800]}") from exc


class SupabaseStore:
    def __init__(self) -> None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
        self.base = url.rstrip("/")
        self.headers = {"apikey": key, "Authorization": f"Bearer {key}", "Prefer": "return=representation"}

    def control(self) -> dict[str, Any]:
        rows = request("GET", f"{self.base}/rest/v1/social_automation_settings?id=eq.true&select=*", self.headers)
        if not rows:
            raise RuntimeError("social_automation_settings is missing")
        return rows[0]

    def peek(self, limit: int, include_drafts: bool) -> list[dict[str, Any]]:
        approval = "in.(approved,awaiting_approval)" if include_drafts else "eq.approved"
        query = urllib.parse.urlencode({
            "select": "*", "approval_status": approval,
            "publish_status": "in.(queued,dry_run_validated,failed)",
            "order": "scheduled_at.asc.nullsfirst", "limit": str(limit),
        }, safe="(),.*")
        return request("GET", f"{self.base}/rest/v1/social_content_queue?{query}", self.headers) or []

    def claim(self, limit: int) -> list[dict[str, Any]]:
        return request("POST", f"{self.base}/rest/v1/rpc/claim_social_content_queue", self.headers,
                       {"p_worker": os.getenv("WORKER_ID", "github-actions"), "p_limit": limit}) or []

    def log(self, payload: dict[str, Any]) -> None:
        request("POST", f"{self.base}/rest/v1/publication_log", self.headers, payload)

    def update(self, queue_id: str, payload: dict[str, Any]) -> None:
        request("PATCH", f"{self.base}/rest/v1/social_content_queue?id=eq.{queue_id}", self.headers, payload)


def load_seed(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    items = payload.get("posts") if isinstance(payload, dict) else payload
    if not isinstance(items, list):
        raise RuntimeError("Seed must be a JSON array or {posts: [...]} object")
    return items


def validate_item(item: dict[str, Any], live: bool) -> list[str]:
    errors = [f"missing {field}" for field in ("source_key", "caption", "platforms") if not item.get(field)]
    platforms = item.get("platforms") or []
    unsupported = set(platforms) - {"instagram", "facebook"}
    if unsupported:
        errors.append(f"unsupported platforms: {sorted(unsupported)}")
    hashtags = item.get("hashtags") or []
    if not isinstance(hashtags, list):
        errors.append("hashtags must be an array")
    elif len(hashtags) > 12:
        errors.append("hashtags exceed the 12-tag limit")
    if live and item.get("approval_status") != "approved":
        errors.append("approval_status must be approved for live publication")
    if live and not item.get("media_url"):
        errors.append("media_url is required for live publication")
    return errors


def caption(item: dict[str, Any]) -> str:
    tags = item.get("hashtags") or []
    return f"{item.get('caption', '').strip()}\n\n{' '.join(tags)}".strip()


def planned_payloads(item: dict[str, Any]) -> dict[str, dict[str, Any]]:
    media = item.get("media_url") or "<required-before-live>"
    result: dict[str, dict[str, Any]] = {}
    if "instagram" in item.get("platforms", []):
        result["instagram"] = {"image_url": media, "caption": caption(item)}
    if "facebook" in item.get("platforms", []):
        result["facebook"] = {"url": media, "caption": caption(item), "published": True}
    return result


def dry_run(items: list[dict[str, Any]], store: SupabaseStore | None) -> int:
    failures = 0
    for item in items:
        errors = validate_item(item, live=False)
        payloads = planned_payloads(item)
        print(json.dumps({"source_key": item.get("source_key"), "valid": not errors,
                          "approval_status": item.get("approval_status"), "errors": errors,
                          "planned_requests": payloads}, ensure_ascii=False))
        failures += bool(errors)
        if store and item.get("id"):
            for platform, payload in payloads.items():
                store.log({
                    "queue_id": item["id"], "platform": platform, "dry_run": True,
                    "attempt_number": int(item.get("attempt_count") or 0) + 1,
                    "status": "validated" if not errors else "failed",
                    "idempotency_key": f"{item['id']}:{platform}:dry-run:{time.time_ns()}",
                    "request_payload": payload, "response_payload": {"errors": errors},
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                })
    return int(bool(failures))


def meta_publish(platform: str, item: dict[str, Any]) -> str:
    token = os.getenv("META_ACCESS_TOKEN")
    page_id = os.getenv("META_PAGE_ID")
    ig_id = os.getenv("META_IG_USER_ID")
    if not token or not page_id or not ig_id:
        raise RuntimeError("META_ACCESS_TOKEN, META_PAGE_ID and META_IG_USER_ID are required")
    base = f"https://graph.facebook.com/{GRAPH_VERSION}"
    if platform == "facebook":
        result = request("POST", f"{base}/{page_id}/photos", form={
            "url": item["media_url"], "caption": caption(item), "published": "true", "access_token": token,
        })
        post_id = (result or {}).get("post_id") or (result or {}).get("id")
    else:
        container = request("POST", f"{base}/{ig_id}/media", form={
            "image_url": item["media_url"], "caption": caption(item), "access_token": token,
        })
        creation_id = (container or {}).get("id")
        if not creation_id:
            raise RuntimeError(f"Instagram container missing ID: {container}")
        time.sleep(2)
        result = request("POST", f"{base}/{ig_id}/media_publish", form={
            "creation_id": creation_id, "access_token": token,
        })
        post_id = (result or {}).get("id")
    if not post_id:
        raise RuntimeError(f"{platform} response missing post ID: {result}")
    return str(post_id)


def live_run(items: list[dict[str, Any]], store: SupabaseStore) -> int:
    failed = False
    for item in items:
        errors = validate_item(item, live=True)
        if errors:
            store.update(item["id"], {"publish_status": "failed", "last_error": "; ".join(errors)})
            failed = True
            continue
        ids: dict[str, str] = {}
        platform_errors: dict[str, str] = {}
        for platform in item["platforms"]:
            try:
                ids[platform] = meta_publish(platform, item)
                status = "published"
                error = None
            except Exception as exc:
                status = "failed"
                error = str(exc)
                platform_errors[platform] = error
                failed = True
            store.log({
                "queue_id": item["id"], "platform": platform, "dry_run": False,
                "attempt_number": int(item.get("attempt_count") or 1), "status": status,
                "idempotency_key": f"{item['id']}:{platform}:live:{item.get('attempt_count', 1)}",
                "request_payload": planned_payloads(item)[platform],
                "response_payload": {"post_id": ids.get(platform)},
                "external_post_id": ids.get(platform), "error_message": error,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            })
        expected = len(item["platforms"])
        publish_status = "published" if len(ids) == expected else "partially_published" if ids else "failed"
        store.update(item["id"], {
            "publish_status": publish_status,
            "instagram_status": "published" if "instagram" in ids else "failed" if "instagram" in platform_errors else "skipped",
            "facebook_status": "published" if "facebook" in ids else "failed" if "facebook" in platform_errors else "skipped",
            "instagram_post_id": ids.get("instagram"), "facebook_post_id": ids.get("facebook"),
            "instagram_error": platform_errors.get("instagram"), "facebook_error": platform_errors.get("facebook"),
            "last_error": "; ".join(platform_errors.values()) or None,
            "published_at": datetime.now(timezone.utc).isoformat() if publish_status == "published" else None,
            "locked_at": None, "locked_by": None,
        })
    return int(failed)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed-file", type=Path)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--include-awaiting-approval", action="store_true")
    args = parser.parse_args()
    is_dry_run = env_bool("DRY_RUN", True)
    store = None
    if args.seed_file:
        items = load_seed(args.seed_file)[:args.limit]
    else:
        store = SupabaseStore()
        control = store.control()
        if bool(control.get("dry_run", True)) != is_dry_run:
            raise RuntimeError("DRY_RUN environment/database mismatch")
        items = store.peek(args.limit, args.include_awaiting_approval) if is_dry_run else store.claim(args.limit)
    if not items:
        print("No eligible queue items.")
        return 0
    if is_dry_run:
        return dry_run(items, store)
    if store is None:
        raise RuntimeError("Live publication is prohibited in seed-file mode")
    return live_run(items, store)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
