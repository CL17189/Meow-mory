import { apiFetch } from "./client";
import type { GenerateStoryRequest, GenerateStoryResponse } from "../types/stories";

export type StoryJob = { task_id: string; status: string; result_url: string };
export type StoryJobStatus = { task_id: string; status: string; result?: GenerateStoryResponse; error?: string };

export function generateStoryAsync(data: GenerateStoryRequest) {
  return apiFetch<StoryJob>("/stories/generate/async", { method: "POST", body: JSON.stringify(data) });
}

export function getStoryJob(taskId: string) {
  return apiFetch<StoryJobStatus>(`/stories/jobs/${encodeURIComponent(taskId)}`);
}
