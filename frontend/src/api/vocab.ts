// api/vocab.ts
import { apiFetch } from "./client";
import type { VocabListResponse } from "../types/vocab";

export function listVocabs(params?: {
  language?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams(params as any).toString();

  return apiFetch<VocabListResponse>(`/vocabularies/recent?${query}`);
}


export function getVocabWords(vocabId: string) {
  return apiFetch<string[]>(
    `/vocabularies/${encodeURIComponent(vocabId)}/words`
  );
}