import type { LocationScoreFixture } from "@/lib/api/assessment/assessmentFixtures";
import type { InvestmentReadinessKlasifikasi, ProfilKode, Sektor, VerdictStatus } from "@/lib/types/common";
import type { TimelineKritisItem } from "@/lib/types/intelligence";
import { DIMENSION_LABELS } from "@/lib/scoring/weights";

export function dominantSektor(profilKode?: ProfilKode | null): Sektor {
  if (profilKode === "HOSPITALITY_DOMINANT") return "hospitality";
  return "agribisnis";
}

export function verdictFromKlasifikasi(klasifikasi: InvestmentReadinessKlasifikasi): VerdictStatus {
  if (klasifikasi === "Siap_Investasi") return "LAYAK";
  if (klasifikasi === "Siap_Dengan_Catatan") return "LAYAK_BERSYARAT";
  return "TIDAK_LAYAK";
}

export function verdictReason(locationScore: LocationScoreFixture): string {
  if (locationScore.cap_reason) return locationScore.cap_reason;

  const [topKey] = Object.entries(locationScore.score_breakdown).sort(
    (a, b) => b[1].contribution - a[1].contribution,
  )[0] ?? ["A1", { raw_score: locationScore.location_score, contribution: locationScore.location_score }];

  const label = DIMENSION_LABELS[topKey as keyof typeof DIMENSION_LABELS] ?? topKey;
  return `${label} menjadi pendorong utama skor ${locationScore.location_score.toFixed(1)} untuk sektor aktif.`;
}

function quarterToDate(quarter: string): Date | null {
  const match = /^(\d{4})-Q([1-4])$/.exec(quarter);
  if (!match) return null;
  const year = Number(match[1]);
  const q = Number(match[2]);
  return new Date(Date.UTC(year, (q - 1) * 3, 1));
}

export function monthsUntilNextMilestone(
  timeline: TimelineKritisItem[],
  now = new Date(),
): number {
  const nowMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const nextMonth = timeline
    .map((item) => quarterToDate(item.quarter))
    .filter((date): date is Date => date !== null)
    .map((date) => date.getUTCFullYear() * 12 + date.getUTCMonth())
    .filter((month) => month >= nowMonth)
    .sort((a, b) => a - b)[0];

  if (nextMonth === undefined) return 0;
  return Math.max(0, nextMonth - nowMonth);
}
