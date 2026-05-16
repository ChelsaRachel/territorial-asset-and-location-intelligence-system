import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { GlobalRealtimeLayer } from "@/components/realtime/GlobalRealtimeLayer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <header className="fixed top-0 left-[var(--talis-sidebar-width)] right-0 z-40 h-[var(--talis-header-height)] border-b border-talis-stone-700/15 bg-talis-stone-50 px-6">
        <AppHeader />
      </header>
      <main className="ml-[var(--talis-sidebar-width)] min-h-screen p-6 pt-[var(--talis-header-height)]">
        {children}
      </main>
      <GlobalRealtimeLayer />
    </>
  );
}
