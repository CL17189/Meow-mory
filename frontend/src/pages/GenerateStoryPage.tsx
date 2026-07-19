import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import VocabCard from "../components/words/VocabCard";
import CatLoader from "../components/CatLoader";
import { getVocabWords, listVocabs } from "../api/vocab";
import { generateStory } from "../api/stories";
import type { VocabCard as Card } from "../types/vocab";
import type { GenerateStoryRequest } from "../types/stories";
import "./GenerateStoryPage.css";
import LanguageSelect from "../components/LanguageSelect";
import type { LanguageCode } from "../constants/languages";
import { useAuth } from "../auth/AuthContext";
import { updatePreferredLanguage } from "../api/auth";
import { notifyStreakUpdated } from "../api/stats";

const STEPS = ["Checking your words…", "Writing a tiny adventure…", "Adding the final whiskers…"];

export default function StoryGeneratePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState(user?.preferred_language ?? "en");
  const [existingVocabs, setExistingVocabs] = useState<Card[]>([]);
  const [loadingVocabs, setLoadingVocabs] = useState(false);
  const [vocabsError, setVocabsError] = useState<string | null>(null);
  const [selectedVocabId, setSelectedVocabId] = useState<string | null>(null);
  const [vocabWords, setVocabWords] = useState<string[]>([]);
  const [loadingVocabWords, setLoadingVocabWords] = useState(false);
  const [vocabWordsError, setVocabWordsError] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(3);
  const [difficulty, setDifficulty] = useState<GenerateStoryRequest["difficulty"]>("A1");
  const [style, setStyle] = useState<GenerateStoryRequest["style"]>("joke");
  const [intro, setIntro] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    setLoadingVocabs(true);
    setSelectedVocabId(null);
    setVocabWords([]);
    setSelectedWords([]);
    listVocabs({ language, limit: 20, offset: 0 })
      .then((response) => setExistingVocabs(response.items ?? []))
      .catch(() => setVocabsError("We couldn’t load your vocabulary yet."))
      .finally(() => setLoadingVocabs(false));
  }, [language]);

  function handleLanguageChange(nextLanguage: LanguageCode) {
    setLanguage(nextLanguage);
    void updatePreferredLanguage(nextLanguage);
  }

  function pickWords(words: string[], count: number) {
    return words.slice(0, Math.max(1, Math.min(count, words.length)));
  }

  async function fetchVocabWords(vocabId: string, count = wordCount) {
    setLoadingVocabWords(true);
    setVocabWordsError(null);
    setVocabWords([]);
    setSelectedWords([]);
    try {
      const words = await getVocabWords(vocabId);
      setVocabWords(words ?? []);
      setSelectedWords(pickWords(words ?? [], count));
    } catch {
      setVocabWordsError("This vocabulary is empty. Try adding a few words first.");
    } finally {
      setLoadingVocabWords(false);
    }
  }

  function handleSelectVocab(card: Card) {
    if (selectedVocabId === card.id) {
      setSelectedVocabId(null);
      setVocabWords([]);
      setSelectedWords([]);
      return;
    }
    setSelectedVocabId(card.id);
    void fetchVocabWords(card.id);
  }

  useEffect(() => {
    if (selectedVocabId && vocabWords.length) setSelectedWords(pickWords(vocabWords, wordCount));
  }, [wordCount, selectedVocabId, vocabWords]);

  function toggleSelectedWord(word: string) {
    setSelectedWords((current) => current.includes(word)
      ? current.filter((item) => item !== word)
      : [...current, word]);
  }

  async function startGeneration() {
    setGenError(null);
    if (!selectedVocabId) return setGenError("Choose a vocabulary to begin.");
    if (selectedWords.length < wordCount) return setGenError(`Choose ${wordCount} words for this story.`);

    setGenerating(true);
    setProgressStep(0);
    const interval = window.setInterval(() => setProgressStep((step) => Math.min(step + 1, STEPS.length - 1)), 1200);

    try {
      const response = await generateStory({
        language,
        words: selectedWords.slice(0, wordCount),
        wordcount: wordCount,
        difficulty,
        style,
        startwith: intro.trim() || undefined,
      });
      notifyStreakUpdated();
      window.clearInterval(interval);
      navigate(`/stories/${response.story_id}`);
    } catch (error) {
      console.error(error);
      window.clearInterval(interval);
      setGenerating(false);
      setGenError("Something went wrong while writing. Please try again.");
    }
  }

  return (
    <div className="generate-page">
      <div className="generate-heading">
        <div>
          <span className="eyebrow">A little reading adventure</span>
          <h1>Turn your words into a story.</h1>
          <p>Pick a few words, choose a mood, and let Meowmory make them memorable.</p>
        </div>
        <div className="generate-heading-controls"><LanguageSelect value={language} onChange={handleLanguageChange} /><div className="heading-cat" aria-hidden="true">🐱</div></div>
      </div>

      <div className="generate-layout">
        <div className="generate-main-column">
          <section className="generator-card">
            <div className="section-heading">
              <div><span className="step-number">1</span><div><h2>Choose a vocabulary</h2><p>Select the words you want to meet in your story.</p></div></div>
              <span className="section-note">{existingVocabs.length} available</span>
            </div>
            {loadingVocabs && <div className="soft-empty">Looking for your words…</div>}
            {vocabsError && <div className="inline-error">{vocabsError}</div>}
            {!loadingVocabs && !vocabsError && existingVocabs.length === 0 && <div className="soft-empty">No vocabulary yet. Add some words from the Vocabulary page.</div>}
            <div className="vocab-picker">
              {existingVocabs.map((vocab) => (
                <button key={vocab.id} type="button" className={selectedVocabId === vocab.id ? "vocab-option selected" : "vocab-option"} onClick={() => handleSelectVocab(vocab)} aria-pressed={selectedVocabId === vocab.id}>
                  <VocabCard card={vocab} />
                  {selectedVocabId === vocab.id && <span className="selected-check" aria-label="Selected">✓</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="generator-card">
            <div className="section-heading">
              <div><span className="step-number">2</span><div><h2>Choose your words</h2><p>We’ll start with a small set so the story stays easy to remember.</p></div></div>
              <span className="section-note">{selectedWords.length}/{wordCount}</span>
            </div>
            {loadingVocabWords && <div className="soft-empty">Opening the vocabulary…</div>}
            {vocabWordsError && <div className="inline-error">{vocabWordsError}</div>}
            {!loadingVocabWords && selectedVocabId && vocabWords.length > 0 && (
              <div className="word-picker">
                {vocabWords.map((word) => <button type="button" key={word} onClick={() => toggleSelectedWord(word)} className={selectedWords.includes(word) ? "word-chip selected" : "word-chip"} aria-pressed={selectedWords.includes(word)}>{word}</button>)}
              </div>
            )}
            {!selectedVocabId && <div className="soft-empty">Choose a vocabulary above to see its words.</div>}
          </section>
        </div>

        <aside className="settings-card">
          <div className="section-heading compact"><div><span className="step-number">3</span><div><h2>Set the mood</h2><p>Small choices, a different feeling.</p></div></div></div>
          <label className="field-label">Words in the story <span>{wordCount}</span><input type="range" min="1" max={Math.max(1, Math.min(vocabWords.length || 10, 10))} value={wordCount} onChange={(event) => setWordCount(Number(event.target.value))} /></label>
          <label className="field-label">Reading level<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}><option value="A1">A1 · gentle start</option><option value="A2">A2 · everyday</option><option value="B1">B1 · growing</option><option value="B2">B2 · confident</option><option value="C1+">C1+ · advanced</option></select></label>
          <label className="field-label">Story mood<select value={style} onChange={(event) => setStyle(event.target.value as typeof style)}><option value="joke">Playful</option><option value="romance">Tender</option><option value="science">Curious</option></select></label>
          <label className="field-label">Give it a little opening <span className="optional">optional</span><input value={intro} onChange={(event) => setIntro(event.target.value)} placeholder="On a rainy afternoon…" /></label>
          {genError && <div className="inline-error">{genError}</div>}
          {!generating ? <button className="generate-button" type="button" onClick={startGeneration}><span>Make my story</span><span aria-hidden="true">✦</span></button> : <CatLoader step={progressStep} />}
          <p className="privacy-note">Your words are used to make this story personal.</p>
        </aside>
      </div>
    </div>
  );
}
