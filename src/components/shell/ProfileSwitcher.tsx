"use client";

import { useActiveProfileStore } from "@/lib/store/activeProfile";
import { useActiveProfileActions } from "@/lib/store/useActiveProfile";
import { profileToSlug } from "@/lib/store/profileSlug";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";

export function ProfileSwitcher() {
  const availableProfiles = useActiveProfileStore((s) => s.availableProfiles);
  const activeProfile = useActiveProfileStore((s) => s.activeProfile);
  const { setActiveProfile } = useActiveProfileActions();

  if (availableProfiles.length === 0) {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-talis-stone-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {availableProfiles.map((profile) => {
        const isActive = activeProfile?.wilayah_id === profile.wilayah_id;
        const slug = profileToSlug(profile);
        const label = profile.nama.replace(/^(Kec|Kel)\.\s+/, "");
        const tooltip = `${profile.nama} · ${profile.kabupaten} · ${profile.provinsi} · ${profile.profil_kode}`;

        return (
          <TooltipWrapper key={profile.wilayah_id} content={tooltip} side="bottom">
            <button
              onClick={() => !isActive && setActiveProfile(slug)}
              aria-pressed={isActive}
              className={[
                "h-8 px-4 rounded-full font-sans text-sm font-medium transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700",
                isActive
                  ? "bg-talis-green-700 text-talis-stone-50"
                  : "border border-talis-stone-700/40 text-talis-stone-700 hover:bg-talis-green-700/10",
              ].join(" ")}
            >
              {label}
            </button>
          </TooltipWrapper>
        );
      })}
    </div>
  );
}
