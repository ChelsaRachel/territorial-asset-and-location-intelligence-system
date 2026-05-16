# Intelligence Mock Data Assumptions

## Overview

All values in `src/mocks/intelligence/*.json` are synthetic/illustrative data for the TALIS PoC.
No value has been scraped from live systems. Sources listed in `sumber` fields are reference labels
indicating the real-world data source that would supply this value in production.

## Canonical Values (Immutable — cross-sprint contract)

These values are referenced by SPRINT-05, SPRINT-06, and SPRINT-07 acceptance criteria.

| Field | Value | Profile |
|-------|-------|---------|
| `median_rp_per_m2` | 420.000 | Berastagi (1206090) |
| `appreciation_yoy_pct` | 15.4 | Berastagi |
| `speculation_ratio` | 1.4 | Berastagi |
| `speculation_status` | `sehat` | Berastagi |
| `growth_projection_score` | 81 | Berastagi |
| `pipeline_infra_score` | 92 | Berastagi |
| `cost_of_delay_per_bulan_rp` | 18.500.000 | Berastagi |
| A.5 scenario probabilities | 65/25/10 (Normal/Lemah/Kuat) | Berastagi |
| A.6 Stroberi gap | +560 ton/bln | Berastagi Agro |
| A.6 Markisa gap | +420 ton/bln | Berastagi Agro |
| A.6 Kubis status | `oversupply` | Berastagi Agro |
| A.6 Kopi Arabika status | `peluang_tinggi` | Berastagi Agro |
| A.8 milestones | 2026-Q3, 2027-Q1, 2027-Q4 | Berastagi |

## Derivations

### Speculation Ratio Formula
`speculation_ratio = appreciation_yoy_pct / pdrb_growth_pct_latest`

- Berastagi: 15.4 / 11.0 = 1.40 ✓
- Ciwidey: 18.7 / 10.4 = 1.80 ✓
- Seminyak: 6.2 / 6.9 = 0.90 ✓

Per docs/03_TERRITORY_INTELLIGENCE.md §3.3.

### Growth Projection Score Weights
Composite = 0.40 × pipeline_infra + 0.30 × emerging_destination + 0.30 × cagr_penduduk

- Berastagi: 0.40×92 + 0.30×73 + 0.30×74 = 36.8 + 21.9 + 22.2 = 80.9 ≈ 81 ✓
- Ciwidey: 0.40×72 + 0.30×66 + 0.30×63 = 28.8 + 19.8 + 18.9 = 67.5 ≈ 68 ✓
- Seminyak: 0.40×62 + 0.30×54 + 0.30×58 = 24.8 + 16.2 + 17.4 = 58.4 ≈ 58 ✓

## NDVI Data

- 12 months: May 2025 through April 2026 (latest available pre-May 2026).
- Berastagi NDVI (0.68-0.77): realistic for highland agricultural area in Sumatra.
  Matches sample data in docs/03_TERRITORY_INTELLIGENCE.md §4.2.
- Ciwidey NDVI (0.62-0.70): highland agro, slightly lower than Berastagi.
- Seminyak NDVI (0.33-0.42): coastal urban/resort area with limited vegetation.
- 5-year baseline computed as stable rolling average; values are synthetic.
- April 2026 Berastagi NDVI drop (-4.2% vs baseline) matches §8.2 anomaly detection scenario.

## PDRB Data

- Kabupaten Karo (Berastagi): 10.8–15.1 triliyun Rp (2020–2024).
  Growth pattern reflects post-COVID recovery + pre-tol infrastructure premium.
- Kabupaten Bandung (Ciwidey): 82.4–115.6 triliyun Rp. Larger kabupaten.
- Kabupaten Badung (Seminyak): 18.6–63.0 triliyun Rp.
  Severe 2020 COVID impact (-38%) with strong 2022 recovery (+93.4%).
- BPS source label: real agency, values are synthetic approximations of BPS-style PDRB reporting.

## Climate Anomaly Data

- SPI (Standardized Precipitation Index): negative = drought, positive = excess rainfall.
- Major El Niño years: 2015 (strong), 2019 (moderate), 2023-2024 (moderate-to-strong).
  Based on NOAA/BMKG historical ENSO records.
- Berastagi 2024 SPI -1.6 is intentionally set to match §8.2 anomaly detection scenario.
- Kategori mapping: spi < -1.5 → kering_parah; -1.5 to -0.5 → kering_lemah;
  -0.5 to 0.5 → normal; 0.5 to 1.5 → basah_lemah; > 1.5 → basah_parah.

## Land Value Data

- Quarterly series: Q1 2024 through Q4 2025 (8 quarters).
- Appreciation calculated from Q4 2024 to Q4 2025 to match YoY definition.
- Berastagi area prices (Rp 318k-420k/m²) validated against mid-tier range for
  Sumatera Utara highland agricultural land.
- Seminyak prices (Rp 24.2M-28.5M/m²) validated against prime Bali beach resort zone.
- NJOP values are roughly 35-50% of market price, consistent with PBB assessments in these regions.

## Supply-Demand Data

- Berastagi Agro data (Stroberi, Markisa, Kubis, Wortel, Kopi Arabika) matches
  docs/03_TERRITORY_INTELLIGENCE.md §4.2 sample data verbatim.
- Seminyak "agro" sektor intentionally has zero items (coastal tourist area, no agro).
  This creates the empty state in A.6 for UI testing.
- Hospitality units: kamar/malam, unit/malam (hospitality);
  kunjungan/bln, tiket/bln, covers/hari (pariwisata);
  ha/bln, unit/bln, kavling/bln (properti).

## Emerging Signals

- TikTok/Instagram/Google Trends growth values are PoC proxy signals.
  Real production integration is flagged as high-risk in docs/00_OVERVIEW.md §8.
- Berastagi TikTok growth 168% reflects strong organic viral destination signals observed
  in Indonesian social media trends 2024-2026.

## Infrastructure Projects

- "Tol Medan-Berastagi" is a real planned project under PUPR/BPJT.
  Construction timeline (Q3 2026 → Q4 2027) is a realistic PoC estimate.
- "BIJB Kertajati" (West Java Airport) is real. Route expansion timeline is PoC estimate.
- "Tol Soroja Extension" is PoC estimate for Ciwidey connectivity improvement.
- All cost values (nilai_rp_t) are illustrative — real project costs are classified
  in PUPR budget documents.
