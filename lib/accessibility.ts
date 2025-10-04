// Color contrast utility functions
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Apply gamma correction
    const mapped = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    ) as number[];
    const [rGamma = 0, gGamma = 0, bGamma = 0] = mapped;

    // Calculate relative luminance
    return 0.2126 * rGamma + 0.7152 * gGamma + 0.0722 * bGamma;
  };

  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const isAccessibleContrast = (
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA"
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return level === "AA" ? ratio >= 4.5 : ratio >= 7;
};

export const getAccessibleColor = (
  baseColor: string,
  background: string,
  level: "AA" | "AAA" = "AA"
): string => {
  // This is a simplified version - in practice, you'd want more sophisticated color manipulation
  const isDark = getContrastRatio(baseColor, background) < 4.5;
  return isDark ? "#000000" : "#FFFFFF";
};

// Common accessible color combinations
export const accessibleColors = {
  primary: {
    light: "#1a365d", // Dark blue for light backgrounds
    dark: "#90cdf4", // Light blue for dark backgrounds
  },
  secondary: {
    light: "#2d3748", // Dark gray for light backgrounds
    dark: "#e2e8f0", // Light gray for dark backgrounds
  },
  success: {
    light: "#22543d", // Dark green for light backgrounds
    dark: "#9ae6b4", // Light green for dark backgrounds
  },
  error: {
    light: "#742a2a", // Dark red for light backgrounds
    dark: "#feb2b2", // Light red for dark backgrounds
  },
  warning: {
    light: "#744210", // Dark yellow for light backgrounds
    dark: "#faf089", // Light yellow for dark backgrounds
  },
};

export default {
  getContrastRatio,
  isAccessibleContrast,
  getAccessibleColor,
  accessibleColors,
};
