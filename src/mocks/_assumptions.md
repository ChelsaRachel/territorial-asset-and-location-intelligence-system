# Fixture Assumptions

Every value not directly stated in the TALIS documentation is logged here with its source/justification.

## dim_wilayah.json

- Seminyak.lat = -8.6905, lng = 115.1729 — derived from known geographic position of Seminyak, Kuta, Badung, Bali
- Berastagi.lat = 3.1968, lng = 98.5095 — derived from known geographic position of Kecamatan Berastagi, Karo, North Sumatra

## wilayah_score_aggregate.json

### Ciwidey (3204170)
- `land_suitability_hosp = 62` — invented (AGRO_DOMINANT profile; hospitality not primary; chose amber-range)
- `land_suitability_pariwisata = 65` — invented (slight premium over hospitality due to agrowisata potential; amber-range)
- `infrastructure_index = 78.2` — from docs/01_COMMAND_CENTER.md §5.1 sample
- `zoning_compliance = 91` — Ciwidey has RDTR + BEBAS_INVESTASI → high compliance; chosen high-green
- `demand_absorption = 88` — from docs/01_COMMAND_CENTER.md §5.1 sample
- `growth_projection = 71` — from docs/01_COMMAND_CENTER.md §5.1 sample

### Seminyak (5103060)
- `land_suitability_agro = 38` — invented (HOSPITALITY_DOMINANT, very low agricultural suitability — urban beach zone; red-range)
- `land_suitability_hosp = 88` — invented (premium hospitality zone, consistent with Bali tourism; high-green)
- `land_suitability_pariwisata = 85` — invented (similar to hosp, slight discount for tourism vs pure hospitality)
- `infrastructure_index = 98.0` — from docs/02_TERRITORY_PROFILE.md §4.2 (Seminyak has best infra of 3 profiles)
- `zoning_compliance = 60` — invented (KONFLIK_REGULASI — Bali over-development / mixed zoning conflict; amber-range)
- `market_access = 82` — invented (Ngurah Rai airport nearby, excellent logistics for tourism; high-green)
- `demand_absorption = 74` — invented (strong demand but some saturation post-2024 over-supply; green)
- `growth_projection = 62` — invented (moderated by market maturity; amber)
- `location_score = 74` — consistent with hospitality preset weighted score
- `median_land_price = 28500000` — from docs/03_TERRITORY_INTELLIGENCE.md §4.2 land value summary

## quick_scan_snapshot.json

SPRINT-08 update: `quick_scan_snapshot.json` is now deprecated as the primary Quick Scan source. The adapter composes live output from Page 4/5/3 TALIS adapters (`getLocationScore`, investment readiness, business recommender, land value, growth projection, comparison aggregate) and only falls back to this snapshot when a live adapter is unavailable for the selected wilayah/profile.

### Seminyak (5103060)
- `verdict_status = "LAYAK_BERSYARAT"` — chosen for high price + KONFLIK_REGULASI risk; not full LAYAK
- `verdict_score = 72.5` — invented, consistent with LAYAK_BERSYARAT threshold; lower than Berastagi (80.5)
- `verdict_reason` — synthetic, consistent with HOSPITALITY_DOMINANT profile + over-supply risk
- `verdict_kondisi` — synthetic, mirroring known Bali regulatory/supply risks
- `peluang_top3` — synthetic with real Bali tourism sektor terminology (resort boutique, co-living, surf hub)
- `sinyal_kunci` — consistent with score_aggregate values
- `sisa_window_bulan = 24` — from harga_window field; stabilisasi pasca over-supply context

## mocks/_assumptions.md

- `talis-red-700 = #B42318` — unlisted in docs/00_OVERVIEW.md §5.4 palette. Chose Tailwind red-700-ish for
  danger/TIDAK_LAYAK/MORATORIUM/KAWASAN_LINDUNG. Documented in tailwind.config.ts comment.

## Berastagi sisa_window_bulan = 18

- Calculated: today = 2026-05-07, Tol Medan–Berastagi ETA = 2027-Q4 (~Nov 2027) = ~18 months
  Documented per docs/03_TERRITORY_INTELLIGENCE.md reference to tol pipeline.

---

## SPRINT-02 extension

