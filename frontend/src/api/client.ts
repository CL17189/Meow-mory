// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 
  "http://localhost:8000/api/v1";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("meowmory_access_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message ?? err?.message ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
