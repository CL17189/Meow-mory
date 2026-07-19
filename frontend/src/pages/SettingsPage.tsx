import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LanguageSelect from "../components/LanguageSelect";
import { deleteAccount, updateProfile } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import type { LanguageCode } from "../constants/languages";
import "./AccountPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [language, setLanguage] = useState<LanguageCode>((user?.preferred_language ?? "en") as LanguageCode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.preferred_language) setLanguage(user.preferred_language as LanguageCode);
  }, [user?.preferred_language]);

  async function saveLanguage() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateProfile({ preferred_language: language });
      updateUser(updated);
      setMessage("Learning preferences saved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn’t save your settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Delete your account and all your stories and words? This cannot be undone.")) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setDeleting(false);
      setError(requestError instanceof Error ? requestError.message : "We couldn’t delete your account.");
    }
  }

  return (
    <div className="account-page">
      <header className="account-toolbar">
        <div><span className="eyebrow">Make it feel like yours</span><h1>Settings</h1><p>Choose how Meowmory supports your learning rhythm.</p></div>
      </header>
      <div className="account-settings-stack">
        <section className="account-card">
          <h2>Learning preferences</h2>
          <p className="account-card-intro">New vocabulary and stories will use this language by default.</p>
          <div className="account-setting-row">
            <div><h3>Default learning language</h3><p>You can still switch language on each page.</p></div>
            <LanguageSelect value={language} onChange={setLanguage} label="Default language" />
          </div>
          <div className="account-actions">
            <button className="account-primary" type="button" onClick={() => void saveLanguage()} disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
            {message && <p className="account-message" role="status">{message}</p>}
          </div>
        </section>
        <section className="account-card account-danger">
          <h2>Account and privacy</h2>
          <p className="account-danger-copy">Deleting your account permanently removes your stories, personal vocabulary, learning history, and streak data.</p>
          {error && <p className="account-error">{error}</p>}
          <button className="account-danger-button" type="button" onClick={() => void handleDeleteAccount()} disabled={deleting}>{deleting ? "Deleting…" : "Delete my account"}</button>
        </section>
      </div>
    </div>
  );
}