Added 23 new wilayah rows to `dim_wilayah.json` and `wilayah_score_aggregate.json`. Data sourced via websearch (Wikipedia BPS/Kemendagri codes, Lamudi/99.co/Rumah123 land price listings, Exotiq Property Bali market reports, ILA Global Consulting Lombok investment reports). BPS codes derived from Kemendagri format PP+KK+DDD; codes marked "(unverified)" are BPS-format-compliant but could not be confirmed against an authoritative BPS Wilkerstat PDF.

### Matching Score formula for Mode 3 ranking verification

Formula: `(A.1×0.5) + (A.4×0.3) + (A.8×0.2)` where A.1=`land_suitability_agro`, A.4=`market_access`, A.8=`growth_projection`. Canonical scenario: Sektor=Hospitality, Budget≤Rp 1jt/m², Preferensi=growth.

Berastagi must rank #1: score = (82×0.5)+(64×0.3)+(81×0.2) = 41+19.2+16.2 = **76.4**

Wilayah passing ≤1jt/m² budget filter and their scores:
- Ciwidey (185K): (82×0.5)+(64×0.3)+(71×0.2) = 74.4 — #2
- Cangkringan (650K): (72×0.5)+(62×0.3)+(64×0.2) = 67.4 — #3
- Sembalun (400K): (76×0.5)+(42×0.3)+(76×0.2) = 65.8 — #4
- Poncokusumo (450K): (78×0.5)+(46×0.3)+(64×0.2) = 65.6 — #5
- Siborong-borong (380K): (72×0.5)+(52×0.3)+(68×0.2) = 65.2 — #6
- Getasan (420K): (74×0.5)+(52×0.3)+(54×0.2) = 63.4 — #7
- Kec. Toba (580K): (62×0.5)+(44×0.3)+(72×0.2) = 58.6 — #8 (tied with Dlingo)
- Dlingo (450K): (66×0.5)+(44×0.3)+(62×0.2) = 58.6 — #9
- Tinggimoncong (520K): (68×0.5)+(52×0.3)+(64×0.2) = 62.4 — #10
- Bebesen (350K): (82×0.5)+(36×0.3)+(56×0.2) = 63.0
- Balik Bukit (650K): (78×0.5)+(38×0.3)+(58×0.2) = 62.0
- Dolok Silau (55K): (76×0.5)+(28×0.3)+(42×0.2) = 54.8

### Canonical references

**1104030 — Kec. Bebesen (Kab. Aceh Tengah, Aceh)**
- BPS code: Kemendagri 11.04.03 = 1104030 (verified via Wikipedia kecamatan list)
- Lat/lng: 4.6253, 96.8450 (Takengon/Bebesen urban center)
- Profile: AGRO_DOMINANT — Gayo arabika specialty coffee (GI product), hortikultura, Danau Laut Tawar
- Chosen for: geographic diversity (Aceh), agro sektor coverage, low-price frontier
- `land_suitability_agro = 82` — Gayo arabika is internationally traded premium coffee; high agro suitability
- `median_land_price = 350000` — agro/residential; Rp 150K–1jt range from 99.co listings; midpoint for non-commercial plots
- `appreciation_rate = 5.4` — stable agro frontier; 4–7% range

**1202090 — Kec. Siborong-borong (Kab. Tapanuli Utara, Sumatera Utara)**
- BPS code: Kemendagri 12.02.09 = 1202090 (Wikipedia kecamatan list Tapanuli Utara)
- Lat/lng: 2.2130, 98.9762 (kecamatan center near Silangit Airport corridor)
- Profile: Mixed agro+pariwisata — kopi arabika, hortikultura, gateway Lake Toba via Silangit Airport
- Chosen for: Sumut diversity beyond Karo+Simalungun, airport-access catalyst
- `appreciation_rate = 7.2` — boosted by Silangit International Airport (direct Jakarta routes since 2018)

**1208260 — Kec. Dolok Silau (Kab. Simalungun, Sumatera Utara)**
- BPS code: Kemendagri 12.08.26 = 1208260 (Wikipedia kecamatan list Simalungun); code unverified against BPS Wilkerstat
- Lat/lng: 3.0480, 98.6915 (est. kecamatan center)
- Profile: AGRO subsistence/frontier — perkebunan sawit, karet, durian; very low land price
- Chosen for: agro sektor diversity + Mode 3 low-budget candidate
- `median_land_price = 55000` — perkebunan plots; Rp 18K–65K from agro listing aggregates; used mid-range

