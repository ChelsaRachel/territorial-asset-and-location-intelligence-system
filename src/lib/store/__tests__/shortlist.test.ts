// SPRINT-06 TASK-012 — Tests for useShortlistStore
import { describe, it, expect, beforeEach } from "vitest";
import { useShortlistStore } from "@/lib/store/shortlist";
import type { ShortlistItem } from "@/lib/api/decision/getShortlist";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ITEM_BERASTAGI: ShortlistItem = {
  id: "sl_test_001",
  user_id: "user_test",
  wilayah_id: 1206090,
  catatan: undefined,
  saved_at: "2026-01-15T08:00:00.000Z",
};

const ITEM_CIWIDEY: ShortlistItem = {
  id: "sl_test_002",
  user_id: "user_test",
  wilayah_id: 3204170,
  catatan: "Harga kompetitif, cocok untuk entry 2026.",
  saved_at: "2026-02-10T09:30:00.000Z",
};

const SEED_ITEMS = [ITEM_BERASTAGI, ITEM_CIWIDEY];

// ─── Reset store between tests ─────────────────────────────────────────────────

beforeEach(() => {
  useShortlistStore.setState({
    items: [...SEED_ITEMS],
    snapshot: [...SEED_ITEMS],
    pendingIds: [],
    saveAllStatus: "idle",
  });
});

// ─── computeDelta ─────────────────────────────────────────────────────────────

describe("computeDelta", () => {
  it("returns empty array when no changes from snapshot", () => {
    const delta = useShortlistStore.getState().computeDelta();
    expect(delta).toHaveLength(0);
  });

  it("returns delta rows when catatan is changed", () => {
    useShortlistStore.getState().addNote(ITEM_BERASTAGI.id, "Catatan baru!");
    const delta = useShortlistStore.getState().computeDelta();
    expect(delta.length).toBeGreaterThan(0);
    const catatanDelta = delta.find(
      (d) => d.itemId === ITEM_BERASTAGI.id && d.field === "catatan"
    );
    expect(catatanDelta).toBeDefined();
    expect(catatanDelta?.hasChanged).toBe(true);
    expect(catatanDelta?.newValue).toBe("Catatan baru!");
    expect(catatanDelta?.oldValue).toBeUndefined();
  });

  it("returns empty delta after captureSnapshot syncs with current items", () => {
    useShortlistStore.getState().addNote(ITEM_BERASTAGI.id, "Catatan sementara");
    // Now capture snapshot with current items
    const { items } = useShortlistStore.getState();
    useShortlistStore.getState().captureSnapshot(items);
    const delta = useShortlistStore.getState().computeDelta();
    expect(delta).toHaveLength(0);
  });

  it("correctly records old and new values in delta", () => {
    // Ciwidey already has a catatan in the snapshot
    const oldNote = ITEM_CIWIDEY.catatan;
    const newNote = "Apresiasi YoY tinggi — entry sebelum Q4 2026";
    useShortlistStore.getState().addNote(ITEM_CIWIDEY.id, newNote);
    const delta = useShortlistStore.getState().computeDelta();
    const catatanDelta = delta.find(
      (d) => d.itemId === ITEM_CIWIDEY.id && d.field === "catatan"
    );
    expect(catatanDelta?.oldValue).toBe(oldNote);
    expect(catatanDelta?.newValue).toBe(newNote);
  });
});

// ─── addNote ──────────────────────────────────────────────────────────────────

