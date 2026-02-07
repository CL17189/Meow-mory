import { useState } from "react";
import { importWords } from "../../api/words";
import type { WordImportRequest } from "../../types/word";

const WORDS_REGEX = /^[^,]+(,\s*[^,]+)*$/;

export default function UploadWordsSection({
  onSuccess,
}: {
  onSuccess: (count: number) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const text = input.trim();

    if (!text) {
      setError("Please enter some words.");
      return;
    }

    if (!WORDS_REGEX.test(text)) {
      setError("Use comma-separated English words.");
      return;
    }

    const words = text.split(",").map((w) => w.trim());

    const payload: WordImportRequest = {
      words,
    };

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await importWords(payload);

      const count = res.count ?? words.length;

      onSuccess(count);

      setInput("");
      setSuccess(`Successfully imported ${count} words.`);

      // 3 秒后自动消失
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (e) {
      console.error(e);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="wp-upload-card">
      <h2 className="wp-upload-title">Add Vocabulary</h2>

      <p className="wp-upload-desc">
        Enter words separated by commas.
      </p>

      <form onSubmit={handleSubmit} className="wp-upload-form">
        <textarea
          className="wp-upload-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="apple, water, study, future"
          disabled={loading}
        />

        {/* 成功提示 */}
        {success && (
          <div className="wp-upload-success">
            {success}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="wp-upload-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="wp-upload-btn"
          disabled={loading}
        >
          {loading ? "Uploading…" : "Upload"}
        </button>
      </form>
    </section>
  );
}
