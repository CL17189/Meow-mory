import { useEffect, useMemo, useState } from "react";
import { lookupWord, type WordDefinition } from "../../api/dictionary";
import "./StoryArticle.css";

type Props = {
  content: string;
  highlightWords: string[];
  language?: string;
  onWordClick?: (word: string) => void;
};

type ReaderMode = "inline" | "hover";
type ActiveWord = { word: string; id: string } | null;

function splitChunks(content: string) {
  return content
    .split(/(?<=[.!?])\s+|(?<=[,;])\s+|\s+(?=(?:and|but|because|so|then)\s)/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function isTargetWord(token: string, targets: string[]) {
  const clean = token.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  return targets.some((target) => target.toLowerCase() === clean || clean.startsWith(`${target.toLowerCase()}-`));
}

function WordTooltip({ word, language, onOpen }: { word: string; language: string; onOpen?: (word: string) => void }) {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);

  useEffect(() => {
    let active = true;
    setDefinition(null);
    lookupWord(word, language).then((result) => { if (active) setDefinition(result); });
    return () => { active = false; };
  }, [word, language]);

  return (
    <span className="word-tooltip" role="tooltip" onClick={(event) => { event.stopPropagation(); onOpen?.(word); }}>
      <strong>{word}</strong>
      {definition ? <>
        <span className="tooltip-meta">{definition.partOfSpeech ?? "word"}{definition.phonetic ? ` · ${definition.phonetic}` : ""}</span>
        <span>{definition.definition}</span>
        {definition.example && <em>“{definition.example}”</em>}
      </> : <span className="tooltip-loading">Looking up the meaning…</span>}
    </span>
  );
}

function RichText({ text, targets, language, onOpenWord, onHover }: { text: string; targets: string[]; language: string; onOpenWord?: (word: string) => void; onHover?: (word: string) => void }) {
  return <>
    {text.split(/(\s+)/).map((part, index) => {
      if (!part.trim() || !isTargetWord(part, targets)) return <span key={`${part}-${index}`}>{part}</span>;
      const clean = part.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      return <span key={`${part}-${index}`} className="target-word" tabIndex={0} onMouseEnter={() => onHover?.(clean)} onFocus={() => onHover?.(clean)} onClick={() => onOpenWord?.(clean)}>{part}</span>;
    })}
  </>;
}

export default function StoryArticle({ content, highlightWords, language = "en", onWordClick }: Props) {
  const [mode, setMode] = useState<ReaderMode>("inline");
  const [activeWord, setActiveWord] = useState<ActiveWord>(null);
  const chunks = useMemo(() => splitChunks(content), [content]);

  function activate(word: string, id: string) {
    setActiveWord({ word, id });
  }

  return (
    <section className="story-reader" aria-label="Story reader">
      <div className="reader-toolbar">
        <div>
          <span className="reader-label">Reading view</span>
          <p>Hover a highlighted word to see a quick meaning. Click it for a larger card.</p>
        </div>
        <div className="mode-switch" role="group" aria-label="Reading mode">
          <button type="button" className={mode === "inline" ? "active" : ""} onClick={() => setMode("inline")}>Inline</button>
          <button type="button" className={mode === "hover" ? "active" : ""} onClick={() => setMode("hover")}>Hover</button>
        </div>
      </div>

      {mode === "inline" ? (
        <div className="story-inline" onMouseLeave={() => setActiveWord(null)}>
          {chunks.map((chunk, index) => {
            const id = `chunk-${index}`;
            return <p className={activeWord?.id === id ? "story-chunk active" : "story-chunk"} key={id}>
              <RichText text={chunk} targets={highlightWords} language={language} onOpenWord={onWordClick} onHover={(word) => activate(word, id)} />
              {activeWord?.id === id && <WordTooltip word={activeWord.word} language={language} onOpen={onWordClick} />}
            </p>;
          })}
        </div>
      ) : (
        <p className="story-hover" onMouseLeave={() => setActiveWord(null)}>
          <RichText text={content} targets={highlightWords} language={language} onOpenWord={onWordClick} onHover={(word) => activate(word, "hover-reader")} />
          {activeWord?.id === "hover-reader" && <WordTooltip word={activeWord.word} language={language} onOpen={onWordClick} />}
        </p>
      )}
      <div className="reader-hint"><span aria-hidden="true">✦</span> Highlighted words are from your vocabulary</div>
    </section>
  );
}
