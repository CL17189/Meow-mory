import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, register } from "../api/auth";
import GoogleLoginButton from "../auth/GoogleLoginButton";
import { useAuth } from "../auth/AuthContext";
import "./AuthPage.css";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = mode === "login" ? await login({ email, password }) : await register({ email, password, display_name: displayName || undefined });
      setSession(response);
      const target = (location.state as { from?: string } | null)?.from || "/";
      navigate(target, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not complete this request.");
    } finally { setLoading(false); }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-illustration" aria-hidden="true">🐈‍⬛</div>
        <span className="eyebrow">Welcome to meowmory</span>
        <h1>{mode === "login" ? "Come back to your stories." : "Start your little learning journey."}</h1>
        <p className="auth-subtitle">Your vocabulary and stories stay connected to your own account.</p>
        <GoogleLoginButton />
        <div className="auth-divider"><span>or use email</span></div>
        <form onSubmit={submit} className="auth-form">
          {mode === "register" && <label>Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="What should we call you?" autoComplete="name" /></label>}
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" required autoComplete="email" /></label>
          <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder={mode === "register" ? "At least 8 characters" : "Your password"} minLength={mode === "register" ? 8 : 1} required autoComplete={mode === "register" ? "new-password" : "current-password"} /></label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <p className="auth-switch">{mode === "login" ? "New to meowmory?" : "Already have an account?"} <Link to={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create one" : "Sign in"}</Link></p>
      </section>
    </main>
  );
}
