"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { profileToSlug } from "@/lib/store/profileSlug";
import { useActiveProfile } from "@/lib/store/useActiveProfile";
import { appNavItems, isAppNavItemActive, type AppNavHref } from "./navigation";

function buildProfilePreservingHref(href: AppNavHref, profileSlug: string | null): string {
  if (!profileSlug) return href;
  return `${href}?profile=${encodeURIComponent(profileSlug)}`;
}

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProfile = useActiveProfile();
  const profileSlug = activeProfile ? profileToSlug(activeProfile) : searchParams.get("profile");
  const currentPathname = pathname ?? "/";

  return (
    <aside
      aria-label="Global navigation"
      className="fixed inset-y-0 left-0 z-50 flex w-[192px] flex-col bg-talis-green-900 py-4 shadow-lg"
    >
      {/* Logo mark — centered with left breathing room */}
      <div className="ml-3 mr-auto flex h-10 w-10 items-center justify-center rounded-lg bg-talis-green-800 font-display text-xl font-bold text-talis-stone-50 ring-1 ring-talis-green-600/40">
        <span className="sr-only">TALIS</span>
        <span aria-hidden="true">T</span>
      </div>

      <nav aria-label="Primary pages" className="relative mt-6 flex w-full flex-col gap-1 px-2">
        {appNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isAppNavItemActive(currentPathname, item.href);
          const href = buildProfilePreservingHref(item.href, profileSlug);

          return (
            <Link
              key={item.href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex h-10 items-center gap-2 rounded-md px-2 outline-none transition-colors duration-150 ${
                isActive
                  ? "bg-talis-green-800 text-talis-stone-50"
                  : "text-talis-green-600 hover:bg-talis-green-800/40 hover:text-talis-stone-50 focus-visible:bg-talis-green-800/50 focus-visible:text-talis-stone-50"
              }`}
            >
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute -left-2 h-5 w-0.5 rounded-r-full bg-talis-stone-50"
                />
              ) : null}
              <Icon
                aria-hidden="true"
                className="h-4 w-4 shrink-0"
                strokeWidth={2}
              />
              <span className="truncate font-sans text-xs font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
