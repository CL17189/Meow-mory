export type WordDefinition = {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
};

const cache = new Map<string, WordDefinition | null>();

export async function lookupWord(word: string, language = "en"): Promise<WordDefinition | null> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return null;
  if (cache.has(`${language}:${normalized}`)) return cache.get(`${language}:${normalized}`) ?? null;

  if (language !== "en") {
    const fallback = { word: normalized, definition: "Target vocabulary from this story." };
    cache.set(`${language}:${normalized}`, fallback);
    return fallback;
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`);
    if (!response.ok) throw new Error("Dictionary lookup failed");
    const entries = await response.json();
    const meaning = entries?.[0]?.meanings?.[0];
    const result: WordDefinition = {
      word: entries?.[0]?.word ?? normalized,
      phonetic: entries?.[0]?.phonetic,
      partOfSpeech: meaning?.partOfSpeech,
      definition: meaning?.definitions?.[0]?.definition ?? "No short definition found.",
      example: meaning?.definitions?.[0]?.example,
    };
    cache.set(`${language}:${normalized}`, result);
    return result;
  } catch {
    const fallback = { word: normalized, definition: "Meaning unavailable right now. Try clicking the word again later." };
    cache.set(`${language}:${normalized}`, fallback);
    return fallback;
  }
}
