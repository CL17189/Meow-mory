import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StoryArticle from "../components/story/StoryArticle";
import WordInfoModal from "../components/story/WordInfoModal";
import type { GenerateStoryResponse } from "../types/stories";
import { getStory, getStoryWords } from "../api/stories";
import "./StoryHistoryPage.css";
import { notifyStreakUpdated } from "../api/stats";

export default function StoryShowPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<GenerateStoryResponse | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;
    setLoading(true);
    setError(null);
    Promise.all([getStory(storyId), getStoryWords(storyId)])
      .then(([storyData, wordUsages]) => { setStory(storyData); setWords(wordUsages.map((item) => item.word)); notifyStreakUpdated(); })
      .catch(() => setError("We couldn’t open this story."))
      .finally(() => setLoading(false));
  }, [storyId]);

  if (loading) return <div className="story-state"><span>🐾</span><p>Finding your story…</p></div>;
  if (error) return <div className="story-state error"><p>{error}</p></div>;
  if (!story) return <div className="story-state"><p>No story found.</p></div>;

  return (
    <div className="story-page">
      <div className="story-topline"><button type="button" className="back-link" onClick={() => window.history.back()}>← Back</button><span>{story.language.toUpperCase()} · {new Date(story.created_at).toLocaleDateString()}</span></div>
      <header className="story-header">
        <span className="eyebrow">A story made for you</span>
        <h1>Story #{story.story_id}</h1>
        <p>{story.word_count} words · {words.length} vocabulary words to notice</p>
      </header>
      <article className="story-card">
        <StoryArticle content={story.content} highlightWords={words} language={story.language} onWordClick={setSelectedWord} />
      </article>
      <WordInfoModal word={selectedWord} language={story.language} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
