// PATCH /decision/shortlist/{id}/note — docs/05_INVESTMENT_DECISION.md §5.1
// PoC: updates catatan in sessionStorage mirror.
import { ApiError } from "../common/ApiError";
import { readStorageOrSeed, writeToStorage } from "./getShortlist";
import type { ShortlistItem } from "./getShortlist";

export async function updateShortlistNote(
  shortlistId: string,
  catatan: string
): Promise<ShortlistItem> {
  const items = readStorageOrSeed();
  const item = items.find((i) => i.id === shortlistId);
  if (!item) {
    throw new ApiError(
      "NOT_FOUND",
      `PATCH /decision/shortlist/${shortlistId}/note`,
      `Shortlist item ${shortlistId} not found`
    );
  }
  item.catatan = catatan;
  writeToStorage(items);
  return item;
}
