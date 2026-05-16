import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { exportTheme } from "../../theme";
import { formatPct, formatRpPerM2, truncateText } from "@/lib/export/lib/format";
import type { ComparisonCandidateReport, ComparisonParameter, ComparisonReportData } from "@/lib/export/types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: exportTheme.fonts.sans,
    fontSize: 9,
    color: exportTheme.colors.stone900,
    backgroundColor: exportTheme.colors.stone50,
  },
  coverBand: {
    margin: -36,
    marginBottom: 42,
    padding: 36,
    minHeight: 220,
    backgroundColor: exportTheme.colors.green900,
    color: exportTheme.colors.white,
  },
  logo: {
    width: 72,
    height: 72,
    border: `1px solid ${exportTheme.colors.white}`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 12 },
  subtitle: { fontSize: 12, lineHeight: 1.5 },
  h1: { fontSize: 17, fontWeight: 700, color: exportTheme.colors.green900, marginBottom: 14 },
  h2: { fontSize: 13, fontWeight: 700, color: exportTheme.colors.stone900, marginBottom: 8 },
  body: { fontSize: 10, lineHeight: 1.5, color: exportTheme.colors.stone700 },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 20,
    paddingTop: 8,
    borderTop: `1px solid ${exportTheme.colors.stone200}`,
    color: exportTheme.colors.stone500,
    fontSize: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  card: {
    flex: 1,
    padding: 12,
    border: `1px solid ${exportTheme.colors.stone200}`,
    backgroundColor: exportTheme.colors.white,
  },
  score: { fontFamily: exportTheme.fonts.mono, fontSize: 22, color: exportTheme.colors.green700, marginTop: 6 },
  table: { border: `1px solid ${exportTheme.colors.stone200}`, backgroundColor: exportTheme.colors.white },
  row: { flexDirection: "row", borderBottom: `1px solid ${exportTheme.colors.stone200}` },
  headerCell: { backgroundColor: exportTheme.colors.green900, color: exportTheme.colors.white, padding: 5, fontSize: 8, fontWeight: 700 },
  cell: { padding: 5, fontSize: 8, minHeight: 24 },
  labelCell: { width: 132, fontWeight: 700 },
  numeric: { fontFamily: exportTheme.fonts.mono },
  best: { backgroundColor: exportTheme.colors.green100 },
  worst: { backgroundColor: exportTheme.colors.red100 },
  twoCol: { flexDirection: "row", gap: 14 },
  col: { flex: 1 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  kpi: { width: "48%", padding: 8, backgroundColor: exportTheme.colors.white, border: `1px solid ${exportTheme.colors.stone200}` },
  mapBox: {
    marginTop: 12,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: exportTheme.colors.stone100,
    border: `1px solid ${exportTheme.colors.stone200}`,
    color: exportTheme.colors.stone500,
  },
  barTrack: { height: 7, backgroundColor: exportTheme.colors.stone200, marginTop: 4 },
  barFill: { height: 7, backgroundColor: exportTheme.colors.green700 },
  bullet: { flexDirection: "row", gap: 6, marginBottom: 7 },
  bulletMark: { color: exportTheme.colors.green700, fontWeight: 700 },
});

function Footer({ data }: { data: ComparisonReportData }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{`TALIS PoC - generated ${new Date(data.generatedAt).toLocaleDateString("id-ID")} - ${data.userId}`}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function formatParamValue(parameter: ComparisonParameter, value: number): string {
  if (parameter.format === "currency") return formatRpPerM2(value);
  if (parameter.format === "percent") return formatPct(value);
  return Math.round(value).toString();
}

function CoverPage({ data }: { data: ComparisonReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.coverBand}>
        <View style={styles.logo}><Text>TALIS</Text></View>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>{data.wilayahNames.join("\n")}</Text>
      </View>
      <Text style={styles.body}>{`Dibuat pada ${new Date(data.generatedAt).toLocaleString("id-ID")} untuk ${data.userId}.`}</Text>
      <Footer data={data} />
    </Page>
  );
}

