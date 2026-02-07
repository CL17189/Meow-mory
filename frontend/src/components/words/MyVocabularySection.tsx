import VocabCard from "./VocabCard";
import type { VocabCard as Card } from "../../types/vocab";

export default function MyVocabularySection({
  vocabs,
}: {
  vocabs: Card[];
}) {
  return (
    <section>
      <h2>My Vocabulary</h2>

      <div className="vocab-grid">
        {vocabs.length === 0 ? (
          <div>No saved words yet.</div>
        ) : (
          vocabs.map((v) => <VocabCard key={v.id} card={v} />)
        )}
      </div>
    </section>
  );
}