describe("addNote", () => {
  it("marks item as pending after note is added", () => {
    const { addNote, pendingIds } = useShortlistStore.getState();
    expect(pendingIds).toHaveLength(0);
    addNote(ITEM_BERASTAGI.id, "Catatan lapangan Q2 2026");
    const { pendingIds: updated } = useShortlistStore.getState();
    expect(updated).toContain(ITEM_BERASTAGI.id);
  });

  it("updates catatan on the correct item", () => {
    useShortlistStore.getState().addNote(ITEM_BERASTAGI.id, "Pipeline tol aktif Q3 2026");
    const { items } = useShortlistStore.getState();
    const berastagi = items.find((i) => i.id === ITEM_BERASTAGI.id);
    expect(berastagi?.catatan).toBe("Pipeline tol aktif Q3 2026");
  });

  it("does not mark as pending if note is unchanged from snapshot", () => {
    // Ciwidey has catatan in snapshot — update with exact same value
    const sameCatatan = ITEM_CIWIDEY.catatan!;
    useShortlistStore.getState().addNote(ITEM_CIWIDEY.id, sameCatatan);
    const { pendingIds } = useShortlistStore.getState();
    expect(pendingIds).not.toContain(ITEM_CIWIDEY.id);
  });

  it("adding note to multiple items marks all as pending", () => {
    useShortlistStore.getState().addNote(ITEM_BERASTAGI.id, "Catatan A");
    useShortlistStore.getState().addNote(ITEM_CIWIDEY.id, "Catatan B yang baru");
    const { pendingIds } = useShortlistStore.getState();
    expect(pendingIds).toContain(ITEM_BERASTAGI.id);
    expect(pendingIds).toContain(ITEM_CIWIDEY.id);
  });
});

// ─── removeItem ───────────────────────────────────────────────────────────────

describe("removeItem", () => {
  it("removes item from items list", () => {
    useShortlistStore.getState().removeItem(ITEM_BERASTAGI.id);
    const { items } = useShortlistStore.getState();
    expect(items.find((i) => i.id === ITEM_BERASTAGI.id)).toBeUndefined();
  });

  it("also removes from pendingIds if present", () => {
    useShortlistStore.getState().addNote(ITEM_BERASTAGI.id, "Catatan sementara");
    useShortlistStore.getState().removeItem(ITEM_BERASTAGI.id);
    const { pendingIds } = useShortlistStore.getState();
    expect(pendingIds).not.toContain(ITEM_BERASTAGI.id);
  });
});

// ─── addItem ──────────────────────────────────────────────────────────────────

describe("addItem", () => {
  it("adds a new wilayah to the shortlist", () => {
    useShortlistStore.getState().addItem(3308020); // Borobudur
    const { items } = useShortlistStore.getState();
    const added = items.find((i) => i.wilayah_id === 3308020);
    expect(added).toBeDefined();
    expect(added?.user_id).toBe("local");
  });

  it("marks new item as pending", () => {
    useShortlistStore.getState().addItem(3308020);
    const { items, pendingIds } = useShortlistStore.getState();
    const added = items.find((i) => i.wilayah_id === 3308020);
    expect(pendingIds).toContain(added?.id);
  });

  it("does not add duplicate wilayah", () => {
    useShortlistStore.getState().addItem(1206090); // Berastagi already exists
    const { items } = useShortlistStore.getState();
    const berastagiItems = items.filter((i) => i.wilayah_id === 1206090);
    expect(berastagiItems).toHaveLength(1);
  });

  it("stores catatan when provided", () => {
    useShortlistStore.getState().addItem(1212140, "Danau Toba — potensi wisata tinggi");
    const { items } = useShortlistStore.getState();
    const added = items.find((i) => i.wilayah_id === 1212140);
    expect(added?.catatan).toBe("Danau Toba — potensi wisata tinggi");
  });
});

// ─── captureSnapshot ──────────────────────────────────────────────────────────

describe("captureSnapshot", () => {
  it("clears pendingIds after capturing snapshot", () => {
    useShortlistStore.getState().addNote(ITEM_BERASTAGI.id, "Catatan baru");
    expect(useShortlistStore.getState().pendingIds).toHaveLength(1);
    useShortlistStore.getState().captureSnapshot(useShortlistStore.getState().items);
    expect(useShortlistStore.getState().pendingIds).toHaveLength(0);
  });

  it("snapshot matches provided items after capture", () => {
    const customItems = [{ ...ITEM_BERASTAGI, catatan: "Updated" }];
    useShortlistStore.getState().captureSnapshot(customItems);
    const { snapshot } = useShortlistStore.getState();
    expect(snapshot[0]?.catatan).toBe("Updated");
  });
});
