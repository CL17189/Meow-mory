import { useEffect, useState } from "react";
import VocabCard from "./VocabCard";
import type { VocabCard as Card } from "../../types/vocab";
import { listVocabs } from "../../api/vocab";

export default function SystemVocabularySection({
  language,
}: {
  language: string;
}) {
  const [systemVocabs, setSystemVocabs] = useState<Card[]>([]);

  useEffect(() => {
    listVocabs({ language, limit: 20, offset: 0 })
      .then((response) => setSystemVocabs(response.items))
      .catch(() => setSystemVocabs([]));
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
