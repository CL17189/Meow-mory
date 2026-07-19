import "./CatLoader.css";

type Props = { step?: number };

export default function CatLoader({ step = 0 }: Props) {
  const messages = [
    "Mimi is checking your words…",
    "Mimi is writing a tiny adventure…",
    "Adding the final whiskers…",
  ];

  return (
    <div className="cat-loader" role="status" aria-live="polite">
      <div className="cat-loader-scene" aria-hidden="true">
        <span className="cat-spark spark-one">✦</span>
        <span className="cat-spark spark-two">✦</span>
        <div className="cat-track" />
        <div className="dancing-cat">🐈</div>
        <div className="cat-shadow" />
      </div>
      <div className="cat-loader-copy">
        <strong>{messages[Math.min(step, messages.length - 1)]}</strong>
        <span>A warm story is on its way.</span>
        <div className="cat-dots" aria-hidden="true"><i /><i /><i /></div>
      </div>
    </div>
  );
}
