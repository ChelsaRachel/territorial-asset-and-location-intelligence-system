// DELETE /decision/shortlist/{id} — docs/05_INVESTMENT_DECISION.md §5.1
// PoC: removes from sessionStorage mirror.
import { ApiError } from "../common/ApiError";
import { readStorageOrSeed, writeToStorage } from "./getShortlist";

export async function removeShortlist(shortlistId: string): Promise<void> {
  const items = readStorageOrSeed();
  const next = items.filter((i) => i.id !== shortlistId);
  if (next.length === items.length) {
    throw new ApiError(
      "NOT_FOUND",
      `DELETE /decision/shortlist/${shortlistId}`,
      `Shortlist item ${shortlistId} not found`
    );
  }
  writeToStorage(next);
}
