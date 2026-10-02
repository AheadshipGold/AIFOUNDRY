import { palette } from "@aifoundry/design-system";
// Compatibility adapter: one approved palette, no independent legacy theme.
export const colors = {
  light: {
    background: palette.light.canvas,
    text: palette.light.text,
    primary: palette.light.action,
  },
  dark: {
    background: palette.dark.canvas,
    text: palette.dark.text,
    primary: palette.dark.action,
  },
};
