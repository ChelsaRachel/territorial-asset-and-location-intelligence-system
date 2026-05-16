// GET /decision/shortlist — docs/05_INVESTMENT_DECISION.md §5.1
// PoC: reads from sessionStorage mirror (populated by saveShortlist/removeShortlist).
// Falls back to seed data from shortlist.json on first load if sessionStorage is empty.
import { loadFixture } from "@/lib/schema/loader";
import { ShortlistFixtureArraySchema } from "@/lib/schema/decision";
import rawFixture from "@/mocks/decision/shortlist.json";

export interface ShortlistItem {
  id: string;
  user_id: string;
  wilayah_id: number;
  catatan?: string;
  saved_at: string;
}

const STORAGE_KEY = "talis.shortlist.v1";

function readFromStorage(): ShortlistItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShortlistItem[];
  } catch {
    return null;
  }
}

export function writeToStorage(items: ShortlistItem[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function readStorageOrSeed(): ShortlistItem[] {
  const fromStorage = readFromStorage();
  if (fromStorage !== null) return fromStorage;
  // Seed from fixture on first load
  const validated = loadFixture(rawFixture, ShortlistFixtureArraySchema);
  const items: ShortlistItem[] = validated.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    wilayah_id: r.wilayah_id,
    catatan: r.catatan,
    saved_at: r.saved_at,
  }));
  writeToStorage(items);
  return items;
}

export async function getShortlist(): Promise<ShortlistItem[]> {
  return readStorageOrSeed();
}
