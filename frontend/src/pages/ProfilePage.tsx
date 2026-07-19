import { useEffect, useState } from "react";

import LanguageSelect from "../components/LanguageSelect";
import { updateProfile } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import type { LanguageCode } from "../constants/languages";
import "./AccountPage.css";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [language, setLanguage] = useState<LanguageCode>((user?.preferred_language ?? "en") as LanguageCode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.display_name ?? "");
    setLanguage(user.preferred_language as LanguageCode);
  }, [user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateProfile({ display_name: displayName.trim(), preferred_language: language });
      updateUser(updated);
      setDisplayName(updated.display_name ?? "");
      setMessage("Your profile is saved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn’t save your profile.");
    } finally {
      setSaving(false);
    }
  }

  const initial = (user?.display_name || user?.email || "M").charAt(0).toUpperCase();

  return (
    <div className="account-page">
      <header className="account-toolbar">
        <div><span className="eyebrow">A little about you</span><h1>Your profile</h1><p>Keep your learning space personal and welcoming.</p></div>
      </header>
      <div className="account-layout">
        <section className="account-card account-summary">
          <div className="account-avatar-large" aria-hidden="true">{initial}</div>
          <h2>{user?.display_name || "Learner"}</h2>
          <p>{user?.email}</p>
          <span className="account-badge">Meowmory learner</span>
        </section>
        <section className="account-card">
          <h2>Profile details</h2>
          <p className="account-card-intro">Your email is used for sign in. Your display name appears around your learning nook.</p>
          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-field">Email address<input type="email" value={user?.email ?? ""} readOnly /></label>
            <label className="account-field">Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="How should we call you?" required /></label>
            <LanguageSelect value={language} onChange={setLanguage} label="Learning language" />
            {error && <p className="account-error">{error}</p>}
            <div className="account-actions">
              <button className="account-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
              {message && <p className="account-message" role="status">{message}</p>}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
