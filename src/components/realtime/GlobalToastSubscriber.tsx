"use client";

import { useEffect } from "react";
import { AlertTriangle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { CHANNELS, POC_USER_ID, realtime, type RealtimeEvent } from "@/lib/realtime";
import { useActiveProfile } from "@/lib/store/useActiveProfile";

function ToastLink({
  children,
  href,
  onClick,
  tone,
  ariaLabel,
}: {
  children: React.ReactNode;
  href: string;
  onClick(event: React.MouseEvent<HTMLAnchorElement>): void;
  tone: "alert" | "shortlist";
  ariaLabel: string;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded p-1 text-left ${
        tone === "alert" ? "text-talis-red-700" : "text-blue-700"
      }`}
    >
      {tone === "alert" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0" />}
      <span className="font-sans text-sm text-talis-stone-900">{children}</span>
    </a>
  );
}

export function GlobalToastSubscriber() {
  const activeProfile = useActiveProfile();

  useEffect(() => {
    if (!activeProfile) return;
    const channel = CHANNELS.wilayahAlerts(activeProfile.wilayah_id);
    const handleEvent = (event: RealtimeEvent) => {
      if (event.type !== "alert.created") return;
      const payload = event.payload;
      const href = `/monitoring#alert-${payload.alert_id}`;
      const id = toast.custom((toastId) => (
        <ToastLink
          href={href}
          tone="alert"
          ariaLabel="Buka peringatan baru di Monitoring"
          onClick={(event) => {
            event.preventDefault();
            toast.dismiss(toastId);
            window.location.assign(href);
          }}
        >
          Peringatan baru: {payload.tipe.replace(/_/g, " ")} di {payload.lokasi ?? payload.alert?.lokasi.deskripsi ?? "wilayah aktif"}
        </ToastLink>
      ));
      window.setTimeout(() => toast.dismiss(id), 8000);
    };
    return realtime.subscribe(channel, handleEvent);
  }, [activeProfile]);

  useEffect(() => {
    const channel = CHANNELS.userShortlistAlerts(POC_USER_ID);
    const handleEvent = (event: RealtimeEvent) => {
      if (event.type !== "shortlist.threshold_breach") return;
      const payload = event.payload;
      const href = "/decision";
      const id = toast.custom((toastId) => (
        <ToastLink
          href={href}
          tone="shortlist"
          ariaLabel="Buka perubahan shortlist di Investment Decision"
          onClick={(event) => {
            event.preventDefault();
            toast.dismiss(toastId);
            window.location.assign(href);
          }}
        >
          Perubahan pada wilayah shortlist: {payload.wilayah_nama} — {payload.indicator_label ?? payload.indicator} {payload.direction}
        </ToastLink>
      ));
      window.setTimeout(() => toast.dismiss(id), 8000);
    };
    return realtime.subscribe(channel, handleEvent);
  }, []);

  return null;
}
