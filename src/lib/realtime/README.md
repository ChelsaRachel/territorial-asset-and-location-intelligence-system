# src/lib/realtime — WebSocket Stub Adapter

## Purpose

This module provides a `RealtimeAdapter` interface with a `subscribe/unsubscribe/publish` contract
that matches `socket.io-client` semantics. The PoC implementation uses an in-process `Map<channel, Set<handler>>`
emitter so no real WebSocket server is required.

## Channel Naming Conventions

| Channel | Purpose |
|---|---|
| `wilayah:{wilayah_id}:alerts` | Alert events (created / status changed) for a specific wilayah |
| `user:{user_id}:shortlist-alerts` | Shortlist threshold-breach events for the logged-in user |

PoC user ID is `poc-user` (see `types.ts` `POC_USER_ID`).

## `publish()` Production Gate

`publish()` is a no-op in production (`process.env.NODE_ENV === 'production'`).
The rationale: the PoC uses `publish()` only in the dev "Simulate New Alert" toggle.
In production, real events come from the Kafka → SocketIO pipeline (post-PoC).

`subscribe()` and `unsubscribe()` remain functional in production so the UI can
subscribe to a real SocketIO channel after the swap with no UI changes.

## HMR Behavior

Hot-module reload re-executes the module but the singleton is preserved via `globalThis.__talis_realtime__`.
If a subscriber was added before HMR fires, it will survive. However, if the subscriber's
component re-mounts after HMR, it will re-register — which is the correct behavior since
`useEffect` cleanup runs on re-mount.

## Swapping to real socket.io-client

1. Install `socket.io-client`.
2. Create `SocketIORealtimeAdapter.ts` implementing the `RealtimeAdapter` interface.
3. Replace the `getSingleton()` factory in `index.ts` with the SocketIO-backed instance.
4. Map SocketIO events to `RealtimeEvent` discriminated union in the subscribe wrapper.
5. No UI changes needed — all subscribers use the `RealtimeAdapter` interface.

Channel authentication is post-PoC — SocketIO `auth` option will carry the JWT.

## SPRINT-07 Channels Used

- `wilayah:1206090:alerts` (Berastagi) — Section B.3 page-level subscriber
- `wilayah:3204170:alerts` (Ciwidey) — Section B.3 on profile switch
- `wilayah:5103060:alerts` (Seminyak) — Section B.3 on profile switch
- `user:poc-user:shortlist-alerts` — Global toast subscriber (TASK-012)

## Memory Leak Prevention

`subscribe()` returns an unsubscribe function. Always call it in `useEffect` cleanup:

```ts
useEffect(() => {
  const unsub = realtime.subscribe('wilayah:1206090:alerts', handler);
  return unsub;
}, []);
```
