import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatPct, formatRpPerM2, truncateText } from "@/lib/export/lib/format";
import type { ShortlistDeltaIndicatorRow, ShortlistReportData, ShortlistReportEntry } from "@/lib/export/types";
import { exportTheme } from "../../theme";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: exportTheme.fonts.sans,
    fontSize: 9,
    backgroundColor: exportTheme.colors.stone50,
    color: exportTheme.colors.stone900,
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
  twoCol: { flexDirection: "row", gap: 14 },
  col: { flex: 1 },
  chip: { alignSelf: "flex-start", padding: 5, backgroundColor: exportTheme.colors.green100, color: exportTheme.colors.green900, fontSize: 8, fontWeight: 700, marginTop: 8 },
  table: { border: `1px solid ${exportTheme.colors.stone200}`, backgroundColor: exportTheme.colors.white },
  row: { flexDirection: "row", borderBottom: `1px solid ${exportTheme.colors.stone200}` },
  headerCell: { backgroundColor: exportTheme.colors.green900, color: exportTheme.colors.white, padding: 5, fontSize: 8, fontWeight: 700 },
  cell: { padding: 5, fontSize: 8, minHeight: 24 },
  numeric: { fontFamily: exportTheme.fonts.mono },
  breach: { backgroundColor: exportTheme.colors.red100 },
  high: { backgroundColor: exportTheme.colors.amber100, color: exportTheme.colors.amber700 },
  critical: { backgroundColor: exportTheme.colors.red100, color: exportTheme.colors.red700 },
  noteBox: { padding: 10, backgroundColor: exportTheme.colors.white, border: `1px solid ${exportTheme.colors.stone200}`, marginBottom: 10 },
  mapBox: { height: 96, alignItems: "center", justifyContent: "center", backgroundColor: exportTheme.colors.stone100, border: `1px solid ${exportTheme.colors.stone200}`, color: exportTheme.colors.stone500 },
});

function Footer({ data }: { data: ShortlistReportData }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{`TALIS PoC - generated ${new Date(data.generatedAt).toLocaleDateString("id-ID")} - ${data.userId}`}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function CoverPage({ data }: { data: ShortlistReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.coverBand}>
        <View style={styles.logo}><Text>TALIS</Text></View>
        <Text style={styles.title}>{data.title}</Text>
        <Text>{`${data.summary.totalEntries} wilayah shortlist`}</Text>
      </View>
      <Text style={styles.body}>{`${data.summary.narrative} Dibuat pada ${new Date(data.generatedAt).toLocaleString("id-ID")}.`}</Text>
      <Footer data={data} />
    </Page>
  );
}

function formatValue(row: ShortlistDeltaIndicatorRow, value: number | string): string {
  if (row.indicator === "harga_lahan_median" && typeof value === "number") return formatRpPerM2(value);
  return String(value);
}

function formatDelta(row: ShortlistDeltaIndicatorRow): string {
  if (typeof row.delta === "string") return row.delta;
  if (row.indicator === "harga_lahan_median") return row.deltaPct === null ? "0%" : formatPct(row.deltaPct);
  if (row.delta === 0) return "0";
  return `${row.delta > 0 ? "+" : ""}${row.delta}`;
}

function EntryPage({ data, entry }: { data: ShortlistReportData; entry: ShortlistReportEntry }) {
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <Text style={styles.h1}>{entry.wilayah.nama}</Text>
      <View style={styles.twoCol}>
        <View style={styles.col}>
          <Text style={styles.h2}>Identitas</Text>
          <Text style={styles.body}>{`${entry.wilayah.kabupaten}, ${entry.wilayah.provinsi}`}</Text>
          <Text style={styles.body}>{`Disimpan: ${new Date(entry.savedAt).toLocaleDateString("id-ID")}`}</Text>
          <Text style={styles.chip}>{entry.daysSinceSaved > 365 ? "1 tahun+" : `${entry.daysSinceSaved} hari sejak disimpan`}</Text>
          <View style={[styles.table, { marginTop: 14 }]}>
            <View style={styles.row}>
              {["Indicator", "Snapshot", "Current", "Delta", "Trend"].map((label) => (
                <Text key={label} style={[styles.headerCell, { width: "20%" }]}>{label}</Text>
              ))}
            </View>
            {entry.deltaRows.map((row) => (
              <View key={row.indicator} style={[styles.row, ...(row.thresholdBreached ? [styles.breach] : [])]}>
                <Text style={[styles.cell, { width: "20%" }]}>{row.label}</Text>
                <Text style={[styles.cell, styles.numeric, { width: "20%" }]}>{formatValue(row, row.snapshotValue)}</Text>
                <Text style={[styles.cell, styles.numeric, { width: "20%" }]}>{formatValue(row, row.currentValue)}</Text>
                <Text style={[styles.cell, styles.numeric, { width: "20%" }]}>{formatDelta(row)}</Text>
                <Text style={[styles.cell, { width: "20%" }]}>{row.trend}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.col}>
          <Text style={styles.h2}>Catatan</Text>
          <View style={styles.noteBox}><Text style={styles.body}>{truncateText(entry.note, 280)}</Text></View>
          {entry.notifications.length > 0 ? entry.notifications.map((notification) => (
            <View key={notification.message} style={[styles.noteBox, notification.severity === "CRITICAL" ? styles.critical : styles.high]}>
              <Text>{`${notification.severity}: ${notification.message}`}</Text>
            </View>
          )) : (
            <View style={styles.noteBox}><Text>Tidak ada perubahan signifikan sejak disimpan.</Text></View>
          )}
          <View style={styles.mapBox}><Text>Peta interaktif tersedia di aplikasi web.</Text></View>
          <Text style={[styles.body, { marginTop: 10 }]}>{`Lihat detail di aplikasi web - /profile?profile=${entry.wilayah.profile_slug}`}</Text>
        </View>
      </View>
      <Footer data={data} />
    </Page>
  );
}

function EmptyPage({ data }: { data: ShortlistReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Belum ada wilayah di shortlist Anda.</Text>
      <Footer data={data} />
    </Page>
  );
}

function ClosingPage({ data }: { data: ShortlistReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Ringkasan Shortlist</Text>
      <View style={styles.table}>
        <View style={styles.row}>
          {["Wilayah", "Location Score", "Trend", "Notifikasi"].map((label) => (
            <Text key={label} style={[styles.headerCell, { width: "25%" }]}>{label}</Text>
          ))}
        </View>
        {data.entries.map((entry) => {
          const ls = entry.deltaRows.find((row) => row.indicator === "location_score");
          return (
            <View key={entry.item.id} style={styles.row}>
              <Text style={[styles.cell, { width: "25%" }]}>{entry.wilayah.nama}</Text>
              <Text style={[styles.cell, styles.numeric, { width: "25%" }]}>{entry.current.location_score}</Text>
              <Text style={[styles.cell, { width: "25%" }]}>{ls?.trend ?? "stabil"}</Text>
              <Text style={[styles.cell, styles.numeric, { width: "25%" }]}>{entry.notifications.length}</Text>
            </View>
          );
        })}
      </View>
      <Footer data={data} />
    </Page>
  );
}

export function ShortlistReport({ data }: { data: ShortlistReportData }) {
  return (
    <Document title={data.title} author={data.userId}>
      <CoverPage data={data} />
      {data.entries.length === 0
        ? <EmptyPage data={data} />
        : data.entries.map((entry) => <EntryPage key={entry.item.id} data={data} entry={entry} />)}
      <ClosingPage data={data} />
    </Document>
  );
}
