import { ApiError } from "@/lib/api/common/ApiError";
import { apiClient } from "@/lib/api/apiClient";
import type { WilayahComparisonRow } from "@/lib/decision/compare";
import { slugify as profileSlugify } from "@/lib/store/profileSlug";
import type {
  ShortlistDeltaIndicatorRow,
  ShortlistReportData,
  ShortlistReportEntry,
  ShortlistSection,
  ShortlistSnapshotValues,
} from "../types";

const DEFAULT_SHORTLIST_SECTIONS: ShortlistSection[] = [
  "entries",
  "delta_indicators",
  "notes",
  "notifications",
  "summary",
];

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

function trendFromDelta(delta: number): "membaik" | "memburuk" | "stabil" {
  if (delta > 0) return "membaik";
  if (delta < 0) return "memburuk";
  return "stabil";
}

function buildDeltaRows(snapshot: ShortlistSnapshotValues, current: ShortlistSnapshotValues): ShortlistDeltaIndicatorRow[] {
  const locationDelta = current.location_score - snapshot.location_score;
  const priceDelta = current.harga_lahan_median - snapshot.harga_lahan_median;
  const priceDeltaPct = snapshot.harga_lahan_median === 0 ? 0 : (priceDelta / snapshot.harga_lahan_median) * 100;
  const demandDelta = current.demand_absorption_score - snapshot.demand_absorption_score;
  const flagChanged = snapshot.regulatory_flag !== current.regulatory_flag;

  return [
    {
      indicator: "location_score",
      label: "Location Score",
      snapshotValue: snapshot.location_score,
      currentValue: current.location_score,
      delta: locationDelta,
      deltaPct: null,
      trend: trendFromDelta(locationDelta),
      severity: Math.abs(locationDelta) > 10 ? "HIGH" : "NONE",
      thresholdBreached: Math.abs(locationDelta) > 10,
      message: Math.abs(locationDelta) > 10 ? "Perubahan Location Score melampaui ambang 10 poin." : "Location Score stabil sejak disimpan.",
    },
    {
      indicator: "harga_lahan_median",
      label: "Harga Lahan",
      snapshotValue: snapshot.harga_lahan_median,
      currentValue: current.harga_lahan_median,
      delta: priceDelta,
      deltaPct: priceDeltaPct,
      trend: priceDelta > 0 ? "memburuk" : priceDelta < 0 ? "membaik" : "stabil",
      severity: Math.abs(priceDeltaPct) > 20 ? "HIGH" : "NONE",
      thresholdBreached: Math.abs(priceDeltaPct) > 20,
      message: Math.abs(priceDeltaPct) > 20 ? "Perubahan harga lahan melampaui ambang 20%." : "Harga lahan belum melampaui ambang notifikasi.",
    },
    {
      indicator: "regulatory_flag",
      label: "Regulatory Flag",
      snapshotValue: snapshot.regulatory_flag,
      currentValue: current.regulatory_flag,
      delta: flagChanged ? "Berubah" : "Stabil",
      deltaPct: null,
      trend: flagChanged ? "memburuk" : "stabil",
      severity: flagChanged ? "CRITICAL" : "NONE",
      thresholdBreached: flagChanged,
      message: flagChanged ? "Status regulasi berubah dan membutuhkan verifikasi segera." : "Status regulasi tetap stabil.",
    },
    {
      indicator: "demand_absorption_score",
      label: "Demand Absorption",
      snapshotValue: snapshot.demand_absorption_score,
      currentValue: current.demand_absorption_score,
      delta: demandDelta,
      deltaPct: null,
      trend: trendFromDelta(demandDelta),
      severity: "NONE",
      thresholdBreached: false,
      message: demandDelta === 0 ? "Serapan permintaan stabil." : "Serapan permintaan berubah, pantau pada refresh berikutnya.",
    },
  ];
}

function currentValuesFrom(row: WilayahComparisonRow, regulatoryFlag: string): ShortlistSnapshotValues {
  return {
    location_score: row.C1,
    harga_lahan_median: row.harga_lahan,
    regulatory_flag: regulatoryFlag,
    demand_absorption_score: row.A6,
  };
}

export async function buildShortlistReport(
  shortlistIds: string[],
  sections: ShortlistSection[] = DEFAULT_SHORTLIST_SECTIONS,
  generatedAt = new Date().toISOString(),
): Promise<ShortlistReportData> {
  const allItems = await apiClient.decision.getShortlist();
  const selectedItems = shortlistIds.length > 0
    ? shortlistIds.map((id) => {
        const item = allItems.find((candidate) => candidate.id === id);
        if (!item) {
          throw new ApiError("NOT_FOUND", "GET /decision/shortlist", `Shortlist item ${id} not found`);
        }
        return item;
      })
    : allItems;

  const wilayahIds = selectedItems.map((item) => item.wilayah_id);
  const compare = wilayahIds.length > 0
    ? await apiClient.decision.compare(wilayahIds)
    : { kandidat: [] as WilayahComparisonRow[] };
  const profilesResponse = await apiClient.discovery.getProfiles();

  const entries: ShortlistReportEntry[] = await Promise.all(
    selectedItems.map(async (item) => {
      const row = compare.kandidat.find((candidate) => candidate.wilayah_id === item.wilayah_id);
      if (!row) {
        throw new ApiError("NOT_FOUND", "POST /decision/compare", `No comparison row for wilayah_id ${item.wilayah_id}`);
      }
      const zoning = await apiClient.territory.getZoning(item.wilayah_id);
      const profileEntry = profilesResponse.profiles.find((profile) => profile.wilayah_id === item.wilayah_id);
      const current = currentValuesFrom(row, zoning.regulatory_flag);
      const snapshot = { ...current };
      const deltaRows = buildDeltaRows(snapshot, current);
      const notifications = deltaRows
        .filter((delta) => delta.severity !== "NONE")
        .map((delta) => ({
          severity: delta.severity as "HIGH" | "CRITICAL",
          message: `${delta.label}: ${delta.message}`,
        }));

      return {
        item,
        wilayah: {
          id: item.wilayah_id,
          nama: profileEntry?.nama ?? row.nama,
          kabupaten: profileEntry?.kabupaten ?? "",
          provinsi: profileEntry?.provinsi ?? "",
          profil_kode: profileEntry?.profil_kode ?? "AGRO_DOMINANT",
          profile_slug: profileSlugify(profileEntry?.nama ?? row.nama),
        },
        savedAt: item.saved_at,
        daysSinceSaved: daysBetween(item.saved_at, generatedAt),
        snapshot,
        current,
        deltaRows,
        note: item.catatan ?? "Belum ada catatan investasi.",
        notifications,
      };
    }),
  );

  const notificationCount = entries.reduce((sum, entry) => sum + entry.notifications.length, 0);

  return {
    reportType: "shortlist",
    title: "Laporan Shortlist Investasi",
    generatedAt,
    userId: "poc-user",
    sections,
    entries,
    summary: {
      totalEntries: entries.length,
      notificationCount,
      narrative: notificationCount > 0
        ? `${notificationCount} notifikasi memerlukan tindak lanjut pada shortlist.`
        : "Tidak ada perubahan signifikan sejak baseline shortlist terakhir tersedia.",
    },
  };
}
