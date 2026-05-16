interface Props {
  signals: string[];
}

export function SupportingSignalsList({ signals }: Props) {
  if (signals.length === 0) return null;
  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Sinyal Pendukung
      </p>
      <ul className="space-y-2">
        {signals.map((signal, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-talis-green-700"
              aria-hidden="true"
            />
            <span className="font-sans text-xs text-talis-stone-900">{signal}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
