import { useEffect, useState } from "react";
import { lookupWord, type WordDefinition } from "../../api/dictionary";
import "./WordInfoModal.css";

export default function WordInfoModal({ word, language = "en", onClose }: { word: string | null; language?: string; onClose: () => void }) {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);

  useEffect(() => {
    if (!word) return;
    let active = true;
    setDefinition(null);
    lookupWord(word, language).then((result) => { if (active) setDefinition(result); });
    return () => { active = false; };
  }, [word, language]);

  if (!word) return null;

  return (
    <div className="word-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="word-modal" role="dialog" aria-modal="true" aria-labelledby="word-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close word definition">×</button>
        <span className="modal-kicker">Vocabulary note</span>
        <h2 id="word-modal-title">{word}</h2>
        {definition ? <>
          <div className="modal-definition-meta">{definition.partOfSpeech ?? "word"}{definition.phonetic ? ` · ${definition.phonetic}` : ""}</div>
          <p className="modal-definition">{definition.definition}</p>
          {definition.example && <p className="modal-example">“{definition.example}”</p>}
        </> : <p className="modal-loading">Looking up the meaning…</p>}
        <button className="modal-done" type="button" onClick={onClose}>Back to reading</button>
      </div>
    </div>
  );
}
