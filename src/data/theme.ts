/** Tasarım sistemi — CSS değişkenleri ile senkron tutulur (index.css). */
export const theme = {
  colors: {
    bg: '#FDF8EE',
    surface: '#FFFFFF',
    ink: '#3D3A35',
    inkSoft: '#7A756B',
    primary: '#6CC08B',
    primaryDark: '#4FA06E',
    accent: '#F4A259',
    sky: '#CDE7F7',
    success: '#6CC08B',
    gentle: '#F2C879',
    focusRing: '#5DA9E9',
  },
  radii: {
    card: '24px',
    button: '999px',
  },
  shadow: '0 6px 0 rgba(0, 0, 0, 0.06)',
  touchMin: 72,
  therapistTouchMin: 44,
  motionMs: { min: 200, max: 400 },
  fonts: {
    body: '"Nunito", system-ui, sans-serif',
    display: '"Baloo 2", system-ui, sans-serif',
  },
  letterSpacing: '0.02em',
  defaultVolume: 0.6,
} as const;

export type Theme = typeof theme;
