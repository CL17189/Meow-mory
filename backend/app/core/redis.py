import json
import os
import time
from typing import Any

import redis

REDIS_URL = os.getenv("MEOWMORY_REDIS_URL") or os.getenv("REDIS_URL") or "redis://127.0.0.1:6379/0"
REDIS_ENABLED = os.getenv("MEOWMORY_REDIS_ENABLED", "1").lower() not in {"0", "false", "no"}

_client: redis.Redis | None = None


def get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.Redis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=0.25,
            socket_timeout=0.25,
            health_check_interval=30,
        )
    return _client


def get_json(key: str) -> Any | None:
    if not REDIS_ENABLED:
        return None
    try:
        value = get_client().get(key)
        return json.loads(value) if value else None
    except redis.RedisError:
        return None


def set_json(key: str, value: Any, ttl_seconds: int = 30) -> bool:
    if not REDIS_ENABLED:
        return False
    try:
        get_client().setex(key, ttl_seconds, json.dumps(value, default=_json_default))
        return True
    except redis.RedisError:
        return False


def delete_pattern(pattern: str) -> int:
    if not REDIS_ENABLED:
        return 0
    try:
        client = get_client()
        keys = list(client.scan_iter(match=pattern, count=100))
        return client.delete(*keys) if keys else 0
    except redis.RedisError:
        return 0


def redis_status() -> dict[str, Any]:
    if not REDIS_ENABLED:
        return {"configured": False, "available": False, "url": REDIS_URL, "reason": "disabled"}
    started = time.perf_counter()
    try:
        get_client().ping()
        return {"configured": True, "available": True, "url": REDIS_URL, "latency_ms": round((time.perf_counter() - started) * 1000, 2)}
    except redis.RedisError as exc:
        return {"configured": True, "available": False, "url": REDIS_URL, "reason": str(exc)}


def _json_default(value: Any):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    raise TypeError(f"Cannot serialize {type(value).__name__}")
