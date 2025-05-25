// Sistema de temas para landing pages

export interface ThemeColors {
  // Background colors (using CSS custom properties)
  background: string;
  backgroundSecondary: string;
  
  // Text colors (CSS color values)
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Accent colors
  primary: string;
  primaryHover: string;
  secondary: string;
  
  // Component colors
  cardBackground: string;
  cardBorder: string;
  buttonBackground: string;
  buttonText: string;
  buttonHover: string;
  
  // Link/Social colors
  linkBackground: string;
  linkBorder: string;
  linkText: string;
  linkHover: string;
}

export interface ThemeTypography {
  // Font families
  fontFamily: string;
  fontFamilyHeading: string;
  
  // Font weights
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  
  // Font sizes
  titleSize: string;
  subtitleSize: string;
  bodySize: string;
  
  // Google Fonts import URL (if needed)
  googleFontsUrl?: string;
}

export interface ThemeLayout {
  // Border radius
  borderRadius: string;
  borderRadiusLarge: string;
  borderRadiusButton: string;
  borderRadiusCard: string;
  borderRadiusAvatar: string; // 'rounded-full' for circular, 'rounded-lg' for square
  
  // Shadows
  shadowCard: string;
  shadowButton: string;
  shadowHover: string;
  
  // Spacing
  containerPadding: string;
  sectionSpacing: string;
  cardPadding: string;
  
  // Link widths
  linkWidthMobile: string;
  linkWidthDesktop: string;
  
  // Image style
  imageStyle: 'square' | 'rounded';
  
  // Other layout properties
  maxWidth: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string; // URL to preview image
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
}

// Temas predefinidos
export const themes: Theme[] = [
  {
    id: 'gradient-purple',
    name: 'Gradient Purple',
    description: 'Degradado negro a morado con diseño compacto',
    preview: '/themes/gradient-purple-preview.jpg',
    colors: {
      background: 'linear-gradient(to bottom, #000000 0%, #4a044d 100%)',
      backgroundSecondary: 'rgba(0, 0, 0, 0.3)',
      textPrimary: '#ffffff',
      textSecondary: '#e2e8f0',
      textMuted: '#94a3b8',
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      secondary: 'rgba(139, 92, 246, 0.1)',
      cardBackground: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      buttonBackground: 'rgba(139, 92, 246, 0.8)',
      buttonText: '#ffffff',
      buttonHover: 'rgba(124, 58, 237, 0.9)',
      linkBackground: '#000000',
      linkBorder: 'rgba(255, 255, 255, 0.2)',
      linkText: '#ffffff',
      linkHover: 'rgba(255, 255, 255, 0.2)'
    },
    typography: {
      fontFamily: 'Inter',
      fontFamilyHeading: 'Inter',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      titleSize: 'text-xl',
      subtitleSize: 'text-base',
      bodySize: 'text-sm',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
    },
    layout: {
      borderRadius: 'rounded-lg',
      borderRadiusLarge: 'rounded-xl',
      borderRadiusButton: 'rounded-lg',
      borderRadiusCard: 'rounded-lg',
      borderRadiusAvatar: 'rounded-full',
      shadowCard: 'shadow-lg shadow-purple-500/20',
      shadowButton: 'shadow-md shadow-purple-500/30',
      shadowHover: 'shadow-xl shadow-purple-500/25',
      containerPadding: 'px-4',
      sectionSpacing: 'space-y-2',
      cardPadding: 'p-3',
      linkWidthMobile: '95%',
      linkWidthDesktop: '30%',
      imageStyle: 'square',
      maxWidth: 'max-w-lg'
    }
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Diseño limpio y minimalista con colores suaves',
    preview: '/themes/minimal-light-preview.jpg',
    colors: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      backgroundSecondary: '#ffffff',
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      primary: '#0f172a',
      primaryHover: '#334155',
      secondary: '#f1f5f9',
      cardBackground: 'rgba(255, 255, 255, 0.8)',
      cardBorder: 'rgba(148, 163, 184, 0.3)',
      buttonBackground: '#0f172a',
      buttonText: '#ffffff',
      buttonHover: '#334155',
      linkBackground: 'rgba(255, 255, 255, 0.9)',
      linkBorder: 'rgba(148, 163, 184, 0.2)',
      linkText: '#1e293b',
      linkHover: 'rgba(255, 255, 255, 1)'
    },
    typography: {
      fontFamily: 'Inter',
      fontFamilyHeading: 'Inter',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      titleSize: 'text-2xl',
      subtitleSize: 'text-lg',
      bodySize: 'text-base',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
    },
    layout: {
      borderRadius: 'rounded-md',
      borderRadiusLarge: 'rounded-lg',
      borderRadiusButton: 'rounded-md',
      borderRadiusCard: 'rounded-lg',
      borderRadiusAvatar: 'rounded-full',
      shadowCard: 'shadow-sm',
      shadowButton: 'shadow-sm',
      shadowHover: 'shadow-md',
      containerPadding: 'px-6',
      sectionSpacing: 'space-y-4',
      cardPadding: 'p-4',
      linkWidthMobile: '100%',
      linkWidthDesktop: '50%',
      imageStyle: 'rounded',
      maxWidth: 'max-w-lg'
    }
  }
];

// Helper functions
export function getThemeById(id: string): Theme | undefined {
  return themes.find(theme => theme.id === id);
}

export function getDefaultTheme(): Theme {
  return themes[0]; // gradient-purple theme as default
}

// CSS variables generator for dynamic theming
export function generateThemeCSS(theme: Theme): string {
  return `
    :root {
      --theme-font-family: ${theme.typography.fontFamily};
      --theme-font-family-heading: ${theme.typography.fontFamilyHeading};
      --theme-font-weight-normal: ${theme.typography.fontWeightNormal};
      --theme-font-weight-medium: ${theme.typography.fontWeightMedium};
      --theme-font-weight-bold: ${theme.typography.fontWeightBold};
    }
  `;
}