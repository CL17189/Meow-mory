import { apiFetch } from "./client";

export type AuthUser = {
  user_id: number;
  email: string;
  display_name?: string | null;
  preferred_language: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export function register(data: { email: string; password: string; display_name?: string }) {
  return apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export function login(data: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export function loginWithGoogle(credential: string) {
  return apiFetch<AuthResponse>("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
}

export function getMe() {
  return apiFetch<AuthUser>("/auth/me");
}

export function updateProfile(data: { display_name?: string; preferred_language?: string }) {
  return apiFetch<AuthUser>("/auth/me", { method: "PATCH", body: JSON.stringify(data) });
}

export function updatePreferredLanguage(preferred_language: string) {
  return updateProfile({ preferred_language });
}

export function logout() {
  return apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
}

export function deleteAccount() {
  return apiFetch<void>("/auth/me", { method: "DELETE" });
}
