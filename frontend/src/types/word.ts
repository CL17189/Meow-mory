// types/word.ts

export type WordImportRequest = {
  language?: string;
  words: string[];
};

export type WordImportResponse = {
  language: string;
  inserted: number;
  skipped: number;
  total: number;
};
