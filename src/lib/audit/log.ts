import type { AuditEntry } from "@/lib/export/types";

const STORAGE_KEY = "talis.audit_log.v1";
const MAX_ENTRIES = 100;

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emitQuotaToast(): void {
  if (typeof window === "undefined") return;
  void import("sonner")
    .then(({ toast }) => {
      toast.error("Audit log gagal disimpan — kuota localStorage habis.");
    })
    .catch(() => {
      // Toast is best-effort only; export flows must not fail because audit UI failed.
    });
}

export function getAuditLog(): AuditEntry[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is AuditEntry => {
      return Boolean(
        entry &&
          typeof entry === "object" &&
          (entry as AuditEntry).user_id === "poc-user" &&
          typeof (entry as AuditEntry).action === "string" &&
          typeof (entry as AuditEntry).timestamp === "string",
      );
    });
  } catch {
    return [];
  }
}

export function clearAuditLog(): void {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage failures in tests and browser private modes.
  }
}

export function log(action: string, payload: Record<string, unknown>): void {
  const entry: AuditEntry = {
    user_id: "poc-user",
    action,
    payload,
    timestamp: new Date().toISOString(),
  };

  console.log("[talis.audit]", entry);

  if (!canUseLocalStorage()) return;

  try {
    const next = [...getAuditLog(), entry].slice(-MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("[talis.audit] localStorage write failed", err);
    emitQuotaToast();
  }
}
