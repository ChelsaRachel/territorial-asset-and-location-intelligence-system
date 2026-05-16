import type { MarketAccessDestinationWithRoute } from "@/lib/types/territory";
import { formatCostPerTon, tipeTujuanLabel } from "./marketAccessFormat";

const KONDISI_JALAN_NOTES: Partial<Record<string, string>> = {
  tol: "Akses tol penuh; waktu tempuh lebih konsisten dan relatif bebas hambatan.",
  tol_parsial:
    "Sebagian rute melewati tol; sisa melalui arteri konvensional — waktu tempuh dapat bervariasi.",
  aspal_baik: "Kondisi aspal baik dan relatif datar; dapat dilalui semua jenis truk angkutan.",
  aspal_berbukit:
    "Jalan aspal dengan tanjakan dan tikungan; truk bermuatan besar perlu extra waktu dan pengecekan rem.",
  aspal_perkotaan:
    "Jalur aspal dalam kawasan perkotaan; rentan kemacetan pada jam sibuk pagi dan sore.",
  aspal_kabupaten:
    "Jalan aspal kabupaten; kondisi bervariasi tergantung intensitas pemeliharaan lokal.",
  aspal_rusak:
    "Permukaan aspal bergelombang atau berlubang; disarankan truk ringan dan kecepatan tereduksi.",
  tanah: "Jalan tanah; rentan tidak dapat dilalui saat musim hujan — gunakan kendaraan 4WD.",
};

interface MarketAccessExpandedRowProps {
  destination: MarketAccessDestinationWithRoute;
}

export function MarketAccessExpandedRow({ destination }: MarketAccessExpandedRowProps) {
  const kondisiNote = KONDISI_JALAN_NOTES[destination.kondisi_jalan];

  return (
    <div className="border-t border-talis-stone-100 bg-talis-stone-50 px-4 py-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-wide text-talis-stone-700">
            Tipe tujuan
          </p>
          <p className="mt-1 font-sans text-sm text-talis-stone-900">
            {tipeTujuanLabel(destination.tipe)}
          </p>
        </div>

        <div>
          <p className="font-sans text-[11px] uppercase tracking-wide text-talis-stone-700">
            Kondisi jalan
          </p>
          <p className="mt-1 font-sans text-sm font-medium text-talis-stone-900">
            {destination.kondisi_jalan_label}
          </p>
          {kondisiNote && (
            <p className="mt-1 font-sans text-xs leading-5 text-talis-stone-700">{kondisiNote}</p>
          )}
        </div>

        {destination.cost_per_ton_rp !== null && (
          <div>
            <p className="font-sans text-[11px] uppercase tracking-wide text-talis-stone-700">
              Estimasi biaya logistik
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-talis-stone-900">
              {formatCostPerTon(destination.cost_per_ton_rp)}
            </p>
            <p className="mt-0.5 font-sans text-[11px] text-talis-stone-700">
              Perkiraan biaya angkutan truk medium per ton
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
