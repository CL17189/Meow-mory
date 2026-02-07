import { useEffect, useState } from "react";

import MyVocabularySection from "../components/words/MyVocabularySection";
import SystemVocabularySection from "../components/words/SystemVocabularySection";
import UploadWordsSection from "../components/words/UploadWordsSection";

import { listVocabs } from "../api/vocab";
import type { VocabCard } from "../types/vocab";

import "../styles/WordPage.css";

export default function WordPage() {
  const [savedVocabs, setSavedVocabs] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchVocabs() {
    setLoading(true);
    setError(null);

    try {
      const res = await listVocabs({
        language: "en",
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
  }, []);

  // 上传完成后刷新
  function handleUploadSuccess() {
    fetchVocabs();
  }

  return (
    <div className="word-page">
      {loading && <div className="wp-loading">Loading vocabularies…</div>}

      {error && <div className="wp-error">{error}</div>}

      {!loading && !error && (
        <MyVocabularySection vocabs={savedVocabs} />
      )}

      <SystemVocabularySection language="en" />

      <UploadWordsSection onSuccess={handleUploadSuccess} />
    </div>
  );
}
