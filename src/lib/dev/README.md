# Development Toggles

SPRINT-07 adds a separate `Simulate New Alert` dev toggle for Monitoring & Governance.

- The toggle is gated by `process.env.NODE_ENV !== "production"`.
- It publishes events through `src/lib/realtime/` rather than mutating UI state directly.
- The global toast subscriber owns user-facing toasts.
- The `/monitoring` page subscriber owns alert-store mutation.
- SPRINT-06's shortlist delta toggle remains separate under the decision feature; the two toggles do not share state.

Scenarios:

1. Berastagi `konversi_lahan_ilegal` alert. The toggle switches the active profile to Berastagi first so the active-channel subscriber receives the event.
2. Ciwidey `potensi_banjir` alert. Ciwidey is used instead of Magelang because Magelang is not present in the current PoC active-profile fixture.
3. Berastagi shortlist threshold breach (`Location Score +12`).
4. Reset simulated alerts by clearing the in-memory alert store.
