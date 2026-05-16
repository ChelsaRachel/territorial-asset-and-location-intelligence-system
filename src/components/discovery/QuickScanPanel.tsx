"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDiscoveryPanel, useDiscoveryActions } from "@/lib/store/useDiscovery";
import { useCurrentSektor, useAssessmentHydrated } from "@/lib/store/useAssessment";
import { apiClient } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/common/ApiError";
import type { QuickScanSnapshot } from "@/lib/types/wilayah";
import type { ProfilKode } from "@/lib/types/common";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { QuickScanTabsProfil } from "./QuickScanTabsProfil";
import { QuickScanIdentitas } from "./QuickScanIdentitas";
import { QuickScanVerdict } from "./QuickScanVerdict";
import { QuickScanPeluang } from "./QuickScanPeluang";
import { QuickScanSinyal } from "./QuickScanSinyal";
import { QuickScanHargaWindow } from "./QuickScanHargaWindow";
import { isSampleProfile } from "./quickScanHelpers";

type FetchStatus = "idle" | "loading" | "success" | "error" | "not_found";

export function QuickScanPanel() {
  const { open, wilayahId, panelTab } = useDiscoveryPanel();
  const { closePanel } = useDiscoveryActions();
  const currentSektor = useCurrentSektor();
  const assessmentHydrated = useAssessmentHydrated();

  const [data, setData] = useState<QuickScanSnapshot | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  // Race-condition guard: only the latest fetch token's resolve updates state
  const fetchTokenRef = useRef(0);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard Escape closes the panel
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, closePanel]);

  // Focus the close button when the panel opens for keyboard accessibility
  useEffect(() => {
    if (open) {
      // Small defer to let the animation begin before focusing
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const doFetch = useCallback(
    (wId: number, pTab: string | null) => {
      const myToken = ++fetchTokenRef.current;
      setFetchStatus("loading");
      setData(null);

      apiClient.discovery
        .getQuickScan(wId, (pTab as ProfilKode | undefined) ?? undefined)
        .then((result) => {
          if (fetchTokenRef.current !== myToken) return;
          setData(result);
          setFetchStatus("success");
        })
        .catch((err) => {
          if (fetchTokenRef.current !== myToken) return;
          if (err instanceof ApiError && err.code === "NOT_FOUND") {
            setFetchStatus("not_found");
          } else {
            setFetchStatus("error");
          }
        });
    },
    []
  );

  // Fetch on (wilayahId, panelTab) change when panel is open
  useEffect(() => {
    if (!open || wilayahId === null) return;
    doFetch(wilayahId, panelTab);
  }, [open, wilayahId, panelTab, currentSektor, assessmentHydrated, doFetch]);

  const panelName = data?.nama ?? (wilayahId ? `Wilayah ${wilayahId}` : "Quick Scan");
  const showTabs = isSampleProfile(panelTab);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="quick-scan-panel"
          role="dialog"
          aria-label={`Quick Scan ${panelName}`}
          aria-live="polite"
          className="pointer-events-auto absolute inset-y-0 right-0 z-50 w-[340px] overflow-y-auto bg-talis-stone-50"
          style={{
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          }}
          initial={{ x: 340 }}
          animate={{ x: 0 }}
          exit={{ x: 340 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="relative flex flex-col gap-4 p-4 pt-12">
            {/* Close button — top-right of panel */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closePanel}
              aria-label="Tutup Quick Scan panel"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md font-sans text-lg text-talis-stone-700 transition-colors hover:bg-talis-stone-700/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-talis-green-700"
            >
              ×
            </button>

            {/* ── Loading state ── */}
            {fetchStatus === "loading" && (
              <div className="space-y-4">
                <LoadingSkeleton shape="text" count={3} />
                <LoadingSkeleton shape="card" />
                <LoadingSkeleton shape="card" />
              </div>
            )}

            {/* ── Error state ── */}
            {fetchStatus === "error" && (
              <ErrorState
                onRetry={() => {
                  if (wilayahId !== null) doFetch(wilayahId, panelTab);
                }}
              />
            )}

            {/* ── Data states (success + not_found) ── */}
            {(fetchStatus === "success" || fetchStatus === "not_found") && (
              <>
                {/* Section 1 — Tabs Profil
                    Hidden for non-sample wilayah: they have only one logical view
                    (their wilayah_score_aggregate row), so the tab strip is omitted.
                    SPRINT-02 design decision documented here for SPRINT-08 reconciliation. */}
                {showTabs && (
                  <>
                    <QuickScanTabsProfil activePanelTab={panelTab!} />
                    <hr className="border-talis-stone-700/15" />
                  </>
                )}

                {/* Section 2 — Identitas Wilayah (only when snapshot available) */}
                {data && (
                  <>
                    <QuickScanIdentitas data={data} timestamp={data.last_updated} />
                    {data.active_sektor && (
                      <div className="rounded-md border border-talis-green-700/20 bg-talis-green-700/5 px-3 py-2">
                        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-talis-green-800">
                          Sektor aktif
                        </p>
                        <p className="mt-0.5 font-sans text-sm font-semibold capitalize text-talis-stone-900">
                          {data.active_sektor}
                        </p>
                      </div>
                    )}
                    <hr className="border-talis-stone-700/15" />
                  </>
                )}

                {/* Section 3 — Verdict
                    Passes null when NOT_FOUND to render the partial-view notice */}
                <QuickScanVerdict
                  data={fetchStatus === "not_found" ? null : data}
                  timestamp={data?.last_updated}
                />

                {/* Sections 4–6 — render only available data for partial snapshots */}
                {fetchStatus === "success" && (
                  <>
                    <hr className="border-talis-stone-700/15" />
                    <QuickScanPeluang items={data?.peluang_top3} timestamp={data?.last_updated} />
                    <hr className="border-talis-stone-700/15" />
                    <QuickScanSinyal items={data?.sinyal_kunci} timestamp={data?.last_updated} />
                    <hr className="border-talis-stone-700/15" />
                    <QuickScanHargaWindow data={data?.harga_window} timestamp={data?.last_updated} />
                    <p className="font-sans text-[11px] leading-relaxed text-talis-stone-500">
                      {data?.data_source === "snapshot_fallback"
                        ? "Data cepat ini memakai snapshot cadangan karena adapter live belum tersedia untuk wilayah aktif."
                        : "Quick Scan mengikuti sektor aktif Page 4 dan disusun dari adapter live TALIS."}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default QuickScanPanel;
