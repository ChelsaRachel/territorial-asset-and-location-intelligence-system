'use client';

import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { sektorLabel } from './sektorLabel';
import type { WilayahProfile } from '@/lib/store/profileSlug';

interface MarkerPopupProps {
  profile: WilayahProfile;
  locationScore: number;
}

export function MarkerPopup({ profile, locationScore }: MarkerPopupProps) {
  return (
    <div className="font-sans" style={{ maxWidth: 240, minWidth: 180, padding: 0 }}>
      <h3 className="font-display text-sm font-semibold text-talis-stone-900 mb-1 leading-tight">
        {profile.nama}
      </h3>
      <p className="text-xs text-talis-stone-700 mb-2">
        {profile.kabupaten} · {profile.provinsi}
      </p>
      <p className="text-[13px] text-talis-stone-700 mb-3 leading-snug">
        {profile.karakter_singkat}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-talis-stone-700">Skor Potensi:</span>
        <ScoreBadge value={locationScore} size="sm" />
      </div>
      <div className="flex items-start gap-1 flex-wrap">
        <span className="text-xs text-talis-stone-700 shrink-0">Sektor Unggulan:</span>
        <span className="text-xs font-medium text-talis-stone-900">{sektorLabel(profile.profil_kode)}</span>
      </div>
    </div>
  );
}
