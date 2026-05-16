import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-verdict-success",
    "bg-verdict-warning",
    "bg-verdict-danger",
    "text-verdict-success",
    "text-verdict-warning",
    "text-verdict-danger",
    "border-verdict-success",
    "border-verdict-warning",
    "border-verdict-danger",
    // Severity pill classes (dynamic — always included regardless of build purging)
    "bg-red-50",
    "bg-red-100",
    "text-red-700",
    "text-red-800",
    "border-red-200",
    "border-red-300",
    "bg-amber-50",
    "bg-amber-100",
    "text-amber-700",
    "text-amber-800",
    "border-amber-200",
    "border-amber-300",
    "bg-green-50",
    "bg-green-100",
    "text-green-700",
    "text-green-800",
    "border-green-300",
    // Severity card border/rail classes
    "border-red-200",
    "border-l-red-500",
    "border-amber-200",
    "border-l-amber-500",
    "border-talis-green-700",
    "border-l-talis-green-700",
    "border-talis-red-700",
    "border-l-talis-red-700",
    "border-talis-amber",
    "border-l-talis-amber",
  ],
  theme: {
    extend: {
      colors: {
        // TALIS primary palette — docs/00_OVERVIEW.md §5.4
        "talis-green-900": "#1B4332",
        "talis-green-800": "#2D6A4F",
        "talis-green-700": "#40916C",
        "talis-green-600": "#52B788",
        // Accent
        "talis-earth-700": "#6B4226",
        "talis-amber": "#B45309",
        "talis-blue": "#1E40AF",
        // Neutrals
        "talis-stone-900": "#292524",
        "talis-stone-700": "#57534E",
        "talis-stone-200": "#E7E5E4",
        "talis-stone-50": "#FAFAF9",
        // Red for danger/TIDAK_LAYAK/MORATORIUM — #B42318 (Tailwind red-700-ish, unlisted in palette docs)
        "talis-red-700": "#B42318",
        // Semantic verdict aliases
        verdict: {
          success: "#40916C", // talis-green-700
          warning: "#B45309", // talis-amber
          danger: "#B42318", // talis-red-700
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // KPI numerics 32–40px per SPRINT.md §"UI / UX Expectations"
        kpi: ["2.5rem", { lineHeight: "2.75rem", fontWeight: "600" }],
        // Score badge 24px
        score: ["1.5rem", { lineHeight: "1.75rem", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};

export default config;
