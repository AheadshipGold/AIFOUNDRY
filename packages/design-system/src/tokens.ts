export const palette = {
  light: {
    canvas: "#FAF9F6", // Ivoire Soyeux
    surface: "#FFFFFF",
    subtle: "#F4F0EA", // Pierre douce
    elevated: "#FFFFFF",
    text: "#151E1C",
    muted: "#717882", // Gris Minéral
    border: "#E7E1D9", // Pierre
    action: "#0D4A38", // Vert Émeraude Profond Luxury
    onAction: "#FFFFFF",
    accent: "#D4B483", // Or Champagne
    focus: "#0D4A38",
    successBg: "#ECFDF5", // Menthe Aide IA
    successFg: "#065F46",
    pendingBg: "#FFFBEB",
    pendingFg: "#B45309",
    errorBg: "#FEF2F2",
    errorFg: "#B91C1C",
    overlay: "rgba(11,20,26,0.64)",
    gold: "#D4B483",
    goldBg: "rgba(212, 180, 131, 0.15)",
  },
  dark: {
    canvas: "#081018", // Bleu Nuit Profond
    surface: "#111C1A", // Graphite Émeraude
    subtle: "#182624", // Gris Ardoise
    elevated: "#1D2E2B",
    text: "#F5F7F3",
    muted: "#94A3B8", // Gris Minéral Clair
    border: "#233834",
    action: "#10B981", // Vert Profond Interactif
    onAction: "#081018",
    accent: "#D4B483", // Or Champagne
    focus: "#10B981",
    successBg: "#06241D",
    successFg: "#6EE7B7",
    pendingBg: "#3B2710",
    pendingFg: "#FDE68A",
    errorBg: "#451218",
    errorFg: "#FCA5A5",
    overlay: "rgba(8,16,24,0.85)",
    gold: "#D4B483",
    goldBg: "rgba(212, 180, 131, 0.18)",
  },
} as const;
export type Theme = keyof typeof palette;
export type ThemeMode = Theme | "system";
export type Locale = "fr" | "en";
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
  page: 40,
} as const;
export const radii = { field: 14, card: 18, section: 24, pill: 999 } as const;
export const typography = {
  display: [36, 40],
  h1: [28, 34],
  h2: [23, 29],
  h3: [19, 25],
  body: [16, 24],
  secondary: [14, 21],
  caption: [12, 17],
  button: [15, 20],
  price: [23, 28],
} as const;
export const motion = {
  fast: 120,
  normal: 180,
  slow: 240,
  reduced: 0,
} as const;
export const borders = { normal: 1, focus: 2 } as const;
export const elevation = { flat: 0, card: 1, overlay: 8 } as const;
export const layout = {
  touch: 48,
  compact: 360,
  wide: 768,
  content: 1200,
} as const;
export const iconRules = {
  size: 20,
  large: 24,
  stroke: 1.75,
  labelled: true,
} as const;
