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

export interface ThemeBackgroundPattern {
  pattern: string;
  color: string;
  opacity: number;
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
  
  // Background pattern
  backgroundPattern?: ThemeBackgroundPattern;
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
    id: 'dark',
    name: 'Dark',
    description: 'Fondo negro total, links negros con bordes blancos',
    preview: '/themes/dark-preview.jpg',
    colors: {
      background: 'linear-gradient(to bottom, #000000 0%, #000000 100%)',
      backgroundSecondary: 'rgba(0, 0, 0, 0.3)',
      textPrimary: '#ffffff',
      textSecondary: '#ffffff',
      textMuted: '#94a3b8',
      primary: '#ffffff',
      primaryHover: '#e5e5e5',
      secondary: 'rgba(255, 255, 255, 0.1)',
      cardBackground: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      buttonBackground: '#000000',
      buttonText: '#ffffff',
      buttonHover: 'rgba(255, 255, 255, 0.1)',
      linkBackground: '#000000',
      linkBorder: '#ffffff',
      linkText: '#ffffff',
      linkHover: 'rgba(255, 255, 255, 0.1)'
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
      shadowCard: 'shadow-lg',
      shadowButton: 'shadow-md',
      shadowHover: 'shadow-xl',
      containerPadding: 'px-4',
      sectionSpacing: 'space-y-2',
      cardPadding: 'p-3',
      linkWidthMobile: '95%',
      linkWidthDesktop: '30%',
      imageStyle: 'square',
      maxWidth: 'max-w-lg',
      backgroundPattern: {
        pattern: 'grid',
        color: '#ffffff',
        opacity: 0.1
      }
    }
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Tema claro con diseño limpio y minimalista',
    preview: '/themes/light-preview.jpg',
    colors: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      backgroundSecondary: '#ffffff',
      textPrimary: '#000000',
      textSecondary: '#000000',
      textMuted: '#475569',
      primary: '#0f172a',
      primaryHover: '#334155',
      secondary: '#f1f5f9',
      cardBackground: 'rgba(255, 255, 255, 0.8)',
      cardBorder: 'rgba(148, 163, 184, 0.3)',
      buttonBackground: '#0f172a',
      buttonText: '#ffffff',
      buttonHover: '#334155',
      linkBackground: '#ffffff',
      linkBorder: 'rgba(148, 163, 184, 0.2)',
      linkText: '#000000',
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
      maxWidth: 'max-w-lg',
      backgroundPattern: {
        pattern: 'dots',
        color: '#000000',
        opacity: 0.15
      }
    }
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Estilo cyberpunk con neones y efectos brillantes',
    preview: '/themes/neon-cyber-preview.jpg',
    colors: {
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0033 50%, #000000 100%)',
      backgroundSecondary: 'rgba(255, 0, 255, 0.1)',
      textPrimary: '#00ffff',
      textSecondary: '#ff00ff',
      textMuted: '#888888',
      primary: '#00ffff',
      primaryHover: '#33ffff',
      secondary: 'rgba(0, 255, 255, 0.2)',
      cardBackground: 'rgba(0, 0, 0, 0.6)',
      cardBorder: 'rgba(0, 255, 255, 0.5)',
      buttonBackground: 'rgba(255, 0, 255, 0.2)',
      buttonText: '#00ffff',
      buttonHover: 'rgba(255, 0, 255, 0.4)',
      linkBackground: 'rgba(0, 0, 0, 0.8)',
      linkBorder: 'rgba(0, 255, 255, 0.8)',
      linkText: '#00ffff',
      linkHover: 'rgba(0, 255, 255, 0.2)'
    },
    typography: {
      fontFamily: 'Orbitron',
      fontFamilyHeading: 'Orbitron',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      titleSize: 'text-3xl',
      subtitleSize: 'text-lg',
      bodySize: 'text-base',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap'
    },
    layout: {
      borderRadius: 'rounded-lg',
      borderRadiusLarge: 'rounded-xl',
      borderRadiusButton: 'rounded-lg',
      borderRadiusCard: 'rounded-lg',
      borderRadiusAvatar: 'rounded-lg',
      shadowCard: 'shadow-lg shadow-cyan-500/30',
      shadowButton: 'shadow-md shadow-purple-500/40',
      shadowHover: 'shadow-xl shadow-cyan-500/40',
      containerPadding: 'px-4',
      sectionSpacing: 'space-y-4',
      cardPadding: 'p-4',
      linkWidthMobile: '90%',
      linkWidthDesktop: '45%',
      imageStyle: 'rounded',
      maxWidth: 'max-w-lg',
      backgroundPattern: {
        pattern: 'circuit',
        color: '#00ffff',
        opacity: 0.2
      }
    }
  },
  {
    id: 'sunset-dream',
    name: 'Sunset Dream',
    description: 'Colores cálidos de atardecer con tipografía elegante',
    preview: '/themes/sunset-dream-preview.jpg',
    colors: {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      backgroundSecondary: 'rgba(255, 255, 255, 0.2)',
      textPrimary: '#2d1b69',
      textSecondary: '#6b46c1',
      textMuted: '#8b5cf6',
      primary: '#f59e0b',
      primaryHover: '#d97706',
      secondary: 'rgba(245, 158, 11, 0.1)',
      cardBackground: 'rgba(255, 255, 255, 0.3)',
      cardBorder: 'rgba(255, 255, 255, 0.5)',
      buttonBackground: 'rgba(45, 27, 105, 0.1)',
      buttonText: '#2d1b69',
      buttonHover: 'rgba(45, 27, 105, 0.2)',
      linkBackground: 'rgba(255, 255, 255, 0.4)',
      linkBorder: 'rgba(45, 27, 105, 0.3)',
      linkText: '#2d1b69',
      linkHover: 'rgba(255, 255, 255, 0.6)'
    },
    typography: {
      fontFamily: 'Playfair Display',
      fontFamilyHeading: 'Playfair Display',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      titleSize: 'text-3xl',
      subtitleSize: 'text-lg',
      bodySize: 'text-base',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap'
    },
    layout: {
      borderRadius: 'rounded-2xl',
      borderRadiusLarge: 'rounded-3xl',
      borderRadiusButton: 'rounded-2xl',
      borderRadiusCard: 'rounded-2xl',
      borderRadiusAvatar: 'rounded-full',
      shadowCard: 'shadow-lg shadow-orange-200/50',
      shadowButton: 'shadow-md shadow-purple-200/40',
      shadowHover: 'shadow-xl shadow-orange-200/60',
      containerPadding: 'px-6',
      sectionSpacing: 'space-y-5',
      cardPadding: 'p-5',
      linkWidthMobile: '85%',
      linkWidthDesktop: '50%',
      imageStyle: 'rounded',
      maxWidth: 'max-w-xl',
      backgroundPattern: {
        pattern: 'waves',
        color: '#6b46c1',
        opacity: 0.1
      }
    }
  },
  {
    id: 'forest-zen',
    name: 'Forest Zen',
    description: 'Naturaleza minimalista con tonos verdes relajantes',
    preview: '/themes/forest-zen-preview.jpg',
    colors: {
      background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      backgroundSecondary: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#e6fffa',
      textMuted: '#a7f3d0',
      primary: '#10b981',
      primaryHover: '#059669',
      secondary: 'rgba(16, 185, 129, 0.1)',
      cardBackground: 'rgba(255, 255, 255, 0.15)',
      cardBorder: 'rgba(255, 255, 255, 0.25)',
      buttonBackground: 'rgba(255, 255, 255, 0.2)',
      buttonText: '#ffffff',
      buttonHover: 'rgba(255, 255, 255, 0.3)',
      linkBackground: 'rgba(255, 255, 255, 0.1)',
      linkBorder: 'rgba(255, 255, 255, 0.3)',
      linkText: '#ffffff',
      linkHover: 'rgba(255, 255, 255, 0.2)'
    },
    typography: {
      fontFamily: 'Poppins',
      fontFamilyHeading: 'Poppins',
      fontWeightNormal: 300,
      fontWeightMedium: 400,
      fontWeightBold: 600,
      titleSize: 'text-2xl',
      subtitleSize: 'text-lg',
      bodySize: 'text-base',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap'
    },
    layout: {
      borderRadius: 'rounded-xl',
      borderRadiusLarge: 'rounded-2xl',
      borderRadiusButton: 'rounded-full',
      borderRadiusCard: 'rounded-xl',
      borderRadiusAvatar: 'rounded-full',
      shadowCard: 'shadow-lg shadow-green-900/20',
      shadowButton: 'shadow-md shadow-green-700/30',
      shadowHover: 'shadow-xl shadow-green-900/25',
      containerPadding: 'px-4',
      sectionSpacing: 'space-y-4',
      cardPadding: 'p-4',
      linkWidthMobile: '90%',
      linkWidthDesktop: '45%',
      imageStyle: 'rounded',
      maxWidth: 'max-w-lg',
      backgroundPattern: {
        pattern: 'diagonal',
        color: '#10b981',
        opacity: 0.15
      }
    }
  },
  {
    id: 'royal-luxury',
    name: 'Royal Luxury',
    description: 'Elegancia dorada con tipografía serif clásica',
    preview: '/themes/royal-luxury-preview.jpg',
    colors: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      backgroundSecondary: 'rgba(255, 215, 0, 0.1)',
      textPrimary: '#ffd700',
      textSecondary: '#f4f4f5',
      textMuted: '#d4d4d8',
      primary: '#ffd700',
      primaryHover: '#ffed4e',
      secondary: 'rgba(255, 215, 0, 0.1)',
      cardBackground: 'rgba(255, 215, 0, 0.05)',
      cardBorder: 'rgba(255, 215, 0, 0.3)',
      buttonBackground: 'rgba(255, 215, 0, 0.1)',
      buttonText: '#ffd700',
      buttonHover: 'rgba(255, 215, 0, 0.2)',
      linkBackground: 'rgba(26, 26, 46, 0.8)',
      linkBorder: 'rgba(255, 215, 0, 0.5)',
      linkText: '#ffd700',
      linkHover: 'rgba(255, 215, 0, 0.1)'
    },
    typography: {
      fontFamily: 'Fira Code',
      fontFamilyHeading: 'Fira Code',
      fontWeightNormal: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      titleSize: 'text-3xl',
      subtitleSize: 'text-xl',
      bodySize: 'text-lg',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&display=swap'
    },
    layout: {
      borderRadius: 'rounded-lg',
      borderRadiusLarge: 'rounded-xl',
      borderRadiusButton: 'rounded-lg',
      borderRadiusCard: 'rounded-lg',
      borderRadiusAvatar: 'rounded-lg',
      shadowCard: 'shadow-lg shadow-yellow-500/20',
      shadowButton: 'shadow-md shadow-yellow-600/30',
      shadowHover: 'shadow-xl shadow-yellow-500/25',
      containerPadding: 'px-5',
      sectionSpacing: 'space-y-5',
      cardPadding: 'p-5',
      linkWidthMobile: '88%',
      linkWidthDesktop: '48%',
      imageStyle: 'rounded',
      maxWidth: 'max-w-xl',
      backgroundPattern: {
        pattern: 'dark_marble',
        color: '#ffd700',
        opacity: 0.3
      }
    }
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Gradiente colorido con estilo moderno',
    preview: '/themes/gradient-preview.jpg',
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSecondary: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#f1f5f9',
      textMuted: '#cbd5e1',
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      secondary: 'rgba(139, 92, 246, 0.1)',
      cardBackground: 'rgba(255, 255, 255, 0.15)',
      cardBorder: 'rgba(255, 255, 255, 0.3)',
      buttonBackground: 'rgba(255, 255, 255, 0.2)',
      buttonText: '#ffffff',
      buttonHover: 'rgba(255, 255, 255, 0.3)',
      linkBackground: 'rgba(255, 255, 255, 0.15)',
      linkBorder: 'rgba(255, 255, 255, 0.3)',
      linkText: '#ffffff',
      linkHover: 'rgba(255, 255, 255, 0.25)'
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
      borderRadius: 'rounded-xl',
      borderRadiusLarge: 'rounded-2xl',
      borderRadiusButton: 'rounded-xl',
      borderRadiusCard: 'rounded-xl',
      borderRadiusAvatar: 'rounded-full',
      shadowCard: 'shadow-lg shadow-purple-500/20',
      shadowButton: 'shadow-md shadow-purple-500/30',
      shadowHover: 'shadow-xl shadow-purple-500/25',
      containerPadding: 'px-4',
      sectionSpacing: 'space-y-3',
      cardPadding: 'p-4',
      linkWidthMobile: '95%',
      linkWidthDesktop: '40%',
      imageStyle: 'rounded',
      maxWidth: 'max-w-lg',
      backgroundPattern: {
        pattern: 'geometric',
        color: '#8b5cf6',
        opacity: 0.2
      }
    }
  }
];

// Helper functions
export function getThemeById(id: string): Theme | undefined {
  return themes.find(theme => theme.id === id);
}

export function getDefaultTheme(): Theme {
  return themes[0]; // dark theme as default
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