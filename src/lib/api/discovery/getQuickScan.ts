// GET /api/v1/discovery/quickscan/{wilayah_id} — docs/01_COMMAND_CENTER.md §5.1
import snapshotData from "@/mocks/quick_scan_snapshot.json";
import { QuickScanSnapshotSchema } from "@/lib/schema/quick_scan_snapshot";
import { loadFixture } from "@/lib/schema/loader";
import { ApiError } from "../common/ApiError";
import { getLocationScore } from "../assessment/getLocationScore";
import { getInvestmentSummary } from "../assessment/getInvestmentSummary";
import { getBusinessRecommender } from "../decision/getBusinessRecommender";
import { getLandValue } from "../intelligence/getLandValue";
import { getGrowth } from "../intelligence/getGrowth";
import { compare } from "../decision/compare";
import { ASSESSMENT_SESSION_KEY, useAssessmentStore } from "@/lib/store/assessment";
import {
  dominantSektor,
  monthsUntilNextMilestone,
  verdictFromKlasifikasi,
  verdictReason,
} from "@/lib/discovery/quickScanDerivation";
import type { QuickScanSnapshot, ProfilKode, Sektor } from "@/lib/types";

const SEKTOR_LABELS: Record<Sektor, string> = {
  agribisnis: "Agribisnis",
  hospitality: "Hospitality",
  pariwisata: "Pariwisata",
  properti: "Properti",
};

function colorForScore(score: number): "green" | "amber" | "red" {
  if (score >= 70) return "green";
  if (score >= 50) return "amber";
  return "red";
}

function readPersistedSektor(): Sektor | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ASSESSMENT_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { state?: { currentSektor?: Sektor } };
    return parsed.state?.currentSektor ?? null;
  } catch {
    return null;
  }
}

function resolveActiveSektor(fallbackProfilKode?: ProfilKode): Sektor {
  const persisted = readPersistedSektor();
  const state = useAssessmentStore.getState();
  if (persisted && state._hasHydrated) return state.currentSektor;
  if (persisted) return persisted;
  return dominantSektor(fallbackProfilKode);
}

async function getLocationScoreForSektor(
  wilayahId: number,
  sektor: Sektor,
  fallbackSektor: Sektor,
) {
  try {
    return await getLocationScore(wilayahId, sektor);
  } catch (err) {
    if (sektor !== fallbackSektor && err instanceof ApiError && err.code === "NOT_FOUND") {
      return getLocationScore(wilayahId, fallbackSektor);
    }
    throw err;
  }
}

function latestTimestamp(...values: Array<string | null | undefined>): string {
  const valid = values.filter((value): value is string => Boolean(value));
  if (valid.length === 0) return new Date().toISOString();
  return valid.sort((a, b) => b.localeCompare(a))[0]!;
}

export async function getQuickScan(
  wilayahId: number,
  profilKode?: ProfilKode
): Promise<QuickScanSnapshot> {
  try {
    const snapshots = loadFixture(snapshotData, QuickScanSnapshotSchema.array());
    const match = snapshots.find(
      (s) =>
        s.wilayah_id === wilayahId &&
        (profilKode === undefined || s.profil_kode === profilKode)
    );
    const identity = match ?? snapshots.find((s) => s.wilayah_id === wilayahId);
    if (!identity) {
      throw new ApiError(
        "NOT_FOUND",
        `GET /discovery/quickscan/${wilayahId}`,
        `No quick scan snapshot for wilayah_id ${wilayahId}`
      );
    }

    const fallbackSektor = dominantSektor(identity.profil_kode);
    const activeSektor = resolveActiveSektor(identity.profil_kode);

    try {
      const [locationScore, investmentSummary, businessRecommender, landValue, growth, comparison] =
        await Promise.all([
          getLocationScoreForSektor(wilayahId, activeSektor, fallbackSektor),
          getInvestmentSummary(wilayahId),
          getBusinessRecommender(wilayahId),
          getLandValue(wilayahId),
          getGrowth(wilayahId),
          compare([wilayahId]),
        ]);

      const comparisonRow = comparison.kandidat[0];
      const topRecommendations = [...businessRecommender.recommendations]
        .sort((a, b) => b.suitability_score + b.urgency_score - (a.suitability_score + a.urgency_score))
        .slice(0, 3)
        .map((recommendation) => ({
          sektor: recommendation.sektor,
          urgensi: recommendation.urgensi,
          detail: recommendation.aksi
            ? `${recommendation.alasan_timing}. ${recommendation.aksi}`
            : recommendation.alasan_timing,
        }));

      const sisaWindow = monthsUntilNextMilestone(growth.timeline_kritis);
      const nextMilestone = growth.timeline_kritis[0];

      return {
        ...identity,
        active_sektor: activeSektor,
        data_source: "live_composed",
        verdict_status: verdictFromKlasifikasi(investmentSummary.readiness.klasifikasi),
        verdict_score: investmentSummary.readiness.investment_readiness_score,
        verdict_reason: verdictReason(locationScore),
        verdict_kondisi: investmentSummary.readiness.verdict_kondisi.slice(0, 2),
        peluang_top3: topRecommendations,
        sinyal_kunci: [
          {
            label: `${SEKTOR_LABELS[activeSektor]} Suitability`,
            value: locationScore.score_breakdown.A1.raw_score,
            color: colorForScore(locationScore.score_breakdown.A1.raw_score),
          },
          {
            label: "Market Access",
            value: locationScore.score_breakdown.A4.raw_score,
            color: colorForScore(locationScore.score_breakdown.A4.raw_score),
          },
          {
            label: "Demand Absorpsi",
            value: comparisonRow?.A6 ?? identity.sinyal_kunci.find((item) => item.label === "Demand Absorpsi")?.value ?? 0,
            color: colorForScore(comparisonRow?.A6 ?? 0),
          },
          {
            label: "Growth Projection",
            value: growth.growth_projection_score,
            color: colorForScore(growth.growth_projection_score),
          },
        ],
        harga_window: {
          median_rp_per_m2: landValue.current.median_price_rp_per_m2,
          apresiasi_persen_per_tahun: landValue.current.appreciation_yoy_pct,
          sisa_window_bulan: sisaWindow,
          window_reason: nextMilestone
            ? `${nextMilestone.milestone}: ${nextMilestone.impact}`
            : landValue.timing_recommendation,
        },
        last_updated: latestTimestamp(
          locationScore.last_computed_at,
          investmentSummary.readiness.last_refreshed_at,
          businessRecommender.last_refreshed_at,
          landValue.last_updated,
          growth.last_computed_at,
        ),
      };
    } catch (err) {
      if (match) {
        return {
          ...match,
          active_sektor: dominantSektor(match.profil_kode),
          data_source: "snapshot_fallback",
        };
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("FIXTURE_INVALID", `GET /discovery/quickscan/${wilayahId}`, String(err));
  }
}
