import { SectionInfo } from "@/components/ui/SectionInfo";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";
import { KpiCard } from "@/components/ui/KpiCard";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTimestamp } from "@/components/ui/DataTimestamp";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

// Sample timestamps relative to 2026-05-08
const TS_2H_AGO = "2026-05-07T22:00:00+07:00";
const TS_2D_AGO = "2026-05-06T10:00:00+07:00";
const TS_2W_AGO = "2026-04-24T10:00:00+07:00";
const TS_3M_AGO = "2026-02-08T10:00:00+07:00";

export default function StyleguidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div>
        <h1 className="font-display text-3xl text-talis-green-900 mb-1">TALIS Design System Primitives</h1>
        <p className="font-sans text-sm text-talis-stone-700">
          Developer-only entry point — <code className="font-mono text-xs">/__styleguide</code>.
          Visual contract for all ten SPRINT-01 primitives.
        </p>
      </div>

      {/* TooltipWrapper */}
      <section>
        <SectionInfo
          title="TooltipWrapper"
          description="Wraps any child to show a tooltip on hover/focus. Uses Radix UI Tooltip. — docs/00_OVERVIEW.md §5.4"
        />
        <div className="flex items-center gap-6 flex-wrap">
          <TooltipWrapper content="Tooltip muncul di atas" side="top">
            <button className="font-sans text-sm border border-talis-stone-700/40 rounded px-3 py-1.5">
              Hover (top)
            </button>
          </TooltipWrapper>
          <TooltipWrapper content="Tooltip muncul di bawah" side="bottom">
            <button className="font-sans text-sm border border-talis-stone-700/40 rounded px-3 py-1.5">
              Hover (bottom)
            </button>
          </TooltipWrapper>
          <TooltipWrapper content="Kec. Berastagi · Kab. Karo · Sumatera Utara · AGRO_HOSP" side="right">
            <button className="font-sans text-sm border border-talis-stone-700/40 rounded px-3 py-1.5">
              Hover (right — full identity)
            </button>
          </TooltipWrapper>
        </div>
      </section>

      {/* SectionInfo */}
      <section>
        <SectionInfo
          title="SectionInfo"
          description="Section header with optional timestamp, tooltip, icon. Used at the top of every page section. — docs/00_OVERVIEW.md §5.4"
        />
        <div className="space-y-4 border border-talis-stone-200 rounded-lg p-4">
          <SectionInfo title="Tanpa deskripsi" />
          <SectionInfo
            title="Dengan deskripsi"
            description="Menampilkan ringkasan indikator kunci wilayah berdasarkan data RDTR dan BPS terkini."
          />
          <SectionInfo
            title="Dengan timestamp"
            description="Data diperbarui secara berkala."
            lastUpdated={TS_2H_AGO}
          />
          <SectionInfo
            title="Dengan tooltip"
            description="Skor lokasi gabungan tertimbang dari 8 indikator SPRINT-05."
            tooltip="Skor = rata-rata tertimbang dari A.1–A.8 per formula docs/04_INTELLIGENCE.md §3.3"
          />
        </div>
      </section>

      {/* KpiCard */}
      <section>
        <SectionInfo
          title="KpiCard"
          description="Hero KPI dengan label, nilai numerik, unit, dan indikator tren. — Berastagi (docs/02_TERRITORY_PROFILE.md §4.2)"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Luas" value="30,5" unit="km²" />
          <KpiCard label="Penduduk" value={43214} unit="jiwa" />
          <KpiCard label="PDRB/kapita" value="Rp 38 jt" tone="positive" trend={{ direction: "up", deltaPct: 4.2 }} />
          <KpiCard label="Median Harga Lahan" value="Rp 420.000" unit="/m²" tone="default" trend={{ direction: "up", deltaPct: 15.4 }} />
          <KpiCard label="Infrastructure Index" value={75.6} tone="default" trend={{ direction: "flat", deltaPct: 0 }} />
          <KpiCard label="Contoh Negatif" value={32} unit="poin" tone="negative" trend={{ direction: "down", deltaPct: -8.1 }} />
        </div>
      </section>

      {/* ScoreBadge */}
      <section>
        <SectionInfo
          title="ScoreBadge"
          description="Skor 0–100 dengan warna verdict otomatis. Batas: hijau ≥70, amber 40–69, merah <40."
        />
        <div className="flex items-end gap-6 flex-wrap">
          <ScoreBadge value={85} size="xl" label="85 — Hijau (xl)" />
          <ScoreBadge value={70} size="lg" label="70 — Batas hijau (lg)" />
          <ScoreBadge value={69} size="md" label="69 — Amber (md)" />
          <ScoreBadge value={40} size="md" label="40 — Batas amber (md)" />
          <ScoreBadge value={39} size="sm" label="39 — Merah (sm)" />
          <ScoreBadge value={25} size="sm" label="25 — Merah (sm)" />
          <ScoreBadge value={82} size="lg" label="A.1 Berastagi" capped />
        </div>
      </section>

      {/* ProgressBar */}
      <section>
        <SectionInfo
          title="ProgressBar"
          description="Bar horizontal 0–100 dengan warna verdict. Digunakan Quick Scan sinyal kunci. — docs/01_COMMAND_CENTER.md §2.3"
        />
        <div className="space-y-3 max-w-md">
          <ProgressBar value={82} label="Kesesuaian Lahan (A.1)" showValue />
          <ProgressBar value={75.6} label="Indeks Infrastruktur (A.2)" showValue />
          <ProgressBar value={64} label="Akses Pasar (A.4)" showValue />
          <ProgressBar value={40} label="Batas amber" showValue />
          <ProgressBar value={39} label="Batas merah" showValue />
          <ProgressBar value={25} label="Skor rendah" showValue />
        </div>
      </section>

      {/* StatusPill */}
      <section>
        <SectionInfo
          title="StatusPill"
          description="Pill berwarna untuk flag regulasi, urgensi, verdict, severity, spekulasi, pipeline."
        />
        <div className="space-y-3">
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2 uppercase tracking-wide">Regulatory</p>
            <div className="flex gap-2 flex-wrap">
              <StatusPill variant="regulatory" value="BEBAS_INVESTASI" />
              <StatusPill variant="regulatory" value="KONFLIK_REGULASI" />
              <StatusPill variant="regulatory" value="KAWASAN_LINDUNG" />
              <StatusPill variant="regulatory" value="MORATORIUM" />
            </div>
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2 uppercase tracking-wide">Urgency</p>
            <div className="flex gap-2 flex-wrap">
              <StatusPill variant="urgency" value="SEGERA" />
              <StatusPill variant="urgency" value="TERBUKA" />
              <StatusPill variant="urgency" value="JANGKA_PANJANG" />
            </div>
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2 uppercase tracking-wide">Verdict</p>
            <div className="flex gap-2 flex-wrap">
              <StatusPill variant="verdict" value="LAYAK" />
              <StatusPill variant="verdict" value="LAYAK_BERSYARAT" />
              <StatusPill variant="verdict" value="TIDAK_LAYAK" />
            </div>
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2 uppercase tracking-wide">Severity</p>
            <div className="flex gap-2 flex-wrap">
              <StatusPill variant="severity" value="KRITIS" />
              <StatusPill variant="severity" value="TINGGI" />
              <StatusPill variant="severity" value="SEDANG" />
            </div>
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2 uppercase tracking-wide">Spekulasi Lahan</p>
            <div className="flex gap-2 flex-wrap">
              <StatusPill variant="speculation" value="sehat" />
              <StatusPill variant="speculation" value="waspada" />
              <StatusPill variant="speculation" value="spekulatif" />
            </div>
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2 uppercase tracking-wide">Pipeline</p>
            <div className="flex gap-2 flex-wrap">
              <StatusPill variant="pipeline" value="operasional" />
              <StatusPill variant="pipeline" value="izin_diterbitkan" />
              <StatusPill variant="pipeline" value="dalam_proses" />
              <StatusPill variant="pipeline" value="tertahan" />
            </div>
          </div>
        </div>
      </section>

      {/* DataTimestamp */}
      <section>
        <SectionInfo
          title="DataTimestamp"
          description="Widget 'data per [tanggal]' wajib per docs/00_OVERVIEW.md §8."
        />
        <div className="space-y-2">
          <DataTimestamp timestamp={TS_2H_AGO} />
          <DataTimestamp timestamp={TS_2D_AGO} />
          <DataTimestamp timestamp={TS_2W_AGO} />
          <DataTimestamp timestamp={TS_3M_AGO} />
          <DataTimestamp timestamp={TS_2D_AGO} format="absolute" label="Data per" />
        </div>
      </section>

      {/* EmptyState */}
      <section>
        <SectionInfo
          title="EmptyState"
          description="Placeholder untuk dataset kosong. Tanpa tombol retry."
        />
        <div className="space-y-4 border border-talis-stone-200 rounded-lg divide-y divide-talis-stone-200">
          <EmptyState
            title="Tidak ada wilayah memenuhi kriteria."
            description="Longgarkan filter atau coba mode lain."
          />
          <EmptyState
            title="Belum ada wilayah dalam shortlist."
            description="Tambahkan wilayah dari hasil pencarian untuk membandingkan."
          />
        </div>
      </section>

      {/* LoadingSkeleton */}
      <section>
        <SectionInfo
          title="LoadingSkeleton"
          description="Shimmer CSS-only untuk semua shape loading state."
        />
        <div className="space-y-4 max-w-md">
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2">text (count=3)</p>
            <LoadingSkeleton shape="text" count={3} />
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2">card</p>
            <LoadingSkeleton shape="card" />
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2">chart</p>
            <LoadingSkeleton shape="chart" />
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2">table-row (count=4)</p>
            <LoadingSkeleton shape="table-row" count={4} />
          </div>
          <div>
            <p className="font-sans text-xs text-talis-stone-700 mb-2">circle (count=3)</p>
            <LoadingSkeleton shape="circle" count={3} />
          </div>
        </div>
      </section>

      {/* ErrorState */}
      <section>
        <SectionInfo
          title="ErrorState"
          description="Kartu error dengan tombol 'Coba lagi' opsional."
        />
        <div className="space-y-4 max-w-md">
          <ErrorState />
          <ErrorState
            title="Gagal memuat data wilayah"
            description="Koneksi ke server terputus. Periksa jaringan Anda."
            onRetry={() => {}}
          />
          <ErrorState
            title="Skor tidak tersedia"
            description="Data SPRINT-05 belum tersedia untuk wilayah ini."
          />
        </div>
      </section>
    </div>
  );
}
