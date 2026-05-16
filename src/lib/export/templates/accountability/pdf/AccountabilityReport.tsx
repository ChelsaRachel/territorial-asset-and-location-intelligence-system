import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatPct, formatRpPerM2, truncateText } from "@/lib/export/lib/format";
import type { AccountabilityPolicyReport, AccountabilityReportData } from "@/lib/export/types";
import type { IndicatorDeltaRow } from "@/lib/governance";
import { exportTheme } from "../../theme";

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
    minHeight: 210,
    backgroundColor: exportTheme.colors.green900,
    color: exportTheme.colors.white,
  },
  logo: { width: 72, height: 72, border: `1px solid ${exportTheme.colors.white}`, alignItems: "center", justifyContent: "center", marginBottom: 26 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 12 },
  h1: { fontSize: 17, fontWeight: 700, color: exportTheme.colors.green900, marginBottom: 14 },
  h2: { fontSize: 12, fontWeight: 700, color: exportTheme.colors.stone900, marginBottom: 8 },
  body: { fontSize: 10, lineHeight: 1.45, color: exportTheme.colors.stone700 },
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
  table: { border: `1px solid ${exportTheme.colors.stone200}`, backgroundColor: exportTheme.colors.white },
  row: { flexDirection: "row", borderBottom: `1px solid ${exportTheme.colors.stone200}` },
  headerCell: { backgroundColor: exportTheme.colors.green900, color: exportTheme.colors.white, padding: 5, fontSize: 8, fontWeight: 700 },
  cell: { padding: 5, fontSize: 8, minHeight: 23 },
  numeric: { fontFamily: exportTheme.fonts.mono },
  up: { color: exportTheme.colors.green700 },
  down: { color: exportTheme.colors.red700 },
  neutral: { color: exportTheme.colors.stone700 },
  card: { padding: 11, border: `1px solid ${exportTheme.colors.stone200}`, backgroundColor: exportTheme.colors.white, marginBottom: 10 },
  disclaimer: { marginTop: 14, fontSize: 10, fontStyle: "italic", color: exportTheme.colors.stone700 },
  lessonGrid: { flexDirection: "row", gap: 10, marginTop: 12 },
  lesson: { flex: 1, padding: 10, border: `1px solid ${exportTheme.colors.stone200}`, backgroundColor: exportTheme.colors.white },
  mapBox: { height: 80, alignItems: "center", justifyContent: "center", backgroundColor: exportTheme.colors.stone100, border: `1px solid ${exportTheme.colors.stone200}`, color: exportTheme.colors.stone500, marginTop: 12 },
  bullet: { flexDirection: "row", gap: 6, marginBottom: 7 },
  bulletMark: { color: exportTheme.colors.green700, fontWeight: 700 },
});

function Footer({ data }: { data: AccountabilityReportData }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{`TALIS PoC - generated ${new Date(data.generatedAt).toLocaleDateString("id-ID")} - ${data.userId}`}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function CoverPage({ data }: { data: AccountabilityReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.coverBand}>
        <View style={styles.logo}><Text>TALIS</Text></View>
        <Text style={styles.title}>{data.title}</Text>
        <Text>{data.wilayahName}</Text>
        <Text>{`${data.periodAResolved} - ${data.periodBResolved}`}</Text>
      </View>
      <Text style={styles.body}>{`Dibuat untuk distribusi internal DPRD/Bappeda pada ${new Date(data.generatedAt).toLocaleString("id-ID")}.`}</Text>
      <View style={styles.mapBox}><Text>Peta interaktif tersedia di aplikasi web.</Text></View>
      <Footer data={data} />
    </Page>
  );
}

function SummaryPage({ data }: { data: AccountabilityReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Ringkasan Eksekutif</Text>
      <Text style={styles.body}>{data.executiveSummary}</Text>
      <View style={[styles.card, { marginTop: 18 }]}>
        <Text style={styles.h2}>Catatan Periode</Text>
        <Text style={styles.body}>{`Input periode ${data.periodAInput} sampai ${data.periodBInput}; snapshot yang dipakai ${data.periodAResolved} sampai ${data.periodBResolved}.`}</Text>
      </View>
      <Footer data={data} />
    </Page>
  );
}

