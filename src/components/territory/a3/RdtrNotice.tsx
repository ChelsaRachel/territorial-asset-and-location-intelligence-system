interface RdtrNoticeProps {
  rdtrAvailable: boolean;
}

export function RdtrNotice({ rdtrAvailable }: RdtrNoticeProps) {
  if (rdtrAvailable) return null;

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 px-3 py-2">
      <p className="font-sans text-xs leading-5 text-talis-stone-700">
        RDTR digital belum tersedia — TALIS menggunakan proxy RTRW provinsi. Akurasi terbatas.
      </p>
    </div>
  );
}
