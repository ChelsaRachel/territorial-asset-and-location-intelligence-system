'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { TalisMapboxPopup } from '@/components/maps/TalisMapboxPopup';
import {
  useAvailableProfiles,
  useActiveProfile,
  useActiveProfileActions,
} from '@/lib/store/useActiveProfile';
import { useDiscoveryActions } from '@/lib/store/useDiscovery';
import { slugify } from '@/lib/store/profileSlug';
import { apiClient } from '@/lib/api/apiClient';
import type { WilayahProfile } from '@/lib/store/profileSlug';
import type { WilayahScoreAggregate } from '@/lib/types/wilayah';
import { MarkerPopup } from './MarkerPopup';
import { PulsingRing } from './PulsingRing';

const INACTIVE_RADIUS = 14;
const ACTIVE_RADIUS = 18;

export function SampleProfileMarkers() {
  const profiles = useAvailableProfiles();
  const activeProfile = useActiveProfile();
  const { setActiveProfile } = useActiveProfileActions();
  const { openPanel } = useDiscoveryActions();
  const [scores, setScores] = useState<Map<number, WilayahScoreAggregate>>(new Map());
  const [hoveredProfileId, setHoveredProfileId] = useState<number | null>(null);

  // Load scores for all sample profiles once on mount. Scores are static for PoC.
  useEffect(() => {
    if (profiles.length === 0) return;
    const ids = profiles.map((p) => p.wilayah_id);
    apiClient.discovery.getScores(ids)
      .then(({ scores: list }) => {
        setScores(new Map(list.map((s) => [s.wilayah_id, s])));
      })
      .catch((err) => console.error('[SampleProfileMarkers] getScores failed:', err));
  }, [profiles]);

  // Click handler combines two atomic side-effects per TASK-004 contract.
  // If either throws, the other still fires (logged, not swallowed).
  const handleMarkerClick = useCallback(
    (profile: WilayahProfile) => {
      try {
        setActiveProfile(slugify(profile.nama));
      } catch (err) {
        console.error('[SampleProfileMarkers] setActiveProfile failed:', err);
      }
      try {
        openPanel(profile.wilayah_id, profile.profil_kode);
      } catch (err) {
        console.error('[SampleProfileMarkers] openPanel failed:', err);
      }
    },
    [setActiveProfile, openPanel]
  );

  if (profiles.length === 0) return null;

  return (
    <>
      {profiles.map((profile) => {
        const isActive = activeProfile?.wilayah_id === profile.wilayah_id;
        const score = scores.get(profile.wilayah_id);
        const markerSize = isActive ? ACTIVE_RADIUS * 2 : INACTIVE_RADIUS * 2;

        return (
          <Fragment key={profile.wilayah_id}>
            <Marker
              longitude={profile.lng}
              latitude={profile.lat}
              anchor="center"
              style={{ zIndex: isActive ? 35 : 25 }}
            >
              <button
                type="button"
                aria-label={`Buka Quick Scan untuk ${profile.nama}`}
                onClick={() => handleMarkerClick(profile)}
                onMouseEnter={() => setHoveredProfileId(profile.wilayah_id)}
                onMouseLeave={() => setHoveredProfileId(null)}
                onFocus={() => setHoveredProfileId(profile.wilayah_id)}
                onBlur={() => setHoveredProfileId(null)}
                className="block rounded-full border-white shadow-[0_3px_12px_rgba(0,0,0,0.48)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  width: markerSize,
                  height: markerSize,
                  borderWidth: isActive ? 3 : 2,
                  backgroundColor: profile.marker_color,
                  opacity: 0.85,
                }}
              />
            </Marker>
            {hoveredProfileId === profile.wilayah_id && (
              <TalisMapboxPopup
                longitude={profile.lng}
                latitude={profile.lat}
                closeOnClick={false}
                onClose={() => setHoveredProfileId(null)}
              >
                <MarkerPopup
                  profile={profile}
                  locationScore={score?.location_score ?? 0}
                />
              </TalisMapboxPopup>
            )}
          </Fragment>
        );
      })}

      {/* Pulsing ring: rendered only for the active sample profile. */}
      {activeProfile && (
        <PulsingRing position={[activeProfile.lat, activeProfile.lng]} />
      )}

      {/* Offscreen keyboard-accessible button row — a11y fallback.
          This hidden list exposes each marker to the a11y tree
          so screen reader users and keyboard-only users can trigger the same click handler.
          TASK-010 adds an a11y assertion covering this pattern. */}
      <ul className="sr-only" aria-label="Sample profile markers - keyboard navigation">
        {profiles.map((profile) => (
          <li key={profile.wilayah_id}>
            <button
              type="button"
              onClick={() => handleMarkerClick(profile)}
            >
              Buka Quick Scan untuk {profile.nama}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
