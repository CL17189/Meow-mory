export type VocabCard = {
  id: number;
  name: string;
  language: string;
  word_count: number;
  updated_at: string;
};


export type VocabFile = {
  id: number;
  name: string;
  word_count: number;
  preview: string[];
  updated_at: string;
};
export type VocabListResponse = {
  items: VocabFile[];
  total: number;
};