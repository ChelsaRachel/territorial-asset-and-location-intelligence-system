export const exportTheme = {
  colors: {
    green900: "#173B2F",
    green800: "#245340",
    green700: "#2F6B4F",
    green100: "#D8F3DC",
    stone50: "#FAFAF9",
    stone100: "#F5F5F4",
    stone200: "#E7E5E4",
    stone500: "#78716C",
    stone700: "#44403C",
    stone900: "#1C1917",
    amber100: "#FEF3C7",
    amber700: "#B45309",
    red100: "#FECACA",
    red700: "#B91C1C",
    blue100: "#DBEAFE",
    blue700: "#1D4ED8",
    white: "#FFFFFF",
  },
  fonts: {
    sans: "Helvetica",
    mono: "Courier",
  },
};

export function hexForXlsx(hex: string): string {
  return hex.replace("#", "").toUpperCase();
}
