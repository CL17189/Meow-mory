import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import VocabCard from "../components/words/VocabCard";
import { listVocabs } from "../api/vocab";
import { generateStory } from "../api/stories"; // 按你项目实际路径调整
import { getVocabWords } from "../api/vocab";

import type { VocabCard as Card } from "../types/vocab";

const catThinking = "https://cdn-icons-png.flaticon.com/512/616/616408.png";

export default function StoryGeneratePage() {
  const navigate = useNavigate();

  const [existingVocabs, setExistingVocabs] = useState<Card[]>([]);
  const [loadingVocabs, setLoadingVocabs] = useState(false);
  const [vocabsError, setVocabsError] = useState<string | null>(null);

  const [selectedVocabId, setSelectedVocabId] = useState<string | null>(null);
  const [vocabWords, setVocabWords] = useState<string[]>([]);
  const [loadingVocabWords, setLoadingVocabWords] = useState(false);
  const [vocabWordsError, setVocabWordsError] = useState<string | null>(null);

  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // generation params
  const [wordCount, setWordCount] = useState(3);
  const [difficulty, setDifficulty] = useState<"A1" | "A2" | "B1" | "B2" | "C1+">("A1");
  const [style, setStyle] = useState<"joke" | "romance" | "science">("joke");
  const [intro, setIntro] = useState<string>("");

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  // load vocab list on mount
  useEffect(() => {
    async function fetch() {
      setLoadingVocabs(true);
      setVocabsError(null);
      try {
        const res = await listVocabs({ language: "en", limit: 3, offset: 0 } as any);
        // assume res.items is Card[]
        setExistingVocabs(res.items ?? []);
      } catch (e) {
        console.error(e);
        setVocabsError("Failed to load vocabularies.");
      } finally {
        setLoadingVocabs(false);
      }
    }
    fetch();
  }, []);

  // fetch words for a selected vocab id
  async function fetchVocabWords(vocabId: string) {
    setLoadingVocabWords(true);
    setVocabWordsError(null);
    setVocabWords([]);
    setSelectedWords([]);
    try {
      // endpoint assumed: GET /vocabularies/{id}/words returning string[]
      const words: string[] = await getVocabWords(vocabId);
      setVocabWords(words ?? []);
      // auto select based on progress and requested wordCount
      const card = existingVocabs.find((c) => c.id === vocabId);
      const progress = Math.max(0, Math.min(1, card?.progress ?? 0));
      const auto = pickWordsByProgress(words ?? [], progress, wordCount);
      setSelectedWords(auto);
    } catch (e) {
      console.error(e);
      setVocabWordsError("Failed to load words for the selected vocabulary. Maybe it is empty?");
    } finally {
      setLoadingVocabWords(false);
    }
  }

  // helper: choose `count` words from `words` based on progress [0..1]
  function pickWordsByProgress(words: string[], progress: number, count: number) {
    if (!words || words.length === 0 || count <= 0) return [];
    const n = words.length;
    const maxStart = Math.max(0, n - count);
    const start = Math.min(maxStart, Math.floor(progress * (n - count + 1)));
    return words.slice(start, start + count);
  }

  // when user selects a vocab card
  async function handleSelectVocab(card: Card) {
    if (selectedVocabId === card.id) {
      // deselect
      setSelectedVocabId(null);
      setVocabWords([]);
      setSelectedWords([]);
      return;
    }

    setSelectedVocabId(card.id);
    await fetchVocabWords(card.id);
  }

  // if user changes wordCount, recompute auto-selection
  useEffect(() => {
    if (!selectedVocabId || vocabWords.length === 0) return;
    const card = existingVocabs.find((c) => c.id === selectedVocabId);
    const progress = Math.max(0, Math.min(1, card?.progress ?? 0));
    const auto = pickWordsByProgress(vocabWords, progress, wordCount);
    setSelectedWords(auto);
  }, [wordCount, selectedVocabId, vocabWords, existingVocabs]);

  // optionally allow user to toggle individual words from the auto-selection
  function toggleSelectedWord(word: string) {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  }

  async function startGeneration() {
    setGenError(null);

    if (!selectedVocabId) {
      setGenError("Please select a vocabulary first.");
      return;
    }

    if (selectedWords.length < wordCount) {
      setGenError("Selected words less than required count.");
      return;
    }

    const card = existingVocabs.find((c) => c.id === selectedVocabId);
    const lang = (card?.language as string) ?? "en";

    setGenerating(true);
    setProgressStep(0);

    // steps shown to user; English only
    const steps = ["Verifying words...", "Generating story...", "Finalizing output..."];

    // start visual progress
    let i = 0;
    const interval = setInterval(() => {
      setProgressStep(i + 1);
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
      }
    }, 1200);

    try {
      const payload = {
        lang,
        words: selectedWords.slice(0, wordCount),
        wordcount: wordCount,
        difficulty,
        style,
        startwith: intro || undefined,
      };

      const resp = await generateStory(payload as any);
      // navigate to story page returned by backend
      navigate(`/stories/${resp.story_id}`);
    } catch (e) {
      console.error(e);
      setGenError("Generation failed. Please try again.");
      setGenerating(false);
      setProgressStep(0);
    } finally {
      // if navigation didn't happen, stop generating state after a short delay
      setTimeout(() => {
        setGenerating(false);
        setProgressStep(0);
      }, 1000);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Generate Story</h1>

      <section>
        <h2>Choose Vocabulary</h2>

        {loadingVocabs ? (
          <div>Loading vocabularies...</div>
        ) : vocabsError ? (
          <div style={{ color: "red" }}>{vocabsError}</div>
        ) : existingVocabs.length === 0 ? (
          <div>No vocabularies available.</div>
        ) : (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {existingVocabs.map((v) => (
              <div
                key={v.id}
                onClick={() => handleSelectVocab(v)}
                style={{
                  border:
                    selectedVocabId === v.id ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                  borderRadius: 12,
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                <VocabCard card={v} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Selected Words</h2>

        {loadingVocabWords ? (
          <div>Loading words...</div>
        ) : vocabWordsError ? (
          <div style={{ color: "red" }}>{vocabWordsError}</div>
        ) : selectedVocabId === null ? (
          <div>Please select a vocabulary to load words.</div>
        ) : selectedWords.length === 0 ? (
          <div>No words selected.</div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {selectedWords.map((w) => (
              <button
                key={w}
                onClick={() => toggleSelectedWord(w)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: selectedWords.includes(w) ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Story Settings</h2>

        <div style={{ marginBottom: 12 }}>
          <label>
            Number of words:
            <input
              type="number"
              value={wordCount}
              min={1}
              max={vocabWords.length || 10}
              onChange={(e) => setWordCount(Math.max(1, Number(e.target.value)))}
              style={{ marginLeft: 8, width: 80 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              style={{ marginLeft: 8 }}
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1+">C1+</option>
            </select>
          </label>
          <p style={{ fontSize: 12, color: "#666" }}>
            A1 A2: basic everyday text, B1 B2: intermediate, C1+: advanced
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Style:
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              style={{ marginLeft: 8 }}
            >
              <option value="joke">Joke</option>
              <option value="romance">Romance</option>
              <option value="science">Science</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Intro:
            <input
              type="text"
              value={intro}
              placeholder="Story introduction"
              onChange={(e) => setIntro(e.target.value)}
              style={{ marginLeft: 8, width: "60%" }}
            />
          </label>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        {!generating ? (
          <>
            {genError && <div style={{ color: "red", marginBottom: 8 }}>{genError}</div>}

            <button
              style={{
                background: "#4f46e5",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: 12,
                fontSize: 16,
                cursor: "pointer",
                border: "none",
              }}
              onClick={startGeneration}
            >
              Surprise, Meowmory
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={catThinking} alt="cat thinking" style={{ width: 80, height: 80 }} />
            <div style={{ fontSize: 16 }}>
              {["Verifying words...", "Generating story...", "Finalizing output..."][
                Math.max(0, progressStep - 1)
              ] || "Starting..."}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
