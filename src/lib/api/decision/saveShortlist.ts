// POST /decision/shortlist — docs/05_INVESTMENT_DECISION.md §5.1
// PoC: persists to sessionStorage (no real backend in SPRINT-06).
import { readStorageOrSeed, writeToStorage } from "./getShortlist";
import type { ShortlistItem } from "./getShortlist";

function generateId(): string {
  return `sl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function saveShortlist(
  wilayahId: number,
  catatan?: string
): Promise<ShortlistItem> {
  const items = readStorageOrSeed();
  // Idempotent: if already saved, update catatan and return existing
  const existing = items.find((i) => i.wilayah_id === wilayahId);
  if (existing) {
    if (catatan !== undefined) {
      existing.catatan = catatan;
    }
    writeToStorage(items);
    return existing;
  }

  const newItem: ShortlistItem = {
    id: generateId(),
    user_id: "demo-user",
    wilayah_id: wilayahId,
    catatan,
    saved_at: new Date().toISOString(),
  };
  writeToStorage([...items, newItem]);
  return newItem;
}
