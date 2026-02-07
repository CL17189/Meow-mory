import { useEffect, useState } from "react";
import VocabCard from "./VocabCard";
import type { VocabCard as Card } from "../../types/vocab";

export default function SystemVocabularySection({
  language,
}: {
  language: string;
}) {
  const [systemVocabs, setSystemVocabs] = useState<Card[]>([]);

  useEffect(() => {
    // mock：未来替换成 API
    setSystemVocabs([
      {
        id: "sys-a1",
        title: `${language.toUpperCase()} A1 Core`,
        difficulty: "easy",
        total: 800,
        progress: 0,
      },
      {
        id: "sys-b1",
        title: `${language.toUpperCase()} B1 Core`,
        difficulty: "medium",
        total: 1500,
        progress: 0,
      },
    ]);
  }, [language]);

  return (
    <section>
      <h2>System Vocabulary</h2>

      <div className="vocab-grid">
        {systemVocabs.map((v) => (
          <VocabCard key={v.id} card={v} />
        ))}
      </div>
    </section>
  );
}