function ExecutiveSummaryPage({ data }: { data: ComparisonReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Ringkasan Eksekutif</Text>
      <View style={styles.cardRow}>
        {data.rekomendasiCards.map((card) => (
          <View key={card.tujuan} style={styles.card}>
            <Text style={styles.h2}>{card.tujuan}</Text>
            <Text>{card.winner_nama}</Text>
            <Text style={styles.score}>{card.winner_score}</Text>
            <Text style={styles.body}>{card.rationale}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.body}>{data.executiveSummary}</Text>
      <Footer data={data} />
    </Page>
  );
}

function ComparisonTablePage({ data }: { data: ComparisonReportData }) {
  const colWidth = `${(100 - 27) / Math.max(1, data.comparisonRows.length)}%`;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Komparasi Parameter</Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.headerCell, styles.labelCell]}>Parameter</Text>
          {data.comparisonRows.map((candidate) => (
            <Text key={candidate.wilayah_id} style={[styles.headerCell, { width: colWidth }]}>{truncateText(candidate.nama, 14)}</Text>
          ))}
        </View>
        {data.parameters.map((parameter) => (
          <View key={parameter.key} style={styles.row}>
            <Text style={[styles.cell, styles.labelCell]}>{parameter.label}</Text>
            {data.comparisonRows.map((candidate) => {
              const isBest = data.highlights.best[parameter.key] === candidate.wilayah_id;
              const isWorst = data.highlights.worst[parameter.key] === candidate.wilayah_id;
              return (
                <Text
                  key={`${parameter.key}-${candidate.wilayah_id}`}
                  style={[
                    styles.cell,
                    styles.numeric,
                    { width: colWidth },
                    ...(isBest ? [styles.best] : []),
                    ...(isWorst ? [styles.worst] : []),
                  ]}
                >
                  {`${isBest ? "BEST " : isWorst ? "LOW " : ""}${formatParamValue(parameter, Number(candidate[parameter.key]))}`}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
      <Footer data={data} />
    </Page>
  );
}

function MapPlaceholder() {
  return <View style={styles.mapBox}><Text>Peta interaktif tersedia di aplikasi web.</Text></View>;
}

function FactsheetPage({ data, candidate }: { data: ComparisonReportData; candidate: ComparisonCandidateReport }) {
  const profile = candidate.factsheet.profile;
  const zoning = candidate.factsheet.zoning;
  const market = candidate.factsheet.marketAccess;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>{`Profil Wilayah - ${candidate.row.nama}`}</Text>
      <View style={styles.twoCol} wrap={false}>
        <View style={styles.col}>
          <Text style={styles.h2}>Identitas</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpi}><Text>Luas</Text><Text style={styles.numeric}>{profile.demografi.luas_km2} km2</Text></View>
            <View style={styles.kpi}><Text>Penduduk</Text><Text style={styles.numeric}>{profile.demografi.jumlah_penduduk.toLocaleString("id-ID")}</Text></View>
            <View style={styles.kpi}><Text>Infrastruktur</Text><Text style={styles.numeric}>{profile.infrastruktur.infrastructure_index}</Text></View>
            <View style={styles.kpi}><Text>Zonasi</Text><Text style={styles.numeric}>{zoning.zoning_compliance_score}</Text></View>
          </View>
          <MapPlaceholder />
        </View>
        <View style={styles.col}>
          <Text style={styles.h2}>Akses dan Regulasi</Text>
          <Text style={styles.body}>{zoning.flag_detail}</Text>
          <Text style={[styles.body, { marginTop: 8 }]}>{`Bottleneck akses utama: ${market.bottleneck_utama}. Skor akses pasar ${market.market_access_score}.`}</Text>
          {Object.entries(profile.infrastruktur.breakdown).map(([key, value]) => (
            <View key={key} style={{ marginTop: 7 }}>
              <Text>{`${key.replace(/_/g, " ")}: ${value}`}</Text>
              <View style={styles.barTrack}><View style={[styles.barFill, { width: `${value}%` }]} /></View>
            </View>
          ))}
        </View>
      </View>
      <Footer data={data} />
    </Page>
  );
}

function RiskPage({ data, candidate }: { data: ComparisonReportData; candidate: ComparisonCandidateReport }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>{`Profil Risiko - ${candidate.row.nama}`}</Text>
      {candidate.riskProfile.detail_per_dimensi.map((dimension) => (
        <View key={dimension.dimensi} style={[styles.card, { marginBottom: 8 }]}>
          <Text style={styles.h2}>{dimension.dimensi}</Text>
          <Text style={styles.numeric}>{dimension.skor}</Text>
          <View style={styles.barTrack}><View style={[styles.barFill, { width: `${dimension.skor}%` }]} /></View>
          <Text style={[styles.body, { marginTop: 4 }]}>{dimension.sub_faktor.map((item) => item.keterangan).join(" ")}</Text>
        </View>
      ))}
      <Footer data={data} />
    </Page>
  );
}

function ViabilityPage({ data, candidate }: { data: ComparisonReportData; candidate: ComparisonCandidateReport }) {
  const viability = candidate.financialViability;
  const assumptions = [
    `${viability.asumsi.komoditas}: yield ${viability.asumsi.yield_kg_per_ha.toLocaleString("id-ID")} kg/ha`,
    `Harga jual ${viability.asumsi.harga_per_kg.toLocaleString("id-ID")} per kg`,
    `Biaya input ${viability.asumsi.biaya_input.toLocaleString("id-ID")}`,
    `Biaya tenaga kerja ${viability.asumsi.biaya_tenaga_kerja.toLocaleString("id-ID")}`,
  ];
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>{`Kelayakan Finansial - ${candidate.row.nama}`}</Text>
      <View style={styles.card}>
        <Text>Revenue / Cost Ratio</Text>
        <Text style={[styles.score, { fontSize: 34 }]}>{`${viability.ratio.toFixed(2)}x`}</Text>
        <Text style={styles.h2}>{viability.zone}</Text>
      </View>
      <Text style={[styles.h2, { marginTop: 18 }]}>Asumsi Kritis</Text>
      {assumptions.map((item) => (
        <View key={item} style={styles.bullet}><Text style={styles.bulletMark}>-</Text><Text>{truncateText(item, 100)}</Text></View>
      ))}
      <Footer data={data} />
    </Page>
  );
}

function RecommendationsPage({ data }: { data: ComparisonReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Rekomendasi Tindak Lanjut</Text>
      {data.recommendations.map((item) => (
        <View key={item} style={styles.bullet}>
          <Text style={styles.bulletMark}>-</Text>
          <Text style={styles.body}>{item}</Text>
        </View>
      ))}
      <Footer data={data} />
    </Page>
  );
}

export function ComparisonReport({ data }: { data: ComparisonReportData }) {
  return (
    <Document title={data.title} author={data.userId}>
      <CoverPage data={data} />
      <ExecutiveSummaryPage data={data} />
      <ComparisonTablePage data={data} />
      {data.candidates.map((candidate) => <FactsheetPage key={`factsheet-${candidate.row.wilayah_id}`} data={data} candidate={candidate} />)}
      {data.candidates.map((candidate) => <RiskPage key={`risk-${candidate.row.wilayah_id}`} data={data} candidate={candidate} />)}
      {data.candidates.map((candidate) => <ViabilityPage key={`viability-${candidate.row.wilayah_id}`} data={data} candidate={candidate} />)}
      <RecommendationsPage data={data} />
    </Document>
  );
}
