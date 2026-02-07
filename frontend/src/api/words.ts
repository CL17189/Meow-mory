import { apiFetch } from "./client";
import type { WordImportRequest, WordImportResponse } from "../types/word";

export function importWords(data: WordImportRequest) {
  return apiFetch<WordImportResponse>("/words", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
