import "./VocabCard.css";
//import bookIcon from "../../assets/book.png"; // 本地图标

import type { VocabCard as Card } from "../../types/vocab";

export default function VocabCard({ card }: { card: Card }) {
  return (
    <article className="vocab-card">
    <img
        src="https://cdn.jsdelivr.net/npm/heroicons@2.1.5/24/outline/book-open.svg"
        alt=""
        className="vocab-thumb"
        />


      <div className="vocab-meta">
        <h4>{card.name}</h4>
        <div className="vocab-info">
          <span>{card.language.toUpperCase()}</span>
          <span>Total: {card.word_count}</span>
        </div>

        <div className="vocab-progress">
          <div
            className="vocab-progress-bar"
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </article>
  );
}
