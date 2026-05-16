import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { useState } from "react";

// Recharts and other layout-aware libraries require ResizeObserver in jsdom
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.removeAttribute("open");
  };
}

afterEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

vi.mock("nuqs", () => ({
  useQueryState: (_key: string) => {
    const [val, setVal] = useState<string | null>(null);
    return [val, setVal];
  },
  NuqsAdapter: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("nuqs/adapters/next/app", () => ({
  NuqsAdapter: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
