# Assessment Fixture Assumptions

Source: `docs/04_OPPORTUNITY_RISK.md` §4.2 canonical values + BPS Karo spatial data

## General

- All `last_computed_at` / `last_refreshed_at` timestamps set to `2026-05-05T03:00:00Z` (sprint-05 baseline)
- `snapshot_date` fields set to `2026-05-05`
- Three canonical profiles: Berastagi (1206090), Ciwidey (3204170), Seminyak (5103060)

## C.1 location_score.json

- Berastagi pre-baked scores (78 agribisnis, 62 hospitality, 68 pariwisata, 70 properti) are from docs §4.2; they are not exact outputs of the live formula (see scoring/assessment.ts comment)
- Seminyak agribisnis `is_capped=false` — KONFLIK_REGULASI does NOT trigger the cap; only KAWASAN_LINDUNG and MORATORIUM do (docs §2.1)
- Naman Teran (1206040) `is_capped=true` — KAWASAN_LINDUNG Sinabung triggers cap → score=40
- Raw scores for each profile vary by sektor to reflect sektor-specific land suitability assessments

## C.3 risk_profile.json

- Berastagi risk scores: iklim=62, regulasi=78, infrastruktur=68, sosial=82 — from docs §2.2 mitigation table
- Ciwidey and Seminyak risk scores are designed to reflect actual conditions:
  - Ciwidey: iklim moderate (highland, Gunung Patuha volcanic proximity), regulasi high (Jabar pro-investment)
  - Seminyak: iklim low-risk (Bali stable), regulasi low (KONFLIK_REGULASI active), infrastruktur high, sosial high

## C.4 feasibility.json

- Berastagi quadrant scores follow docs §5.1 API example exactly
- Ciwidey pasar score=68 (A4=64, A6≈72 estimated demand absorption for highland tourism)
- Seminyak pasar score=86 (A4=82, A6≈90 estimated demand from beach tourism sector)

## C.6 financial_viability.json

- Berastagi agribisnis: exact canonical values from docs §4.2 (revenue=67,200,000; cost=31,700,000; ratio=2.12)
- Berastagi hospitality eco-resort: ratio=1.31 BORDERLINE from docs §3.1 scenario; proxy metrics adapted for non-agribisnis sektor (yield/harga fields used as unit-night proxies)
- Berastagi sensitivitas "biaya_input_naik_20pct": treats total cost × 1.2, consistent with docs §4.2 ratio=1.77
- Seminyak "kombinasi_terburuk" ratio=0.84 — pre-computed NOT_VIABLE; fixture stores this as positive number per schema (ratio > 0 constraint); the value below 1.0 represents deep loss scenario
- Ciwidey agribisnis cost: 31,450,000 (stroberi Ciwidey slightly higher logistics cost than Berastagi)

## B.4 investment_readiness.json

- Berastagi B.4 = (82+76+84+81)/4 = 80.75 — canonical from docs §4.2
- Ciwidey B.4 = (82+78+91+71)/4 = 80.5 — derived from agribisnis raw scores
- Seminyak B.4 = (88+98+60+58)/4 = 76.0 — uses hospitality A1=88 as canonical base (primary use case)
- Sektor_siap thresholds: A1≥65 AND A6>0 AND A2≥60 AND flag=BEBAS_INVESTASI (docs §2.5)
- Berastagi hospitality syarat_belum = zonasi RDTR (consistent with docs example)
- Seminyak agribisnis syarat_terpenuhi=1 — only A2=98≥60 passes; A1=38, A6=0, flag=KONFLIK_REGULASI all fail

## B.1 ranking_region.json

- Berastagi: rank 3/25 Sumatera Utara agribisnis; nasional rank 47/514 — from docs §5.1
- Doloksanggul (1207050) rank 1 score=84, Merek (1206080) rank 2 score=82 — from docs §5.1
- Ciwidey: rank 3/45 Jawa Barat pariwisata — Rancabali rank 1 (86), Pasirjambu rank 2 (83)
- Seminyak: rank 2/15 Bali hospitality — Kuta rank 1 (88); Canggu (5103040) rank 3 (79)

## B.6 peruntukan_rekomendasi.json

- Naman Teran (1206040) added as `perlu_kajian_lanjut` case demonstrating KAWASAN_LINDUNG blockage
- Ciwidey status=rekomendasi_dengan_syarat because hospitality land suitability (62) below threshold
- Seminyak status=rekomendasi_dengan_syarat because KONFLIK_REGULASI not yet resolved
- Score values (87, 84, 83 etc.) are pre-baked composite estimates, not live formula output

## B.2 gap_analysis.json

- 10 Karo kecamatan; priority_score = skor_potensi × infrastructure_gap (docs §4.1 table)
- Top 5 order: Berastagi(1872) > Merdeka(1728) > Naman Teran(1480) > Tigapanah(1360) > Munte(1216) — from docs §3.2 scenario
- Berastagi sub-components: air_bersih current=64 (gap=-36), 4G current=67 (gap=-33) — from docs §8.2 scenario
- Infrastructure index per kecamatan = arithmetic mean of 4 sub-component current_pct values
- Kabanjahe (1206060) rank 8 despite skor_potensi=82 (highest) because it is the kabupaten capital — already developed, low infrastructure_gap=10
- BPS kecamatan codes: 1206010=Dolat Rayat, 1206020=Barusjahe, 1206030=Lau Baleng, 1206040=Naman Teran, 1206050=Merdeka, 1206060=Kabanjahe, 1206070=Munte, 1206090=Berastagi, 1206100=Tigapanah, 1206120=Simpang Empat
