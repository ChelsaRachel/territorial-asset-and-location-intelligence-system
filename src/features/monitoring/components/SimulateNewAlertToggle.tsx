"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { useActiveProfileActions, useHydrationStatus } from "@/lib/store/useActiveProfile";
import { publishSimulatedAlertScenario, SIMULATED_ALERT_SCENARIOS } from "@/lib/dev/simulateAlerts";

const SCENARIO_TARGET_PROFILE: Record<number, string> = {
  0: "berastagi",
  1: "ciwidey",
};

export function SimulateNewAlertToggle() {
  const [index, setIndex] = useState(0);
  const { setActiveProfile } = useActiveProfileActions();
  const hydrationStatus = useHydrationStatus();

  if (process.env.NODE_ENV === "production" || hydrationStatus !== "ready") return null;

  const scenarioIndex = index % SIMULATED_ALERT_SCENARIOS.length;

  function runScenario() {
    const targetProfile = SCENARIO_TARGET_PROFILE[scenarioIndex];
    if (targetProfile) {
      setActiveProfile(targetProfile);
      window.setTimeout(() => publishSimulatedAlertScenario(scenarioIndex), 120);
    } else {
      publishSimulatedAlertScenario(scenarioIndex);
    }

    if (scenarioIndex === 3) {
      toast.info("Simulasi alert direset.", {
        description: "Monitoring akan kembali memakai fixture awal pada refresh berikutnya.",
      });
    }

    setIndex((current) => (current + 1) % SIMULATED_ALERT_SCENARIOS.length);
  }

  return (
    <div
      className="flex flex-col items-start gap-2"
      style={{
        position: "fixed",
        left: "calc(var(--talis-sidebar-width) + 1rem)",
        bottom: "1rem",
        zIndex: 45,
      }}
    >
      <button
        type="button"
        aria-label="Simulate New Alert"
        onClick={runScenario}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-semibold text-white transition-colors"
        style={{
          backgroundColor: "#B42318",
          border: "1px solid rgba(255,255,255,0.72)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = "#8f1c14";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = "#B42318";
        }}
      >
        <BellRing className="h-4 w-4" aria-hidden="true" />
        Simulate New Alert
      </button>
    </div>
  );
}
