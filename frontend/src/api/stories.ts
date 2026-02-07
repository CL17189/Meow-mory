import { apiFetch } from "./client";
import type { StoryListItem,StoryListResponse,GenerateStoryRequest,GenerateStoryResponse } from "../types/stories";
import type { StoryWordUsage } from "../types/stories";

export function generateStory(data: GenerateStoryRequest) {
  return apiFetch<GenerateStoryResponse>("/stories/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export function listStories(params?: {
  language?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams(params as any).toString();
  return apiFetch<StoryListResponse>(`/stories?${query}`);
}

// 获取单个故事详情
export function getStory(storyId: string) {
  return apiFetch<GenerateStoryResponse>(`/stories/${storyId}`);
}

// 获取故事里使用的单词
export function getStoryWords(storyId: string) {
  return apiFetch<StoryWordUsage[]>(`/stories/${storyId}/words`);
}