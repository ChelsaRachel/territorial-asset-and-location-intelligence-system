/** Artificial latency helper — no-op in test mode so Vitest doesn't wait */
export function delay(ms: number): Promise<void> {
  if (process.env.NODE_ENV === "test") return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
