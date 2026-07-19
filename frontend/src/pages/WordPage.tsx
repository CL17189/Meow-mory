import { useEffect, useState } from "react";

import MyVocabularySection from "../components/words/MyVocabularySection";
import SystemVocabularySection from "../components/words/SystemVocabularySection";
import UploadWordsSection from "../components/words/UploadWordsSection";

import { listVocabs } from "../api/vocab";
import type { VocabCard } from "../types/vocab";

import "../styles/WordPage.css";
import LanguageSelect from "../components/LanguageSelect";
import { useAuth } from "../auth/AuthContext";
import { updatePreferredLanguage } from "../api/auth";
import type { LanguageCode } from "../constants/languages";

export default function WordPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState(user?.preferred_language ?? "en");
  const [savedVocabs, setSavedVocabs] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.preferred_language) setLanguage(user.preferred_language);
  }, [user?.preferred_language]);

  async function fetchVocabs() {
    setLoading(true);
    setError(null);

    try {
      const res = await listVocabs({
        language,
        limit: 3,
        offset: 0,
      });

      setSavedVocabs(res.items);
    } catch (e) {
      console.error(e);
      setError("Failed to load vocabularies. Perhaps you need to upload some words first?");
    } finally {
      setLoading(false);
    }
  }

  // 页面初始化加载
  useEffect(() => {
    fetchVocabs();
  }, [language]);

  // 上传完成后刷新
  function handleUploadSuccess() {
    fetchVocabs();
  }

  function handleLanguageChange(nextLanguage: LanguageCode) {
    setLanguage(nextLanguage);
    void updatePreferredLanguage(nextLanguage);
  }

  return (
    <div className="word-page">
      <header className="page-toolbar">
        <div><span className="eyebrow">Build your word garden</span><h1>Vocabulary</h1><p>Keep every word connected to the language you are learning.</p></div>
        <LanguageSelect value={language} onChange={handleLanguageChange} />
      </header>
      {loading && <div className="wp-loading">Loading vocabularies…</div>}

      {error && <div className="wp-error">{error}</div>}

      {!loading && !error && (
        <MyVocabularySection vocabs={savedVocabs} />
      )}

      <SystemVocabularySection language={language} />

      <UploadWordsSection language={language} onSuccess={handleUploadSuccess} />
    </div>
  );
}
