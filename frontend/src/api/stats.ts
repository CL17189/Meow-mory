import { apiFetch } from "./client";

export type StreakSummary = {
  current_streak: number;
  longest_streak: number;
  goal_days: number;
  goal_progress: number;
  goal_reached: boolean;
  today_completed: boolean;
  active_dates: string[];
  last_activity_date: string | null;
};

export const STREAK_UPDATED_EVENT = "meowmory:streak-updated";

export function getStreak() {
  return apiFetch<StreakSummary>("/stats/streak");
}

export function notifyStreakUpdated() {
  window.dispatchEvent(new Event(STREAK_UPDATED_EVENT));
}
