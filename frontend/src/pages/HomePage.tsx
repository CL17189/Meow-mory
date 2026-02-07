// src/pages/WordsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { StoryListResponse, StoryListItem } from "../types/stories";
import { listStories } from "../api/stories";

import type{ VocabFile } from "../types/vocab";
import { listVocabs } from "../api/vocab";


import "./HomePage.css";



type StoryCard = StoryListItem;

const PAGE_STEP = 5;

// 系统词库（备选展示｜Meow Style）
const SYSTEM_WORDS_BY_DIFFICULTY: Record<string, string[]> = {
  easy: ["nyaaaa", "meowmeow", "purru", "nyan~", "mimi"],

  medium: [
    "meow-worky",
    "nya-city",
    "purr-time",
    "mrr-friend",
    "meow-human",
  ],

  hard: [
    "meow-adaptify",
    "nya-evaluate",
    "purr-optimize",
    "mrr-improve",
    "meow-transform",
  ],
};


export default function HomePage() {
  const navigate = useNavigate();

  // Stories state
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [storiesLimit, setStoriesLimit] = useState<number>(PAGE_STEP);
  const [storiesTotal, setStoriesTotal] = useState<number>(0);
  const [loadingStories, setLoadingStories] = useState<boolean>(false);

  // Words state
  const [vocabs, setVocabs] = useState<VocabFile[]>([]);
  const [vocabsLimit, setVocabsLimit] = useState<number>(PAGE_STEP);
  const [vocabsTotal, setVocabsTotal] = useState(0);
  const [loadingVocabs, setLoadingVocabs] = useState(false);


  // listStories 接受 { limit, offset }
  async function fetchStories(limit = storiesLimit) {
    setLoadingStories(true);
    try {
      const res: StoryListResponse = await listStories({ language:"en", limit, offset: 0 });
      setStories(res.items);
      setStoriesTotal(res.total);
    } catch (e) {
      console.error("fetchStories error", e);
    } finally {
      setLoadingStories(false);
    }
  }

  // 模拟 listWords API（前端 mock）
  async function fetchVocabs(limit = vocabsLimit) {
  setLoadingVocabs(true);

  try {
    const res = await listVocabs({
      language: "en",
      limit,
      offset: 0,
    });

    setVocabs(res.items);
    setVocabsTotal(res.total);
  } catch (e) {
    console.error("fetchVocabs error", e);
    setVocabs([]);
    setVocabsTotal(0);
  } finally {
    setLoadingVocabs(false);
  }
}


  function goToStory(storyId: number) {
  navigate(`/stories/${storyId}`);
  }


  useEffect(() => {
    fetchStories(storiesLimit);
  }, [storiesLimit]);

  useEffect(() => {
  fetchVocabs(vocabsLimit);
  }, [vocabsLimit]);


  function handleLoadMoreStories() {
    setStoriesLimit((p) => p + PAGE_STEP);
  }

  function handleLoadMoreWords() {
    setVocabsLimit((p) => p + PAGE_STEP);
  }

  function goToGenerate() {
    navigate("/stories/generate");
  }

  // Render helpers
  const storyCard = (s: StoryCard) => (
  <article
    key={s.story_id}
    className="wp-story-card"
    role="button"
    tabIndex={0}
    onClick={() => goToStory(s.story_id)}
    onKeyDown={(e) => {
      if (e.key === "Enter") goToStory(s.story_id);
    }}
  >
    <div className="wp-story-thumb" aria-hidden>
      <div className="wp-thumb-shape" />
    </div>

    <div className="wp-story-meta">
      <div className="wp-story-lang">{s.language.toUpperCase()}</div>
      <div className="wp-story-excerpt">
        {s.content.length > 120
          ? s.content.slice(0, 120) + "…"
          : s.content}
      </div>
      <div className="wp-story-time">
        {new Date(s.created_at).toLocaleString()}
      </div>
    </div>
  </article>
  );


  const vocabCard = (v: VocabFile) => (
  <div key={v.id} className="wp-vocab-card">
    <div className="wp-vocab-title">{v.name}</div>

    <div className="wp-vocab-meta">
      {v.word_count} words
    </div>

    <div className="wp-vocab-preview">
      {v.preview.join(", ")}…
    </div>

    <div className="wp-vocab-time">
      {new Date(v.updated_at).toLocaleDateString()}
    </div>
  </div>
);


  // Fallback system words
  const fallbackSystemWords = Object.values(SYSTEM_WORDS_BY_DIFFICULTY)
    .flat()
    .slice(0, 5);

  return (
    <div className="wp-page">
      <div className="wp-top">
        <section className="wp-stories-section">
          <header className="wp-section-header">
            <h2>My Stories</h2>
            <span className="wp-sub">Recent</span>
          </header>

          <div className="wp-stories-grid">
            {loadingStories ? (
              <div className="wp-loading">Loading stories…</div>
            ) : stories.length > 0 ? (
              stories.map((s) => storyCard(s))
            ) : (
              <div className="wp-empty">You have no stories yet.</div>
            )}
          </div>

          <div className="wp-actions">
            <button
              className="wp-button"
              onClick={handleLoadMoreStories}
              disabled={loadingStories || stories.length >= storiesTotal}
            >
              Load more
            </button>
          </div>
        </section>

        <aside className="wp-right-cta">
          <div className="wp-cta-card">
            <h3>Generate New Stories</h3>
            <p>Create contextual stories from your vocabulary.</p>
            <button className="wp-primary" onClick={goToGenerate}>
              Generate
            </button>
          </div>
        </aside>
      </div>

      <div className="wp-bottom">
        <section className="wp-vocab-section">
          <header className="wp-section-header">
            <h2>My Vocabulary</h2>
            <span className="wp-sub">Saved words</span>
          </header>

          <div className="wp-vocab-list">
            {loadingVocabs ? (
              <div className="wp-loading">Loading words…</div>
            ) : vocabs.length > 0 ? (
              vocabs.slice(0, vocabsLimit).map((w) => vocabCard(w))
            ) : (
              <div className="wp-system-words">
                <p>No saved words — try these system meow words:</p>
                <div className="wp-system-grid">
                  {fallbackSystemWords.map((t) => (
                    <div key={t} className="wp-system-chip">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="wp-actions">
            <button
              className="wp-button"
              onClick={handleLoadMoreWords}
              disabled={loadingStories || vocabs.length >= vocabsTotal}
            >
              Load more
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
