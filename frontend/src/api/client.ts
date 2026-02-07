// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 
  "http://localhost:8000/api/v1";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
}
