export const lightTheme = {
  colors: {
    background: '#f4f7fb',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    text: '#132033',
    muted: '#5c6b82',
    primary: '#3b82f6',
    primarySoft: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(19, 32, 51, 0.10)',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    overlay: 'rgba(15, 23, 42, 0.45)',
  },
  radius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
  },
  shadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
  container: '1440px',
  headerBackground: 'rgba(255, 255, 255, 0.82)',
};

export const darkTheme = {
  colors: {
    background: '#0b1020',
    surface: '#121a2f',
    surfaceAlt: '#18213b',
    text: '#f3f5fb',
    muted: '#97a3c6',
    primary: '#5b8cff',
    primarySoft: 'rgba(91, 140, 255, 0.18)',
    border: 'rgba(255,255,255,0.08)',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    overlay: 'rgba(2, 6, 23, 0.72)',
  },
  radius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
  },
  shadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
  container: '1440px',
  headerBackground: 'rgba(11, 16, 32, 0.72)',
};

export type AppTheme = typeof lightTheme;
