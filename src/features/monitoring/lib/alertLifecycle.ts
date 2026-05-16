// SPRINT-07 TASK-006 — Alert lifecycle: transition matrix + tipe_domain mapping + auto-policy-log builder
import type { AlertStatus, AlertTipe } from "@/lib/types/common";
import type { Alert, AddPolicyLogPayload } from "@/lib/types/monitoring";

// ─── Transition matrix ────────────────────────────────────────────────────────

export const ALLOWED_TRANSITIONS: Record<AlertStatus, AlertStatus[]> = {
  OPEN: ["ASSIGNED", "FALSE_POSITIVE"],
  ASSIGNED: ["INVESTIGATED", "FALSE_POSITIVE"],
  INVESTIGATED: ["RESOLVED", "FALSE_POSITIVE"],
  RESOLVED: ["INVESTIGATED"],
  FALSE_POSITIVE: [],
};

// ─── Tipe → policy domain mapping ────────────────────────────────────────────
// Documents which policy tag is auto-added when an alert is resolved.

export const TIPE_DOMAIN: Record<AlertTipe, string> = {
  konversi_lahan_ilegal: "regulasi",
  kekeringan_parah: "infrastruktur",
  waspadai_kekeringan: "infrastruktur",
  potensi_banjir: "infrastruktur",
  penurunan_produktivitas: "demand",
};

// ─── Auto-policy-log payload builder ─────────────────────────────────────────

export function buildAutoPayload(alert: Alert): AddPolicyLogPayload {
  const domain = TIPE_DOMAIN[alert.tipe] ?? "regulasi";
  return {
    policy_date: new Date().toISOString().slice(0, 10),
    title: `Resolusi Alert: ${alert.tipe}`,
    deskripsi: `Auto-generated dari penyelesaian alert ${alert.id}: ${alert.detail.slice(0, 200)}`,
    tags: ["alert_response", domain],
    created_by: "poc-user",
  };
}

// ─── Teams + assignees ────────────────────────────────────────────────────────
// Realistic Kab. Karo dinas names for Berastagi profile.

export interface TeamEntry {
  id: string;
  nama: string;
  anggota: { id: string; nama: string; jabatan: string }[];
}

export const TEAMS: TeamEntry[] = [
  {
    id: "pupr-karo",
    nama: "Dinas PUPR Kab. Karo",
    anggota: [
      { id: "pupr-1", nama: "Ir. Rudi Ginting, M.T.", jabatan: "Kepala Dinas" },
      { id: "pupr-2", nama: "Dra. Sari Sembiring", jabatan: "Kabid Penataan Ruang" },
      { id: "pupr-3", nama: "Drs. Benny Tarigan", jabatan: "Kasi Penertiban" },
    ],
  },
  {
    id: "dlh-karo",
    nama: "Dinas Lingkungan Hidup Kab. Karo",
    anggota: [
      { id: "dlh-1", nama: "Dr. Ester Singarimbun, M.Si.", jabatan: "Kepala Dinas" },
      { id: "dlh-2", nama: "Andi Bangun, S.T.", jabatan: "Kabid Pengendalian Lingkungan" },
    ],
  },
  {
    id: "bappeda-karo",
    nama: "Bappeda Kab. Karo",
    anggota: [
      { id: "bappeda-1", nama: "Drs. Jonatan Kaban, M.M.", jabatan: "Kepala Bappeda" },
      { id: "bappeda-2", nama: "Yohannes Sitepu, S.E.", jabatan: "Kasubbid Evaluasi" },
    ],
  },
  {
    id: "bpn-karo",
    nama: "BPN Kab. Karo",
    anggota: [
      { id: "bpn-1", nama: "Hotman Purba, S.H.", jabatan: "Kepala Kantor" },
      { id: "bpn-2", nama: "Delima Situmorang, S.H.", jabatan: "Kasie Sengketa" },
    ],
  },
  {
    id: "kominfo-karo",
    nama: "Dinas Kominfo Kab. Karo",
    anggota: [
      { id: "kominfo-1", nama: "Faisal Perangin-angin, S.Kom.", jabatan: "Kepala Dinas" },
      { id: "kominfo-2", nama: "Nita Ginting, M.T.", jabatan: "Kabid Infrastruktur TIK" },
    ],
  },
  {
    id: "bpbd-karo",
    nama: "BPBD Kab. Karo",
    anggota: [
      { id: "bpbd-1", nama: "Kol. (Purn.) Selamat Barus", jabatan: "Kepala BPBD" },
      { id: "bpbd-2", nama: "Mariati Tarigan, S.Sos.", jabatan: "Kabid Kedaruratan" },
    ],
  },
];
