import { formatRupiahShort } from "@/lib/format";

interface Props {
  amount: number;
}

export function CostOfDelayCard({ amount }: Props) {
  return (
    <div
      className="rounded-lg border border-talis-amber/40 bg-talis-amber/5 p-4"
      data-testid="cost-of-delay-card"
    >
      <p className="font-sans text-xs uppercase tracking-wide text-talis-earth-700">
        Cost of Delay
      </p>
      <p className="mt-1 font-mono text-3xl font-bold text-talis-earth-700">
        {formatRupiahShort(amount)}
      </p>
      <p className="mt-0.5 font-sans text-xs text-talis-stone-700">per bulan per hektar</p>
      <p className="mt-2 font-sans text-xs text-talis-stone-600">
        Nilai apresiasi yang terlewat jika entry tertunda setiap bulannya.
      </p>
    </div>
  );
}
