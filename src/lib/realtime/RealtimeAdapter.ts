// SPRINT-07 TASK-002 — In-process EventEmitter-backed RealtimeAdapter
// Browser-safe Map<channel, Set<handler>> implementation.
// publish() is gated to development — subscribe/unsubscribe work in production
// so that a real socket.io-client swap requires only this file.

import type { RealtimeEvent } from "./types";

export type RealtimeHandler = (event: RealtimeEvent) => void;

export interface RealtimeAdapter {
  subscribe(channel: string, handler: RealtimeHandler): () => void;
  unsubscribe(channel: string, handler: RealtimeHandler): void;
  publish(channel: string, event: RealtimeEvent): void;
}

// ─── Implementation ────────────────────────────────────────────────────────────

export class InProcessRealtimeAdapter implements RealtimeAdapter {
  private readonly channels = new Map<string, Set<RealtimeHandler>>();
  private readonly isDev: boolean;

  constructor(isDev = process.env.NODE_ENV !== "production") {
    this.isDev = isDev;
    if (!isDev) {
      console.info(
        "[talis.realtime] publish() is disabled in production. Subscribe/unsubscribe remain active for SocketIO swap.",
      );
    }
  }

  subscribe(channel: string, handler: RealtimeHandler): () => void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(handler);
    return () => this.unsubscribe(channel, handler);
  }

  unsubscribe(channel: string, handler: RealtimeHandler): void {
    this.channels.get(channel)?.delete(handler);
  }

  publish(channel: string, event: RealtimeEvent): void {
    if (!this.isDev) return;
    const handlers = this.channels.get(channel);
    if (!handlers) return;
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error("[talis.realtime] handler error on channel", channel, err);
      }
    });
  }
}

/** Factory for tests — creates an isolated instance with no shared state. */
export function createRealtime(isDev?: boolean): RealtimeAdapter {
  return new InProcessRealtimeAdapter(isDev);
}
