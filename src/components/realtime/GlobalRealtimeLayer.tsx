"use client";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";
import { GlobalToastSubscriber } from "./GlobalToastSubscriber";

const DevSimulateNewAlertToggle =
  process.env.NODE_ENV !== "production"
    ? dynamic(
        () =>
          import("@/features/monitoring/components/SimulateNewAlertToggle").then(
            (mod) => mod.SimulateNewAlertToggle,
          ),
        { ssr: false },
      )
    : null;

export function GlobalRealtimeLayer() {
  return (
    <>
      <Toaster
        richColors
        closeButton
        position="bottom-center"
        offset={{ bottom: "1rem" }}
        style={{ zIndex: 80 }}
        toastOptions={{
          style: {
            background: "#ffffff",
            border: "1px solid #E7E5E4",
            boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
          },
        }}
      />
      <GlobalToastSubscriber />
      {DevSimulateNewAlertToggle ? <DevSimulateNewAlertToggle /> : null}
    </>
  );
}
