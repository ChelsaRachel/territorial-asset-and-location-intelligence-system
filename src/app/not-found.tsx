import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center pt-12">
      <div className="w-full max-w-[720px] bg-white border border-talis-stone-200 rounded-lg p-8">
        <h1 className="font-display text-2xl text-talis-stone-900 mb-2">Halaman tidak ditemukan</h1>
        <p className="font-sans text-sm text-talis-stone-700 mb-6">
          Halaman yang Anda cari tidak tersedia.
        </p>
        <Link href="/" className="font-sans text-sm text-talis-green-700 hover:underline">
          ← Kembali ke Command Center
        </Link>
      </div>
    </div>
  );
}
