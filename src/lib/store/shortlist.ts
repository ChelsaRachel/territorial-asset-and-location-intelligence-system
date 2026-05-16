"use client";
// SPRINT-06 TASK-009 — localStorage-persisted shortlist store
// Schema key: "talis.shortlist.v1"
// Separate from comparison store (which uses sessionStorage).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShortlistItem } from "@/lib/api/decision/getShortlist";
import { readStorageOrSeed, writeToStorage } from "@/lib/api/decision/getShortlist";

// ─── Delta ─────────────────────────────────────────────────────────────────────

export interface ShortlistDeltaRow {
  itemId: string;
  field: keyof ShortlistItem;
  oldValue: string | number | undefined;
  newValue: string | number | undefined;
  hasChanged: boolean;
}

// ─── State ─────────────────────────────────────────────────────────────────────

export type SaveAllStatus = "idle" | "saving" | "done" | "error";

export interface ShortlistState {
  items: ShortlistItem[];
  snapshot: ShortlistItem[];
  /** Set of item IDs that have unsaved changes since snapshot */
  pendingIds: string[];
  saveAllStatus: SaveAllStatus;
}

// ─── Actions ───────────────────────────────────────────────────────────────────

export interface ShortlistActions {
  /** Load items from storage (or seed) and capture snapshot */
  hydrate(): void;
  /** Save current items as the baseline snapshot */
  captureSnapshot(items: ShortlistItem[]): void;
  /** Compare current items to snapshot, return delta rows */
  computeDelta(): ShortlistDeltaRow[];
  /** Persist all pending changes (mock: no real API) and update snapshot */
  saveAll(): Promise<void>;
  /** Add or update catatan on an item */
  addNote(id: string, note: string): void;
  /** Remove an item from shortlist */
  removeItem(id: string): void;
  /** Add a wilayah to shortlist */
  addItem(wilayahId: number, catatan?: string): void;
}

export type ShortlistStore = ShortlistState & ShortlistActions;

// ─── Store ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "talis.shortlist.v1";
const LEGACY_KEY = "talis.shortlist.v0";

/**
 * Migrate legacy v0 schema if present.
 * v0 has no snapshot/pendingIds — just an array of ShortlistItem.
 */
function migrateLegacy(): ShortlistItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ShortlistItem[];
    localStorage.removeItem(LEGACY_KEY);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function generateId(): string {
  return `sl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useShortlistStore = create<ShortlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      snapshot: [],
      pendingIds: [],
      saveAllStatus: "idle" as SaveAllStatus,

      hydrate: () => {
        // Check for legacy migration first
        const legacyItems = migrateLegacy();
        if (legacyItems) {
          set({ items: legacyItems, snapshot: legacyItems, pendingIds: [] });
          writeToStorage(legacyItems);
          return;
        }
        // Load from sessionStorage (getShortlist API) or seed
        const loaded = readStorageOrSeed();
        set({ items: loaded, snapshot: loaded, pendingIds: [] });
      },

      captureSnapshot: (items) => {
        set({ snapshot: items, pendingIds: [] });
      },

      computeDelta: () => {
        const { items, snapshot } = get();
        const deltaRows: ShortlistDeltaRow[] = [];

        for (const item of items) {
          const original = snapshot.find((s) => s.id === item.id);
          if (!original) {
            // New item — no delta row (it's an add, not a change)
            continue;
          }
          const fields: Array<keyof ShortlistItem> = ["catatan", "wilayah_id", "saved_at"];
          for (const field of fields) {
            const oldValue = original[field] as string | number | undefined;
            const newValue = item[field] as string | number | undefined;
            if (oldValue !== newValue) {
              deltaRows.push({
                itemId: item.id,
                field,
                oldValue,
                newValue,
                hasChanged: true,
              });
            }
          }
        }

        return deltaRows;
      },

      saveAll: async () => {
        const { items } = get();
        set({ saveAllStatus: "saving" });
        try {
          // PoC: write to sessionStorage (mirrors getShortlist storage)
          writeToStorage(items);
          // Simulate async save delay
          await new Promise((resolve) => setTimeout(resolve, 200));
          set({ snapshot: items, pendingIds: [], saveAllStatus: "done" });
          // Reset to idle after 2s so UI can reflect success briefly
          setTimeout(() => {
            set((s) => (s.saveAllStatus === "done" ? { saveAllStatus: "idle" } : {}));
          }, 2000);
        } catch {
          set({ saveAllStatus: "error" });
        }
      },

      addNote: (id, note) => {
        set((s) => {
          const items = s.items.map((item) =>
            item.id === id ? { ...item, catatan: note } : item
          );
          // Check if changed from snapshot
          const original = s.snapshot.find((si) => si.id === id);
          const changed = original?.catatan !== note;
          const pendingIds = changed
            ? Array.from(new Set([...s.pendingIds, id]))
            : s.pendingIds.filter((pid) => pid !== id);
          return { items, pendingIds };
        });
        writeToStorage(get().items);
      },

      removeItem: (id) => {
        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
          pendingIds: s.pendingIds.filter((pid) => pid !== id),
        }));
        writeToStorage(get().items);
      },

      addItem: (wilayahId, catatan) => {
        const { items } = get();
        if (items.some((i) => i.wilayah_id === wilayahId)) return;
        const newItem: ShortlistItem = {
          id: generateId(),
          user_id: "local",
          wilayah_id: wilayahId,
          catatan,
          saved_at: new Date().toISOString(),
        };
        const updated = [...items, newItem];
        set((s) => ({
          items: updated,
          pendingIds: Array.from(new Set([...s.pendingIds, newItem.id])),
        }));
        writeToStorage(updated);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage
      ),
      // Persist items + snapshot + pendingIds; saveAllStatus is transient
      partialize: (s) => ({
        items: s.items,
        snapshot: s.snapshot,
        pendingIds: s.pendingIds,
      }),
    }
  )
);
