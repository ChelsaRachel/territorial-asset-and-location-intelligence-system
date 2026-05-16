import type { IndicatorDeltaRow, PolicyEntry } from "@/lib/governance";
import { POLICY_TAG_DOMAIN_MAP, INDICATOR_DOMAIN_MAP } from "@/lib/governance";

const DOMAIN_RECOMMENDATION: Record<string, string> = {
  infrastruktur: "Prioritaskan paket APBD lintas Dinas PUPR dan Kominfo untuk konektivitas, irigasi, dan logistik komoditas.",
  demand: "Perluas MoU koperasi, offtaker, dan fasilitas cold-chain agar serapan pasar naik lebih cepat.",
  regulasi: "Percepat kepastian RDTR/KKPR dan SOP lintas DPMPTSP agar investasi tidak tertahan di tahap izin.",
};

const DOMAIN_CONTINUE: Record<string, string> = {
  infrastruktur: "Lanjutkan dan perluas cakupan kebijakan infrastruktur yang sudah menunjukkan delta kuat.",
  demand: "Replikasi kebijakan demand-side ke desa penghasil lain karena indikator pasar meningkat signifikan.",
  regulasi: "Pertahankan konsistensi regulasi dan siapkan kanal konsultasi investor untuk menjaga momentum.",
};

export function recommendNextPolicies(
  deltas: IndicatorDeltaRow[],
  policiesInPeriod: PolicyEntry[],
): string[] {
  const policyDomains = new Set(
    policiesInPeriod.flatMap((policy) =>
      policy.tags.flatMap((tag) => (POLICY_TAG_DOMAIN_MAP[tag] ? [POLICY_TAG_DOMAIN_MAP[tag]!] : [])),
    ),
  );

  const recommendations: string[] = [];
  for (const delta of deltas) {
    const domain = INDICATOR_DOMAIN_MAP[delta.indicator_id];
    if (!domain || typeof delta.delta_pct !== "number") continue;

    if (Math.abs(delta.delta_pct) < 5 && !policyDomains.has(domain)) {
      const recommendation = DOMAIN_RECOMMENDATION[domain] ?? "Prioritaskan paket kebijakan lanjutan untuk indikator yang belum membaik.";
      recommendations.push(recommendation);
    }
    if (delta.delta_pct > 20 && policyDomains.has(domain)) {
      const recommendation = DOMAIN_CONTINUE[domain] ?? "Lanjutkan dan perluas cakupan kebijakan yang sudah menunjukkan delta kuat.";
      recommendations.push(recommendation);
    }
  }

  return Array.from(new Set(recommendations)).slice(0, 3);
}
