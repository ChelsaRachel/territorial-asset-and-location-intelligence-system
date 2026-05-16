import { SCORE_GREEN_MIN, SCORE_AMBER_MIN } from "./tokens";

/**
 * Maps a 0–100 score to its verdict Tailwind color class.
 * green ≥70, amber 40–69 (inclusive), red <40
 */
export function scoreColor(
  score: number
): "verdict-success" | "verdict-warning" | "verdict-danger" {
  if (score >= SCORE_GREEN_MIN) return "verdict-success";
  if (score >= SCORE_AMBER_MIN) return "verdict-warning";
  return "verdict-danger";
}
