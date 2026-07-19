export type VocabCard = {
  id: string;
  name: string;
  language: string;
  word_count: number;
  preview?: string[];
  updated_at: string;
};


export type VocabFile = {
  id: string;
  name: string;
  word_count: number;
  preview: string[];
  updated_at: string;
};
export type VocabListResponse = {
  items: VocabFile[];
  limit?: number;
  offset?: number;
  total: number;
};