**1212140 — Kec. Toba (Kab. Toba, Sumatera Utara)** ← CANONICAL REQUIRED
- BPS code: 1212140 — derived from Kemendagri 12.12.14x (Kab. Toba = 1212). Kecamatan Toba confirmed in Wikipedia's "Daftar kecamatan... Kabupaten Toba" list. Ordinal 140 is unverified; note in production to replace with confirmed BPS code.
- TASK-001 spec says "Kec. Toba (Kab. Toba Samosir)" — uses same kecamatan name per TASK canonical reference.
- Lat/lng: 2.1500, 99.1800 — estimated, inland Kab. Toba south of eastern Lake Toba shore
- Profile: emerging Agro+Hospitality land banking area — kopi, hortikultura + Danau Toba eco-resort corridor; lower scores than Berastagi per TASK spec
- Role: Land Banking comparison per `05_INVESTMENT_DECISION.md` §8.3; benchmark "3-year-ago" proxy for Berastagi's growth trajectory
- `land_suitability_agro = 62`, `land_suitability_hosp = 58` — kept below Berastagi's (82, 76) to reflect earlier development stage
- `growth_projection = 72` — Super Priority Destination designation (Danau Toba) drives above-average growth
- `median_land_price = 580000` — lakeside agro zone; Rp 450K–1.7jt range; used agro-oriented mid-lower price

**1374020 — Kec. Padang Panjang Barat (Kota Padang Panjang, Sumatera Barat)**
- BPS code: Kemendagri 13.74.02 = 1374020 (Wikipedia kecamatan list Kota Padang Panjang)
- Lat/lng: -0.4658, 100.4052 (city center)
- Profile: Mixed kota pendidikan + properti; moderate scores; Sumbar geographic diversity
- Chosen for: Sumbar coverage alongside Bukittinggi; provides properti-urban wilayah type

**1375010 — Kec. Guguk Panjang (Kota Bukittinggi, Sumatera Barat)**
- BPS code: Kemendagri 13.75.01 = 1375010 (Wikipedia kecamatan list Kota Bukittinggi)
- Lat/lng: -0.3054, 100.3696 (Bukittinggi city center, Jam Gadang area)
- Profile: Pariwisata kultural + urban commercial — Jam Gadang, Ngarai Sianok, Pasar Atas/Bawah
- Chosen for: Mode 2 sektor pariwisata + high market_access + Sumbar provincial diversity
- `land_suitability_pariwisata = 82` — nationally recognized heritage tourism destination; Minangkabau cultural center
- `infrastructure_index = 88.6` — well-developed city infrastructure; road, utilities, connectivity
- `median_land_price = 3200000` — filters out of Mode 3 ≤1jt scenario; represents premium urban Sumbar

**1804040 — Kec. Balik Bukit (Kab. Lampung Barat, Lampung)**
- BPS code: Kemendagri 18.04.04 = 1804040 (Wikipedia kecamatan list Kab. Lampung Barat); code unverified against BPS Wilkerstat
- Lat/lng: -5.0285, 104.0615 (Liwa town center)
- Profile: AGRO_DOMINANT — kopi robusta/arabika Lampung, tanaman pangan; Bukit Barisan Selatan NP proximity
- Chosen for: Lampung provincial diversity + agro sektor + low-price frontier
- `land_suitability_agro = 78` — Lampung is Indonesia's largest robusta coffee producer; high agro suitability
- `infrastructure_index = 48.6` — remote highland; limited road quality
- `median_land_price = 650000` — Rp 500K–2jt range from Liwa listings; agro/residential midpoint

**3203280 — Kec. Cipanas (Kab. Cianjur, Jawa Barat)**
- BPS code: Kemendagri 32.03.28 = 3203280 (Wikipedia kecamatan list Kab. Cianjur)
- Lat/lng: -6.7350, 107.0420 (Cipanas town, Puncak corridor)
- Profile: Hospitality/pariwisata — hill resort, Kota Bunga villa cluster, agro (strawberry, sayuran)
- Chosen for: Jabar diversity + Mode 2 Sektor=Hospitality filter support + Puncak corridor demand
- `land_suitability_hosp = 74`, `land_suitability_pariwisata = 78` — strong weekend-getaway demand from Jakarta
- `median_land_price = 1250000` — Rp 890K–3jt villa zone; filters out of Mode 3 ≤1jt

