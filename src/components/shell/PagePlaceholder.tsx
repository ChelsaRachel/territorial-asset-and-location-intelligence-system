"use client";

import { useActiveProfile } from "@/lib/store/useActiveProfile";

interface PagePlaceholderProps {
  pageName: string;
  sprint: "SPRINT-02" | "SPRINT-03" | "SPRINT-04" | "SPRINT-05" | "SPRINT-06" | "SPRINT-07";
  description?: string;
}

export function PagePlaceholder({ pageName, sprint, description }: PagePlaceholderProps) {
  const profile = useActiveProfile();

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[720px] bg-white border border-talis-stone-200 rounded-lg p-8">
        <h1 className="font-display text-2xl text-talis-green-900 mb-1">{pageName}</h1>
        {description && <p className="font-sans text-sm text-talis-stone-700 mb-4">{description}</p>}
        <p className="font-sans text-sm text-talis-stone-700 mb-6">
          Page implementation lands in{" "}
          <span className="font-mono text-talis-green-700">{sprint}</span>.
        </p>

        <div className="border-t border-talis-stone-200 pt-4">
          <p className="font-sans text-xs text-talis-stone-700 uppercase tracking-wide mb-2">
            Profil Aktif
          </p>
          {profile ? (
            <div className="space-y-1">
              <p className="font-sans text-base text-talis-stone-900">{profile.nama}</p>
              <p className="font-sans text-sm text-talis-stone-700">
                {profile.kabupaten}, {profile.provinsi}
              </p>
              <p className="font-mono text-xs text-talis-stone-700">
                kode: {profile.profil_kode} · id: {profile.wilayah_id}
              </p>
            </div>
          ) : (
            <p className="font-sans text-sm text-talis-stone-700 italic">Memuat profil aktif…</p>
          )}
        </div>
      </div>
    </div>
  );
}