function formatCell(row: IndicatorDeltaRow, value: number | string): string {
  if (row.indicator_id === "harga_lahan_median" && typeof value === "number") return formatRpPerM2(value);
  if (row.indicator_id === "ndvi_score" && typeof value === "number") return value.toFixed(3);
  return String(value);
}

function formatDelta(row: IndicatorDeltaRow): string {
  if (row.is_categorical_change) return row.direction === "stabil" ? "Stabil" : `Berubah ke ${row.after_value}`;
  if (row.indicator_id === "harga_lahan_median") return row.delta_pct === null ? "0%" : formatPct(row.delta_pct, 0);
  if (row.delta_absolute === null || row.delta_absolute === 0) return "0";
  return `${row.delta_absolute > 0 ? "+" : ""}${row.delta_absolute}`;
}

function SnapshotPage({ data }: { data: AccountabilityReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Snapshot Sebelum vs Sesudah</Text>
      <View style={styles.table}>
        <View style={styles.row}>
          {["Indikator", "Sebelum", "Sesudah", "Delta"].map((label) => (
            <Text key={label} style={[styles.headerCell, { width: "25%" }]}>{label}</Text>
          ))}
        </View>
        {data.deltaRows.map((row) => {
          const tone = row.indicator_id === "harga_lahan_median" ? styles.neutral : row.direction === "naik" ? styles.up : row.direction === "turun" ? styles.down : styles.neutral;
          return (
            <View key={row.indicator_id} style={styles.row}>
              <Text style={[styles.cell, { width: "25%" }]}>{row.indicator_label}</Text>
              <Text style={[styles.cell, styles.numeric, { width: "25%" }]}>{formatCell(row, row.before_value)}</Text>
              <Text style={[styles.cell, styles.numeric, { width: "25%" }]}>{formatCell(row, row.after_value)}</Text>
              <Text style={[styles.cell, styles.numeric, tone, { width: "25%" }]}>{formatDelta(row)}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.body, { marginTop: 12 }]}>Kenaikan harga lahan dibaca netral: baik bagi pemilik aset, tetapi dapat meningkatkan entry cost investor.</Text>
      <Footer data={data} />
    </Page>
  );
}

function PolicyPage({ data, report }: { data: AccountabilityReportData; report: AccountabilityPolicyReport }) {
  const policy = report.policy;
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <Text style={styles.h1}>{policy.title}</Text>
      <Text style={[styles.body, { marginBottom: 8 }]}>{`${policy.policy_date} - ${policy.tags.join(", ")}`}</Text>
      <Text style={styles.body}>{truncateText(policy.deskripsi, 600)}</Text>
      <Text style={[styles.h2, { marginTop: 16 }]}>Atribusi Dampak</Text>
      {report.attributionRows.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.row}>
            {["Indikator", "Delta", "Atribusi", "Confidence"].map((label) => (
              <Text key={label} style={[styles.headerCell, { width: "25%" }]}>{label}</Text>
            ))}
          </View>
          {report.attributionRows.map((row) => (
            <View key={`${policy.id}-${row.indicator_id}`} style={styles.row}>
              <Text style={[styles.cell, { width: "25%" }]}>{row.indicator_label}</Text>
              <Text style={[styles.cell, styles.numeric, { width: "25%" }]}>{row.delta_value}</Text>
              <Text style={[styles.cell, styles.numeric, { width: "25%" }]}>{`${row.estimated_attribution_pct}%`}</Text>
              <Text style={[styles.cell, { width: "25%" }]}>{row.confidence}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.card}><Text>Belum ada atribusi indikator signifikan untuk kebijakan ini.</Text></View>
      )}
      <Text style={styles.disclaimer}>{data.heuristicDisclaimer}</Text>
      <Footer data={data} />
    </Page>
  );
}

function EmptyPolicyPage({ data }: { data: AccountabilityReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Catatan Kebijakan dalam Periode</Text>
      <View style={styles.card}><Text>Tidak ada catatan kebijakan dalam periode ini.</Text></View>
      <Footer data={data} />
    </Page>
  );
}

function BenchmarkPage({ data }: { data: AccountabilityReportData }) {
  const benchmark = data.benchmark;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Benchmark Wilayah Komparatif</Text>
      {benchmark ? (
        <>
          <Text style={styles.body}>{benchmark.mapping.description}</Text>
          <View style={[styles.table, { marginTop: 12 }]}>
            <View style={styles.row}>
              {["Indikator", "Aktif Now", "Referensi Then", "Referensi Now / Estimasi"].map((label) => (
                <Text key={label} style={[styles.headerCell, { width: "25%" }]}>{label}</Text>
              ))}
            </View>
            {[
              ["Location Score", benchmark.activeNow.location_score, benchmark.mapping.reference_snapshot.location_score, benchmark.referenceNow?.location_score ?? benchmark.mapping.forecast_aktif_score],
              ["Infrastructure", benchmark.activeNow.infrastructure_index, benchmark.mapping.reference_snapshot.infrastructure_index, benchmark.referenceNow?.infrastructure_index ?? "n/a"],
              ["Market Access", benchmark.activeNow.market_access, benchmark.mapping.reference_snapshot.market_access, benchmark.referenceNow?.market_access ?? "n/a"],
              ["Land Value", formatRpPerM2(benchmark.activeNow.harga_lahan_median), formatRpPerM2(benchmark.mapping.reference_snapshot.harga_lahan_median), benchmark.referenceNow ? formatRpPerM2(benchmark.referenceNow.harga_lahan_median) : "n/a"],
            ].map((row) => (
              <View key={row[0]} style={styles.row}>
                {row.map((cell) => <Text key={String(cell)} style={[styles.cell, { width: "25%" }]}>{String(cell)}</Text>)}
              </View>
            ))}
          </View>
          <View style={styles.lessonGrid}>
            <View style={styles.lesson}><Text style={styles.h2}>Kebijakan Berhasil</Text>{benchmark.mapping.pelajaran_konkret.kebijakan_berhasil.map((item) => <Text key={item} style={styles.body}>{`- ${item}`}</Text>)}</View>
            <View style={styles.lesson}><Text style={styles.h2}>Kesalahan Hindari</Text>{benchmark.mapping.pelajaran_konkret.kesalahan_hindari.map((item) => <Text key={item} style={styles.body}>{`- ${item}`}</Text>)}</View>
            <View style={styles.lesson}><Text style={styles.h2}>Implikasi</Text>{benchmark.mapping.pelajaran_konkret.implikasi_untuk_aktif.map((item) => <Text key={item} style={styles.body}>{`- ${item}`}</Text>)}</View>
          </View>
        </>
      ) : (
        <View style={styles.card}><Text>Benchmark mapping belum tersedia untuk wilayah ini.</Text></View>
      )}
      <Footer data={data} />
    </Page>
  );
}

function RecommendationsPage({ data }: { data: AccountabilityReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Rekomendasi Kebijakan Berikutnya</Text>
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

export function AccountabilityReport({ data }: { data: AccountabilityReportData }) {
  return (
    <Document title={data.title} author={data.userId}>
      <CoverPage data={data} />
      <SummaryPage data={data} />
      <SnapshotPage data={data} />
      {data.policiesInPeriod.length === 0
        ? <EmptyPolicyPage data={data} />
        : data.policiesInPeriod.map((report) => <PolicyPage key={report.policy.id} data={data} report={report} />)}
      <BenchmarkPage data={data} />
      <RecommendationsPage data={data} />
    </Document>
  );
}
