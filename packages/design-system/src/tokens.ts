export const palette = {
  light: {
    canvas: "#FAF9F6",
    surface: "#FFFFFF",
    subtle: "#F2F0EA",
    elevated: "#FFFFFF",
    text: "#151E1C",
    muted: "#5B6661",
    border: "#DFE4DE",
    action: "#075D49",
    onAction: "#FFFFFF",
    accent: "#AD8455",
    focus: "#075D49",
    successBg: "#E6F4EE",
    successFg: "#185F46",
    pendingBg: "#FFF3DF",
    pendingFg: "#7A4A12",
    errorBg: "#FFF1F2",
    errorFg: "#B42C3E",
    overlay: "rgba(11,20,26,0.64)",
  },
  dark: {
    canvas: "#0B141A",
    surface: "#132129",
    subtle: "#1B2D34",
    elevated: "#22343B",
    text: "#F5F7F3",
    muted: "#BBC9C3",
    border: "#34464C",
    action: "#63DBB6",
    onAction: "#0B141A",
    accent: "#D3B98E",
    focus: "#63DBB6",
    successBg: "#163D33",
    successFg: "#9BE9C5",
    pendingBg: "#42311D",
    pendingFg: "#F0D3A4",
    errorBg: "#46242B",
    errorFg: "#FFB7C3",
    overlay: "rgba(11,20,26,0.80)",
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
