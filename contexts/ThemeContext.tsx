"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, getThemeById, getDefaultTheme } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  setThemeId: (id: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialThemeId?: string;
}

export function ThemeProvider({ children, initialThemeId = 'minimal' }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<string>(initialThemeId);
  const [isLoading, setIsLoading] = useState(true);

  // Get current theme
  const theme = getThemeById(themeId) || getDefaultTheme();

  // Load Google Fonts dynamically
  useEffect(() => {
    if (theme.typography.googleFontsUrl) {
      // Remove existing theme fonts
      const existingLinks = document.querySelectorAll('link[data-theme-font]');
      existingLinks.forEach(link => link.remove());

      // Add new theme font
      const link = document.createElement('link');
      link.href = theme.typography.googleFontsUrl;
      link.rel = 'stylesheet';
      link.setAttribute('data-theme-font', 'true');
      document.head.appendChild(link);

      // Wait for font to load
      link.onload = () => {
        setIsLoading(false);
      };
      
      // Fallback in case font fails to load
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } else {
      setIsLoading(false);
    }
  }, [theme.typography.googleFontsUrl]);

  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Set color variables
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-background-secondary', theme.colors.backgroundSecondary);
    root.style.setProperty('--theme-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-card-background', theme.colors.cardBackground);
    root.style.setProperty('--theme-card-border', theme.colors.cardBorder);
    root.style.setProperty('--theme-link-background', theme.colors.linkBackground);
    root.style.setProperty('--theme-link-border', theme.colors.linkBorder);
    root.style.setProperty('--theme-link-text', theme.colors.linkText);
    root.style.setProperty('--theme-link-hover', theme.colors.linkHover);
    
    // Set font family variables
    root.style.setProperty('--theme-font-family', theme.typography.fontFamily);
    root.style.setProperty('--theme-font-family-heading', theme.typography.fontFamilyHeading);
    root.style.setProperty('--theme-font-weight-normal', theme.typography.fontWeightNormal.toString());
    root.style.setProperty('--theme-font-weight-medium', theme.typography.fontWeightMedium.toString());
    root.style.setProperty('--theme-font-weight-bold', theme.typography.fontWeightBold.toString());
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    themeId,
    setThemeId,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper hook to get theme classes
export function useThemeClasses() {
  const { theme } = useTheme();
  
  return {
    // Background classes
    backgroundGradient: `bg-gradient-to-br ${theme.colors.background}`,
    backgroundSecondary: theme.colors.backgroundSecondary,
    
    // Text classes - simplified to use CSS variables
    textPrimary: 'text-[var(--theme-text-primary)]',
    textSecondary: 'text-[var(--theme-text-secondary)]',
    textMuted: 'text-[var(--theme-text-muted)]',
    
    // Typography classes
    titleSize: theme.typography.titleSize,
    subtitleSize: theme.typography.subtitleSize,
    bodySize: theme.typography.bodySize,
    fontFamily: `font-[${theme.typography.fontFamily}]`,
    fontFamilyHeading: `font-[${theme.typography.fontFamilyHeading}]`,
    
    // Layout classes
    borderRadius: theme.layout.borderRadius,
    borderRadiusLarge: theme.layout.borderRadiusLarge,
    borderRadiusCard: theme.layout.borderRadiusCard,
    borderRadiusAvatar: theme.layout.borderRadiusAvatar,
    borderRadiusButton: theme.layout.borderRadiusButton,
    shadowCard: theme.layout.shadowCard,
    shadowButton: theme.layout.shadowButton,
    shadowHover: theme.layout.shadowHover,
    containerPadding: theme.layout.containerPadding,
    sectionSpacing: theme.layout.sectionSpacing,
    cardPadding: theme.layout.cardPadding,
    maxWidth: theme.layout.maxWidth,
    
    // Component classes
    cardBackground: theme.colors.cardBackground,
    cardBorder: theme.colors.cardBorder,
    buttonBackground: theme.colors.buttonBackground,
    buttonText: theme.colors.buttonText,
    buttonHover: theme.colors.buttonHover,
    linkBackground: theme.colors.linkBackground,
    linkBorder: theme.colors.linkBorder,
    linkText: theme.colors.linkText,
    linkHover: theme.colors.linkHover,
    
    // Primary/accent colors
    primary: theme.colors.primary,
    primaryHover: theme.colors.primaryHover,
    secondary: theme.colors.secondary,
  };
}