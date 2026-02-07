import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StoryArticle from "../components/story/StoryArticle";
import WordInfoModal from "../components/story/WordInfoModal";
import type { GenerateStoryResponse } from "../types/stories";
import { getStory, getStoryWords } from "../api/stories";


export default function StoryShowPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<GenerateStoryResponse | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [selectedWordForModal, setSelectedWordForModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;

    setLoading(true);
    setError(null);

    Promise.all([getStory(storyId), getStoryWords(storyId)])
      .then(([storyData, wordUsages]) => {
        setStory(storyData);
        setWords(wordUsages.map((w) => w.word));
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load story data.");
      })
      .finally(() => setLoading(false));
  }, [storyId]);

  if (loading) return <div>Loading story...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!story) return <div>No story found.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Story #{story.story_id}</h1>
      <p style={{ color: "#666", marginBottom: 12 }}>
        {story.language.toUpperCase()} • {new Date(story.created_at).toLocaleString()}
      </p>

      <StoryArticle
        content={story.content}
        highlightWords={words}
        onWordClick={(w) => setSelectedWordForModal(w)}
      />

      <WordInfoModal
        word={selectedWordForModal}
        onClose={() => setSelectedWordForModal(null)}
      />
    </div>
  );
}
