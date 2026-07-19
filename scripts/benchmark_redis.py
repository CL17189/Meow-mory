"""Compare cached and uncached story-list reads.

Run with the API and Redis running:
  python scripts/benchmark_redis.py
"""
import os
import statistics
import time

import httpx
import redis


API_URL = os.getenv("MEOWMORY_API_URL", "http://127.0.0.1:8000")
REDIS_URL = os.getenv("MEOWMORY_REDIS_URL", "redis://127.0.0.1:6379/0")
EMAIL = os.getenv("MEOWMORY_BENCHMARK_EMAIL", "benchmark@example.com")
PASSWORD = os.getenv("MEOWMORY_BENCHMARK_PASSWORD", "benchmark-password")


def request_samples(client: httpx.Client, headers: dict[str, str], count: int, use_cache: bool) -> list[float]:
    samples = []
    for _ in range(count):
        started = time.perf_counter()
        response = client.get(f"{API_URL}/api/v1/stories?language=en&limit=20&offset=0&cache={'true' if use_cache else 'false'}", headers=headers)
        response.raise_for_status()
        samples.append((time.perf_counter() - started) * 1000)
    return samples


def summary(label: str, samples: list[float]) -> None:
    print(f"{label}: avg={statistics.mean(samples):.2f} ms, p50={statistics.median(samples):.2f} ms, p95={sorted(samples)[int(len(samples) * .95) - 1]:.2f} ms")


def clear_meowmory_cache(redis_client: redis.Redis) -> None:
    keys = list(redis_client.scan_iter(match="meowmory:*", count=100))
    if keys:
        redis_client.delete(*keys)


def main() -> None:
    redis_client = redis.Redis.from_url(REDIS_URL, socket_connect_timeout=1)
    redis_client.ping()
    with httpx.Client(timeout=10) as client:
        register = client.post(f"{API_URL}/api/v1/auth/register", json={"email": EMAIL, "password": PASSWORD})
        if register.status_code == 409:
            login = client.post(f"{API_URL}/api/v1/auth/login", json={"email": EMAIL, "password": PASSWORD})
            login.raise_for_status()
            token = login.json()["access_token"]
        else:
            register.raise_for_status()
            token = register.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        clear_meowmory_cache(redis_client)
        uncached = request_samples(client, headers, 30, use_cache=False)
        clear_meowmory_cache(redis_client)
        client.get(f"{API_URL}/api/v1/stories?language=en&limit=20&offset=0&cache=true", headers=headers)  # warm cache
        cached = request_samples(client, headers, 30, use_cache=True)

    summary("without Redis cache (database path)", uncached)
    summary("with Redis cache (cache hit)", cached)
    print(f"speedup (average): {statistics.mean(uncached) / statistics.mean(cached):.2f}x")


if __name__ == "__main__":
    main()
