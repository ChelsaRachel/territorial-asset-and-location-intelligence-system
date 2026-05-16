// SPRINT-07 TASK-002 — Realtime adapter singleton + public exports
// HMR note: Hot reload may clear subscriber registrations since the module re-executes.
// Subscribers should re-register in useEffect with a cleanup return.

import { InProcessRealtimeAdapter } from "./RealtimeAdapter";

// Singleton — use globalThis guard to survive HMR re-execution in dev.
const GLOBAL_KEY = "__talis_realtime__";

declare global {
  // eslint-disable-next-line no-var
  var __talis_realtime__: InProcessRealtimeAdapter | undefined;
}

function getSingleton(): InProcessRealtimeAdapter {
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = new InProcessRealtimeAdapter();
  }
  return globalThis[GLOBAL_KEY]!;
}

export const realtime = getSingleton();

export { createRealtime } from "./RealtimeAdapter";
export type { RealtimeAdapter, RealtimeHandler } from "./RealtimeAdapter";
export type {
  RealtimeEvent,
  AlertCreatedEvent,
  AlertStatusChangedEvent,
  ShortlistThresholdBreachEvent,
} from "./types";
export { CHANNELS, POC_USER_ID } from "./types";
