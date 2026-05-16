"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDiscoveryActions,
  useDiscoveryMode1Query,
  useDiscoverySearchMode,
  useDiscoverySearchResults,
  useDiscoverySearchStatus,
  type SearchResultRow as SearchResultRowType,
} from "@/lib/store/useDiscovery";
import { useActiveProfileActions } from "@/lib/store/useActiveProfile";
import { slugify } from "@/lib/store/profileSlug";
import type { MapSelectionTarget } from "./MapSelectionController";
import { SearchResultRow } from "./SearchResultRow";

interface LocationSearchProps {
  onSelectLocation(target: MapSelectionTarget): void;
}

export function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const mode = useDiscoverySearchMode();
  const query = useDiscoveryMode1Query();
  const results = useDiscoverySearchResults();
  const status = useDiscoverySearchStatus();
  const { setMode1Query, setSearchMode, runSearch, openPanel } = useDiscoveryActions();
  const { setActiveProfile } = useActiveProfileActions();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const visibleResults = mode === "location" && query.trim() ? results.slice(0, 8) : [];

  useEffect(() => {
    if (mode !== "location" || !query.trim()) return;
    const timer = window.setTimeout(() => {
      void runSearch();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [mode, query, runSearch]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchMode("location");
        setDropdownOpen(true);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchMode]);

  const selectResult = useCallback(
    (result: SearchResultRowType) => {
      setDropdownOpen(false);
      setMode1Query(result.nama);
      onSelectLocation({
        wilayahId: result.wilayah_id,
        lat: result.lat,
        lng: result.lng,
        zoom: 11,
        source: "location",
        result,
      });

      if (result.profil_kode) {
        setActiveProfile(slugify(result.nama));
        openPanel(result.wilayah_id, result.profil_kode);
      } else {
        openPanel(result.wilayah_id);
      }
    },
    [onSelectLocation, openPanel, setActiveProfile, setMode1Query]
  );

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen && event.key !== "Escape") {
      setDropdownOpen(true);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (visibleResults.length === 0) return;
      setHighlightedIndex((index) => (index + 1) % visibleResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (visibleResults.length === 0) return;
      setHighlightedIndex((index) => (index - 1 + visibleResults.length) % visibleResults.length);
    } else if (event.key === "Enter") {
      if (visibleResults[highlightedIndex]) {
        event.preventDefault();
        selectResult(visibleResults[highlightedIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Cari wilayah..."
        autoComplete="off"
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => window.setTimeout(() => setDropdownOpen(false), 90)}
        onChange={(event) => {
          setMode1Query(event.target.value);
          setDropdownOpen(true);
        }}
        onKeyDown={handleInputKeyDown}
        className="h-10 w-full rounded-md border border-talis-stone-700/20 bg-white px-3 font-sans text-sm text-talis-stone-900 shadow-sm outline-none transition focus:border-talis-green-700 focus:ring-2 focus:ring-talis-green-700/20"
      />

      {dropdownOpen && query.trim() && (
        <div
          role="listbox"
          aria-label="Hasil pencarian wilayah"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[280px] overflow-y-auto rounded-md border border-talis-stone-700/15 bg-white py-1 shadow-xl"
        >
          {status === "loading" && visibleResults.length === 0 && (
            <div className="px-3 py-2.5 font-sans text-sm text-talis-stone-700">
              Mencari wilayah...
            </div>
          )}

          {status === "empty" && visibleResults.length === 0 && (
            <div className="px-3 py-2.5 font-sans text-sm text-talis-stone-700">
              Wilayah tidak ditemukan.
            </div>
          )}

          {visibleResults.map((result, index) => (
            <SearchResultRow
              key={result.wilayah_id}
              result={result}
              highlighted={index === highlightedIndex}
              onSelect={selectResult}
            />
          ))}
        </div>
      )}
    </div>
  );
}
