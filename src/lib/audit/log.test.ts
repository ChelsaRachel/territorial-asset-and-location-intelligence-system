import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuditLog, getAuditLog, log } from "./log";

beforeEach(() => {
  clearAuditLog();
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

describe("audit log helper", () => {
  it("writes and reads audit entries from localStorage", () => {
    log("export.pdf.comparison", { wilayah_ids: [1206090, 3204170] });

    const entries = getAuditLog();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      user_id: "poc-user",
      action: "export.pdf.comparison",
      payload: { wilayah_ids: [1206090, 3204170] },
    });
    expect(console.log).toHaveBeenCalledWith("[talis.audit]", expect.objectContaining({ action: "export.pdf.comparison" }));
  });

  it("evicts oldest entries after the 100-entry ring buffer cap", () => {
    for (let i = 0; i < 105; i += 1) {
      log(`action-${i}`, { index: i });
    }

    const entries = getAuditLog();
    expect(entries).toHaveLength(100);
    expect(entries[0]?.action).toBe("action-5");
    expect(entries[99]?.action).toBe("action-104");
  });

  it("does not throw when localStorage write fails", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    expect(() => log("export.pdf.shortlist", { shortlist_ids: ["sl-001"] })).not.toThrow();
    expect(console.warn).toHaveBeenCalled();
    spy.mockRestore();
  });
});
