import { CHANNELS, POC_USER_ID, realtime } from "@/lib/realtime";
import { resetAlertStore } from "@/lib/api/monitoring/getAlerts";
import type { Alert } from "@/lib/types/monitoring";

const SIMULATED_STORAGE_KEY = "talis.simulated_alerts.v1";

function stageAlertForNavigation(alert: Alert): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(SIMULATED_STORAGE_KEY);
    const items = raw ? (JSON.parse(raw) as Alert[]) : [];
    const next = Array.isArray(items) ? items.filter((item) => item.id !== alert.id) : [];
    next.unshift(alert);
    sessionStorage.setItem(SIMULATED_STORAGE_KEY, JSON.stringify(next.slice(0, 5)));
  } catch {
    // Dev-only helper: publish still works even if storage is blocked.
  }
}

function buildBerastagiAlert(): Alert {
  const at = new Date().toISOString();
  return {
    id: `alert-sim-berastagi-${Date.now()}`,
    wilayah_id: 1206090,
    tipe: "konversi_lahan_ilegal",
    severity: "KRITIS",
    status: "OPEN",
    lokasi: {
      deskripsi: "Desa Dokan, Kec. Berastagi — 12,5 ha",
      ha: 12.5,
      lat: 3.172,
      lng: 98.5012,
    },
    terdeteksi_at: at,
    detail: "Konversi lahan ilegal terdeteksi ulang di blok pertanian Desa Dokan; perlu verifikasi lapangan dan cross-check OSS.",
    estimasi_dampak: {
      pdrb_pct: -1.8,
      hilang_pad_rp_per_tahun: 240000000,
      keterangan: "Simulasi dev: potensi dampak mengikuti baseline alert Berastagi.",
      dampak_lain: "Risiko sengketa hukum tinggi jika aktivitas berlanjut.",
    },
    tindak_lanjut: [
      { langkah: 1, aksi: "Verifikasi lapangan oleh Dinas PUPR Karo", deadline: "2026-05-20" },
      { langkah: 2, aksi: "Cross-check izin di sistem OSS", deadline: "2026-05-24" },
      { langkah: 3, aksi: "Surat peringatan jika confirmed melanggar", deadline: "2026-06-08" },
    ],
    assignee: null,
    tim_penanganan: null,
    last_refreshed_at: at,
  };
}

function buildCiwideyAlert(): Alert {
  const at = new Date().toISOString();
  return {
    id: `alert-sim-ciwidey-${Date.now()}`,
    wilayah_id: 3204170,
    tipe: "potensi_banjir",
    severity: "TINGGI",
    status: "OPEN",
    lokasi: {
      deskripsi: "Desa Lebakmuncang, Kec. Ciwidey — bantaran Sungai Ciwidey",
      ha: null,
      lat: -7.102,
      lng: 107.418,
    },
    terdeteksi_at: at,
    detail: "Curah hujan ekstrem 210% dari normal bulanan memicu potensi banjir pada koridor agrowisata selatan Ciwidey.",
    estimasi_dampak: {
      pdrb_pct: -0.9,
      hilang_pad_rp_per_tahun: 380000000,
      keterangan: "Simulasi dev untuk memverifikasi isolasi channel aktif wilayah.",
      dampak_lain: "Gangguan akses wisata dan distribusi stroberi premium.",
    },
    tindak_lanjut: [
      { langkah: 1, aksi: "Cek drainase dan jembatan penghubung oleh Dinas PUPR Kab. Bandung", deadline: "2026-05-18" },
      { langkah: 2, aksi: "Siapkan status siaga BPBD untuk desa bantaran sungai", deadline: "2026-05-19" },
    ],
    assignee: null,
    tim_penanganan: null,
    last_refreshed_at: at,
  };
}

export const SIMULATED_ALERT_SCENARIOS = [
  "Alert Berastagi konversi lahan ilegal",
  "Alert Ciwidey potensi banjir tinggi",
  "Shortlist breach Berastagi LS +12",
  "Reset simulasi alert",
] as const;

export function publishSimulatedAlertScenario(index: number): void {
  const scenario = index % SIMULATED_ALERT_SCENARIOS.length;
  if (scenario === 0) {
    const alert = buildBerastagiAlert();
    stageAlertForNavigation(alert);
    realtime.publish(CHANNELS.wilayahAlerts(alert.wilayah_id), {
      type: "alert.created",
      payload: {
        wilayah_id: alert.wilayah_id,
        alert_id: alert.id,
        severity: alert.severity,
        tipe: alert.tipe,
        detail: alert.detail,
        lokasi: alert.lokasi.deskripsi,
        terdeteksi_at: alert.terdeteksi_at,
        alert,
      },
    });
    return;
  }

  if (scenario === 1) {
    const alert = buildCiwideyAlert();
    stageAlertForNavigation(alert);
    realtime.publish(CHANNELS.wilayahAlerts(alert.wilayah_id), {
      type: "alert.created",
      payload: {
        wilayah_id: alert.wilayah_id,
        alert_id: alert.id,
        severity: alert.severity,
        tipe: alert.tipe,
        detail: alert.detail,
        lokasi: alert.lokasi.deskripsi,
        terdeteksi_at: alert.terdeteksi_at,
        alert,
      },
    });
    return;
  }

  if (scenario === 2) {
    realtime.publish(CHANNELS.userShortlistAlerts(POC_USER_ID), {
      type: "shortlist.threshold_breach",
      payload: {
        wilayah_id: 1206090,
        wilayah_nama: "Kec. Berastagi",
        indicator: "location_score",
        indicator_label: "Location Score",
        delta_pct: 12,
        direction: "naik",
        breached_at: new Date().toISOString(),
      },
    });
    return;
  }

  resetAlertStore();
  console.log("[talis.dev.alerts] simulated alert store reset");
}
