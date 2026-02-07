export interface StoryListItem {
  story_id: number;
  language: string;
  content: string;
  created_at: string;
}

export interface StoryListResponse {
  items: StoryListItem[];
  limit: number;
  offset: number;
  total: number;
}


export interface GenerateStoryRequest {
  lang: string;
  words: string[];
  wordcount?: number;
  difficulty?: string;
  style?: string;
  startwith?: string;
}

export interface GenerateStoryResponse {
  story_id: number;
  language: string;
  content: string;
  word_count: number;
  created_at: string;
}



// 文章使用到的词条（你的描述）
export interface StoryWordUsage {
  story_id: number;
  word: string;
}