**3204030 — Kec. Pacet (Kab. Bandung, Jawa Barat)** ← CANONICAL REQUIRED
- BPS code: Kemendagri 32.04.30 = 3204030 (Wikipedia kecamatan list Kab. Bandung). TASK spec shows "3204140 or similar" — confirmed 3204030 is correct per Kemendagri coding.
- Lat/lng: -7.1002, 107.6962 (Pacet kecamatan center, hot springs area)
- Profile: AGRO-leaning mixed — tea plantation, hot springs pariwisata (Cipanas-Pacet thermal), properti second-home
- Role: Ciwidey 3-year-ago benchmark per `06_MONITORING_GOVERNANCE.md` §2.4 and `01_COMMAND_CENTER.md` §8.2
- `land_suitability_agro = 76` — explicitly required by TASK-001 spec ("~76 to be a credible Berastagi benchmark")
- Scores are ~6–10 points below Ciwidey (82 agro, 78.2 infra, 91 zoning) to reflect an earlier development stage
- `median_land_price = 165000` — same order as Ciwidey (185K); intentional near-match for benchmark validity
- `appreciation_rate = 7.3` — lower than Ciwidey (18.7%) as the "3-year-ago" less-developed version

**3217010 — Kec. Lembang (Kab. Bandung Barat, Jawa Barat)**
- BPS code: Kemendagri 32.17.01 = 3217010 (Wikipedia kecamatan list Kab. Bandung Barat)
- Lat/lng: -6.8111, 107.6171
- Profile: Pariwisata + properti — agrowisata susu/strawberry, wisata alam, Bandung second-home corridor
- Chosen for: Jabar diversity + Mode 2 pariwisata + strong demand_absorption signal
- `land_suitability_pariwisata = 82` — Lembang is the most-visited highland getaway from Bandung metro
- `median_land_price = 3500000` — filters out of Mode 3 ≤1jt

**3308020 — Kec. Borobudur (Kab. Magelang, Jawa Tengah)**
- BPS code: Kemendagri 33.08.02 = 3308020 (Wikipedia kecamatan list Kab. Magelang)
- Lat/lng: -7.6074, 110.2038
- Profile: Pariwisata dominan — UNESCO heritage, Super Priority Destination, homestay economy
- Chosen for: Jateng coverage + pariwisata sektor diversity + growth_projection signal
- `land_suitability_pariwisata = 94` — highest in dataset; UNESCO + Super Priority means the strongest pariwisata designation
- `growth_projection = 78` — ongoing Borobudur Master Plan 2020–2045 drives sustained appreciation
- `appreciation_rate = 12.4` — ring-1 candi zone YoY per property analyst reports (2024–2025)
- `median_land_price = 1800000` — filters out of Mode 3 ≤1jt

**3322010 — Kec. Getasan (Kab. Semarang, Jawa Tengah)**
- BPS code: Kemendagri 33.22.01 = 3322010 (Wikipedia kecamatan list Kab. Semarang); code unverified against BPS Wilkerstat
- Lat/lng: -7.3920, 110.4220 (est., near Kopeng resort area, Gunung Merbabu foothills)
- Profile: AGRO_DOMINANT — sayuran, bunga potong; pariwisata alam (Kopeng) berkembang
- Chosen for: Jateng diversity + agro sektor + Mode 3 mid-score candidate (≤1jt budget)
- `land_suitability_agro = 74` — volcanic highland, fertile soil, existing sayuran/bunga economy
- `median_land_price = 420000` — Rp 275K–600K kebun/sawah range; passes Mode 3 budget filter

**3402110 — Kec. Dlingo (Kab. Bantul, DI Yogyakarta)**
- BPS code: Kemendagri 34.02.11 = 3402110 (Wikipedia kecamatan list Kab. Bantul)
- Lat/lng: -7.9170, 110.4380 (est., highland SE Bantul)
- Profile: AGRO + wisata alam emerging — hutan pinus, bukit bintang viewpoint, kayu, tanaman pangan
- Chosen for: DIY diversity + emerging frontier profile + agro + Mode 3 low-price candidate
- `median_land_price = 450000` — affordable highland Bantul; passes Mode 3 budget filter

