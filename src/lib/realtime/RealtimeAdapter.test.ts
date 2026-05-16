import { describe, expect, it, vi } from "vitest";
import { createRealtime } from "./RealtimeAdapter";
import { CHANNELS, type RealtimeEvent } from "./types";

const event: RealtimeEvent = {
  type: "shortlist.threshold_breach",
  payload: {
    wilayah_id: 1206090,
    wilayah_nama: "Kec. Berastagi",
    indicator: "location_score",
    delta_pct: 12,
    direction: "naik",
    breached_at: "2026-05-10T00:00:00Z",
  },
};

describe("RealtimeAdapter", () => {
  it("invokes subscribed handlers and isolates channels", () => {
    const realtime = createRealtime(true);
    const hit = vi.fn();
    const miss = vi.fn();
    realtime.subscribe(CHANNELS.userShortlistAlerts("poc-user"), hit);
    realtime.subscribe(CHANNELS.wilayahAlerts(3204170), miss);

    realtime.publish(CHANNELS.userShortlistAlerts("poc-user"), event);

    expect(hit).toHaveBeenCalledWith(event);
    expect(miss).not.toHaveBeenCalled();
  });

  it("unsubscribe stops handler invocation and production publish is gated", () => {
    const devRealtime = createRealtime(true);
    const handler = vi.fn();
    const unsubscribe = devRealtime.subscribe("wilayah:1206090:alerts", handler);
    unsubscribe();
    devRealtime.publish("wilayah:1206090:alerts", event);
    expect(handler).not.toHaveBeenCalled();

    const productionRealtime = createRealtime(false);
    const productionHandler = vi.fn();
    productionRealtime.subscribe("wilayah:1206090:alerts", productionHandler);
    productionRealtime.publish("wilayah:1206090:alerts", event);
    expect(productionHandler).not.toHaveBeenCalled();
  });
});
