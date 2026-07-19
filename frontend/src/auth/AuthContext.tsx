import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getMe, logout as logoutRequest, type AuthResponse, type AuthUser } from "../api/auth";

const TOKEN_KEY = "meowmory_access_token";
type AuthContextValue = { user: AuthUser | null; loading: boolean; setSession: (response: AuthResponse) => void; updateUser: (user: AuthUser) => void; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    getMe().then(setUser).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setUser(response.user);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => setUser(nextUser), []);

  const logout = useCallback(async () => {
    try { if (localStorage.getItem(TOKEN_KEY)) await logoutRequest(); } catch { /* local logout still succeeds */ }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, setSession, updateUser, logout }), [user, loading, setSession, updateUser, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export { TOKEN_KEY };