**3404170 — Kec. Cangkringan (Kab. Sleman, DI Yogyakarta)**
- BPS code: Kemendagri 34.04.17 = 3404170 (Wikipedia kecamatan list Kab. Sleman)
- Lat/lng: -7.6641, 110.4614 (Merapi foothills)
- Profile: Mixed agro + Merapi volcano tourism — salak pondoh, lava tour, volcano camp
- Chosen for: DIY diversity + mixed agro/pariwisata + Mode 3 candidate (score 67.4, rank #3)
- `market_access = 62` — higher than other frontier agro wilayah due to proximity to Yogyakarta city
- `median_land_price = 650000` — passes Mode 3 ≤1jt filter; ranks #3 in canonical scenario

**3507070 — Kec. Poncokusumo (Kab. Malang, Jawa Timur)**
- BPS code: Kemendagri 35.07.07 = 3507070 (Wikipedia kecamatan list Kab. Malang); code unverified against BPS Wilkerstat
- Lat/lng: -8.0100, 112.8200 (est., eastern Malang highlands, Bromo approach corridor)
- Profile: AGRO_DOMINANT — apel, kopi, sayuran; pariwisata berkembang (gateway Bromo Tengger Semeru)
- Chosen for: Jatim diversity + agro sektor + Mode 3 mid-score candidate
- `land_suitability_agro = 78` — volcanic highland with established apple/coffee economy
- `median_land_price = 450000` — agro/highland; passes Mode 3 budget filter; ranks #5 (score 65.6)

**3579030 — Kec. Junrejo (Kota Batu, Jawa Timur)**
- BPS code: Kemendagri 35.79.03 = 3579030 (Wikipedia kecamatan list Kota Batu)
- Lat/lng: -7.8600, 112.5500 (est., near Kusuma Agro/wisata corridor)
- Profile: Mixed agrowisata + hospitality — apple orchards, Jatim Park ecosystem, Batu tourism zone
- Chosen for: Jatim diversity + agro+hosp sektor coverage + strong infrastructure
- `land_suitability_agro = 76`, `land_suitability_hosp = 74` — high dual-sektor profile
- `median_land_price = 2800000` — filters out of Mode 3 ≤1jt

**5102050 — Kec. Tabanan (Kab. Tabanan, Bali)**
- BPS code: Kemendagri 51.02.05 = 5102050 (Wikipedia kecamatan list Kab. Tabanan)
- Lat/lng: -8.5413, 115.1252
- Profile: Mixed agro (rice terrace Jatiluwih UNESCO) + pariwisata berkembang + villa spillover from Canggu
- Chosen for: Bali diversity + Mode 2 pariwisata + growth_projection signal (Canggu spillover)
- `growth_projection = 76` — "Bali West Corridor" demand driven by Canggu saturation spillover
- `median_land_price = 1800000` — filters out of Mode 3 ≤1jt

**5104050 — Kel. Ubud (Kab. Gianyar, Bali)** ← CANONICAL REQUIRED
- BPS code: Kemendagri 51.04.05 = 5104050 (Wikipedia Ubud, Gianyar article). TASK spec shows "5103xxx" — this was an approximation error; Ubud is in Kab. Gianyar (5104), not Kab. Badung (5103). Correct code confirmed as 5104050.
- Lat/lng: -8.5084, 115.2656 (Ubud center, Jl. Raya Ubud area)
- Profile: Pariwisata+Hospitality dominan — arts-culture-wellness, villa-resort, creative economy, digital nomad hub
- Role: Seminyak 6-year-ago benchmark per SPRINT.md benchmark mapping
- `land_suitability_hosp = 92` — explicitly required; "slightly above Seminyak 88 reflecting Ubud's 6-year head start in the benchmark mapping" per TASK-001 spec
- `land_suitability_pariwisata = 88` — arts/culture/wellness tourism; slightly below Seminyak's beach resort premium
- `infrastructure_index = 84.5` — strong but below Seminyak (98.0); Ubud is inland, less airport-proximate
- `median_land_price = 14500000` — Rp 11–25jt prime villa corridor; mid-range used. Filters out of Mode 3 ≤1jt.
- `appreciation_rate = 13.8` — premium zone 10–18% YoY per Exotiq Property Bali 2025 market report

**5106040 — Kec. Kintamani (Kab. Bangli, Bali)**
- BPS code: Kemendagri 51.06.04 = 5106040 (kodepos.nomor.net verified)
- Lat/lng: -8.2391, 115.3250 (Kintamani caldera rim)
- Profile: AGRO + volcano-lake pariwisata — Kintamani arabika coffee, Pura Ulun Danu Batur, caldera tourism
- Chosen for: Bali diversity + agro sektor + pariwisata
- `land_suitability_agro = 72` — established Kintamani arabika coffee belt; nationally recognized origin
- `median_land_price = 1900000` — filters out of Mode 3 ≤1jt

**5203150 — Kec. Sembalun (Kab. Lombok Timur, NTB)**
- BPS code: Kemendagri 52.03.15 = 5203150 (Wikipedia kecamatan list Kab. Lombok Timur)
- Lat/lng: -8.3591, 116.5255
- Profile: AGRO + pariwisata emerging — sayuran, bawang, stroberi Sembalun; base camp Rinjani trekking
- Chosen for: NTB provincial diversity + agro + pariwisata + Mode 3 top-5 candidate (score 65.8, rank #4)
- `land_suitability_pariwisata = 74` — Rinjani trekking is one of Indonesia's top-5 hiking destinations
- `growth_projection = 76` — Mandalika (Lombok) corridor spillover + Rinjani International Park designation
- `appreciation_rate = 11.8` — Lombok property market grew 15–25% YoY post-Mandalika 2022 (NourEstates 2025 report); Sembalun = upstream agro zone with 8–15% range
- `median_land_price = 400000` — agro/highland; passes Mode 3 budget filter; ranks #4

**5315050 — Kec. Komodo (Kab. Manggarai Barat, NTT)**
- BPS code: Kemendagri 53.15.05 = 5315050 (Wikipedia kecamatan list Kab. Manggarai Barat)
- Lat/lng: -8.4538, 119.8728 (Labuan Bajo town area, within Kec. Komodo)
- Profile: Pariwisata dominan — Komodo National Park, luxury eco-resort, liveaboard diving, Super Priority Destination
- Chosen for: NTT provincial diversity + pariwisata + highest growth_projection in dataset
- `land_suitability_pariwisata = 94` — tied with Borobudur as highest; UNESCO Natural Heritage + Super Priority
- `land_suitability_hosp = 84` — luxury eco-resort corridor; international arrivals
- `growth_projection = 84` — highest in dataset; ongoing massive infrastructure investment (airport, ASDP port, resort zoning)
- `appreciation_rate = 14.2` — hillside/sunset-view zones 10–18% per 99.co listing trends 2024–2025
- `median_land_price = 4000000` — filters out of Mode 3 ≤1jt; represents premium Labuan Bajo corridor

**7306040 — Kec. Tinggimoncong (Kab. Gowa, Sulawesi Selatan)**
- BPS code: Kemendagri 73.06.04 = 7306040 (Wikipedia kecamatan list Kab. Gowa); code unverified against BPS Wilkerstat
- Lat/lng: -5.2476, 119.8568 (Malino town center)
- Profile: Hill resort + agro — Malino mountain resort (Makassar weekend gateway), sayuran, bunga, kopi
- Chosen for: Sulsel diversity + mixed agro/pariwisata + Mode 3 candidate (score 62.4)
- `median_land_price = 520000` — Rp 125K–1.1jt range; kavling wisata/villa zone midpoint. Passes Mode 3 budget filter.

**7326010 — Kec. Rantepao (Kab. Toraja Utara, Sulawesi Selatan)**
- BPS code: Kemendagri 73.26.01 = 7326010 (Wikipedia kecamatan list Kab. Toraja Utara)
- Lat/lng: -2.9697, 119.8983
- Profile: Pariwisata dominan — Toraja cultural-heritage tourism (Rambu Solo, tongkonan, tau-tau), hospitality
- Chosen for: Sulsel diversity + hospitality sektor + pariwisata
- `land_suitability_hosp = 78`, `land_suitability_pariwisata = 88` — nationally recognized cultural-tourism destination; international demand
- `median_land_price = 4500000` — filters out of Mode 3 ≤1jt; reflects premium heritage-tourism pricing

### Sektor diversity verification (SPRINT-02 requirement)

land_suitability_agro ≥70: Bebesen(82), Berastagi(82), Ciwidey(82), Pacet(76), Getasan(74), Junrejo(76), Poncokusumo(78), Kintamani(72), Dolok Silau(76), Siborong-borong(72), Balik Bukit(78), Sembalun(76), Cangkringan(72) — 13 wilayah ✓

land_suitability_hosp ≥70: Seminyak(88), Ubud(92), Berastagi(76), Cipanas(74), Lembang(72), Borobudur(76), Junrejo(74), Bukittinggi(72), Rantepao(78), Komodo(84) — 10 wilayah ✓

land_suitability_pariwisata ≥70: Seminyak(85), Ubud(88), Berastagi(78), Lembang(82), Borobudur(94), Junrejo(78), Tabanan(76), Kintamani(78), Cipanas(78), Rantepao(88), Komodo(94), Sembalun(74), Bukittinggi(82) — 13 wilayah ✓

growth_projection ≥70: Berastagi(81), Ciwidey(71), Kec. Toba(72), Borobudur(78), Junrejo(74), Tabanan(76), Kintamani(72), Komodo(84), Sembalun(76), Siborong-borong(68—just below) — 9 wilayah at or above 70 ✓

### Provinsi diversity: 12 distinct provinsi

Aceh(11), Sumatera Utara(12), Sumatera Barat(13), Lampung(18), Jawa Barat(32), Jawa Tengah(33), DI Yogyakarta(34), Jawa Timur(35), Bali(51), Nusa Tenggara Barat(52), Nusa Tenggara Timur(53), Sulawesi Selatan(73) ✓

### last_refreshed_at spread

All three original SPRINT-01 rows retain "2026-05-06T03:00:00Z". The 23 new rows use dates spanning 2026-04-02 through 2026-04-29 to simulate a realistic crawler refresh distribution across April 2026 (±2 weeks from mid-April).

### Potential naming collision risk

Multiple Indonesian kecamatan share names (e.g. "Kec. Getasan" in Kab. Semarang may have a namesake elsewhere). The `wilayah_id` is the primary key — `nama` alone is unsafe for lookups. All fixture adapters must join by `wilayah_id`.

### Score philosophy

All scores represent "TALIS assessment output" — what TALIS would score a wilayah based on its real-world economic character — not raw GDP or BPS statistics. The bias is toward supporting credible discovery scenarios (Mode 2 filter coverage, Mode 3 ranking diversity). Scores are internally consistent within a wilayah (e.g. high agro → high zoning_compliance for agricultural zones; high hosp → high market_access for tourism wilayah).

---

## SPRINT-03 Territory Profile fixtures

Websearch was used before authoring SPRINT-03 fixtures, per TASK-001/TASK-004 data rules. Sources reviewed:

- BPS Kabupaten Bandung, "Kecamatan Ciwidey Dalam Angka 2024" (release 2024-09-26): used for Ciwidey area 35.35 km2, 7 villages, population 90,740, density 2,567/km2, and general agriculture/transport context.
- RKPD Kabupaten Bandung 2025 / BPS Kabupaten Bandung 2024 snippet: used for Kabupaten Bandung 2023 PDRB per kapita ADHB 41.37 juta rupiah; applied as Ciwidey proxy because kecamatan-level PDRB is not published in the searched source.
- BPS Kabupaten Karo, "Kecamatan Berastagi Dalam Angka 2024" and BPS Karo 2023 economic release: used as real-world reference context; Berastagi numeric values are locked from docs/02_TERRITORY_PROFILE.md instead of recalculated.
- BPS Kabupaten Badung, "Kecamatan Kuta Dalam Angka 2024": used for Seminyak administrative context and density 1,526.42/km2; the fixture uses 2.65 km2 from older Seminyak administrative references and derives population 4,045.
- Badung PDRB 2023 public snippets: used to approximate Seminyak PDRB per kapita at 98.2 juta rupiah from Badung's tourism-heavy district economy.
- ATR/BPN GISTARU/RDTR/RTRW terminology was reviewed for zoning labels. All GeoJSON polygons are handcrafted PoC proxies, not official GISTARU, RDTR, Sentinel, KLHK, or cadastral geometries.
- Denpasar Tourism and port directory snippets were used to confirm Pelabuhan Benoa context; Indonesia Travel/port-directory snippets were used to confirm Belawan as a Medan/North Sumatra strategic port.
- Public distance snippets were reviewed for Seminyak to Ngurah Rai (about 9 km / 16-22 minutes) and Seminyak to Benoa (about 11 km / 26 minutes). Berastagi market-access values remain canonical from docs/02_TERRITORY_PROFILE.md.

### profile.json

- Ciwidey demographic fields mostly use BPS Kecamatan Ciwidey Dalam Angka 2024. PDRB/kapita uses Kabupaten Bandung as proxy because kecamatan-level PDRB was not available from the searched source.
- Ciwidey land composition is synthetic but informed by the BPS description of paddy, non-paddy agriculture, non-agricultural land, horticulture, tourism, and highland conservation context.
- Seminyak population is a synthetic 2023 estimate derived from 2.65 km2 area and BPS Kecamatan Kuta density 1,526.42/km2. This is intentionally lower than district-wide Kuta population because the active profile is Kel. Seminyak.
- Seminyak land composition is a synthetic urban/coastal proxy for hospitality-dominant land cover. It is not an official land-cover classification.
- Berastagi A.2 demografi, infrastructure, land composition, and analysis are locked to docs/02_TERRITORY_PROFILE.md canonical values where documented.
- Infrastructure breakdown values for all three canonical profiles follow docs/02_TERRITORY_PROFILE.md §4.2.

### zoning.json and maps/zoning/*.geojson

- Zoning scores for Ciwidey, Seminyak, and Berastagi align with existing score aggregate assumptions: Ciwidey 91, Seminyak 60, Berastagi 84.
- Berastagi uses `rdtr_available=false`, conflict area 488 ha, and `BEBAS_INVESTASI` exactly as required by docs/02_TERRITORY_PROFILE.md and TASK-001.
- Ciwidey is modeled as RDTR/RTRW-aligned agro-tourism with limited settlement edge conflict.
- Seminyak is modeled as `KONFLIK_REGULASI` rather than `MORATORIUM` to stay consistent with existing Quick Scan assumptions; the copy still references development controls, sempadan, drainage, and intensity checks.
- GeoJSON polygon coordinates are approximate visual proxies around the existing `dim_wilayah` centroids. They must not be treated as official boundaries or parcel overlays.
- TASK-006/TASK-007 added a `kawasan_lindung` toggle layer and implication bullets for all three sample profiles. Copy is synthetic but follows searched ATR/BPN/GISTARU/RDTR terminology: RTRW/RDTR, proxy RTRW, sempadan, kawasan lindung, verifikasi ATR/BPN, Bappeda, and pembaruan RDTR.
- Ciwidey and Berastagi protected-area polygons are indicative visual buffers only. Their `luas_kawasan_lindung_ha` remains 0 because the current zoning fixture does not classify any conflict area as protected land.

### market_access.json and maps/routes/*.geojson

- Berastagi Belawan, Kualanamu, and Pusat Pasar Medan values are locked to docs/02_TERRITORY_PROFILE.md: 84 km/135 min/Rp 800rb, 96 km/150 min/Rp 950rb, and 78 km/125 min/Rp 600rb.
- Berastagi uses `jalan_nasional` for the fifth destination per TASK-001 enum, replacing the cold-storage example row from the source doc table because the TASK requires five enum values.
- Ciwidey route distances and costs are synthetic but plausible, using Pelabuhan Patimban, Bandara Internasional Kertajati, Pasar Induk Gedebage, Bandung, and the Soreang-Ciwidey national-road corridor.
- Seminyak route distances follow searched public distance patterns for Ngurah Rai and Benoa where available; costs are synthetic PoC logistics values for short urban hospitality supply routes.
- Route GeoJSON LineStrings are simplified straight/midpoint polylines for rendering only. They are not OSRM outputs and do not encode official road geometry.
