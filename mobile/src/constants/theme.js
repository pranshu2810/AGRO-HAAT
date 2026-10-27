export const COLORS = {
  // Brand Emerald & Deep Forest
  primary: '#22c55e',
  primaryDark: '#0f3822',
  primaryDeep: '#081c10',
  primaryLight: '#4ade80',
  accent: '#10b981',

  // Customer Blue
  customerBlue: '#0284c7',
  customerLightBlue: '#38bdf8',

  // UI Accents
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  cyan: '#06b6d4',

  // Dark glass theme
  bgDark: '#06140b',
  bgCard: 'rgba(12, 34, 21, 0.72)',
  bgGlass: 'rgba(255, 255, 255, 0.08)',
  bgGlassHeavy: 'rgba(255, 255, 255, 0.14)',

  // Borders
  borderGlass: 'rgba(255, 255, 255, 0.22)',
  borderActive: 'rgba(74, 222, 128, 0.55)',

  // Text
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.75)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  radiusSm: 10,
  radiusMd: 16,
  radiusLg: 22,
  radiusFull: 9999,
};

export const THEME = {
  colors: {
    primary: COLORS.primary,
    emerald: '#10b981',
    bgDark: COLORS.bgDark,
    bgCard: COLORS.bgCard,
    textLight: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.65)',
    borderGlass: COLORS.borderGlass,
    customerBlue: COLORS.customerBlue,
    customerLightBlue: COLORS.customerLightBlue,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 28,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
  },
};

export default THEME;
