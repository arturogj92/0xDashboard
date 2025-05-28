/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, Theme, getThemeById } from '@/lib/themes';
import { SwatchIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface ThemeSelectorProps {
  currentThemeId?: string;
  onThemeChange: (themeId: string) => void;
  className?: string;
  landingName?: string;
  landingDescription?: string;
}

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
  landingName?: string;
  landingDescription?: string;
}

function ThemePreview({ theme, isSelected, onClick, landingName = "Mi Landing", landingDescription = "Descripción" }: ThemePreviewProps) {
  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'dark': return '🌙';
      case 'minimal': return '✨';
      case 'vibrant': return '🌈';
      case 'elegant': return '💎';
      case 'neon-cyber': return '⚡';
      case 'sunset-dream': return '🌅';
      case 'forest-zen': return '🌿';
      case 'royal-luxury': return '👑';
      default: return '🎨';
    }
  };

  // Función para generar el CSS del patrón para la previsualización
  const generatePatternCSS = (pattern: string, color: string, opacity: number) => {
    const colorWithOpacity = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    
    switch (pattern) {
      case 'grid':
        return {
          backgroundImage: `
            linear-gradient(${colorWithOpacity} 1px, transparent 1px),
            linear-gradient(90deg, ${colorWithOpacity} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        };
      
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, ${colorWithOpacity} 1px, transparent 1px)`,
          backgroundSize: '10px 10px'
        };
      
      case 'diagonal':
        return {
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            ${colorWithOpacity} 20px,
            ${colorWithOpacity} 21px
          )`
        };
      
      case 'waves':
        return {
          backgroundImage: `
            radial-gradient(ellipse at center, transparent 50%, ${colorWithOpacity} 50%),
            linear-gradient(90deg, transparent 50%, ${colorWithOpacity} 50%)
          `,
          backgroundSize: '20px 20px, 20px 10px'
        };
      
      case 'geometric':
        return {
          backgroundImage: `url('/images/background/geometric.png')`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
          opacity: opacity
        };
      
      case 'circuit':
        return {
          backgroundImage: `
            linear-gradient(90deg, ${colorWithOpacity} 1px, transparent 1px),
            linear-gradient(${colorWithOpacity} 1px, transparent 1px),
            radial-gradient(circle at 10px 10px, ${colorWithOpacity} 2px, transparent 2px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 20px 20px'
        };
      
      case 'dark_marble':
        return {
          backgroundImage: `url('/images/background/dark_marmol.png')`,
          backgroundSize: '150px 150px',
          backgroundRepeat: 'repeat',
          opacity: opacity
        };
      
      case 'white_marble':
        return {
          backgroundImage: `url('/images/background/white_marmol.png')`,
          backgroundSize: '150px 150px',
          backgroundRepeat: 'repeat',
          opacity: opacity
        };
      
      default:
        return {};
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer group ${
        isSelected 
          ? 'ring-3 ring-indigo-500 ring-offset-2 shadow-xl' 
          : 'hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      {/* Preview Card */}
      <div className="relative bg-gray-800 rounded-xl border-2 border-gray-700 shadow-lg overflow-hidden transition-all duration-300 group-hover:border-indigo-500">
        {/* Header with theme name and icon */}
        <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getThemeIcon(theme.id)}</span>
            <h3 className="font-bold text-base text-white">{theme.name}</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{theme.description}</p>
        </div>
        
        {/* Visual Preview */}
        <div className="p-4 h-40 relative overflow-hidden">
          {/* Background */}
          <div 
            className="absolute inset-0 rounded-b-xl"
            style={{ background: theme.colors.background }}
          />
          
          {/* Background Pattern */}
          {theme.layout.backgroundPattern && theme.layout.backgroundPattern.pattern !== 'none' && (
            <div 
              className="absolute inset-0 rounded-b-xl"
              style={generatePatternCSS(
                theme.layout.backgroundPattern.pattern,
                theme.layout.backgroundPattern.color,
                theme.layout.backgroundPattern.opacity
              )}
            />
          )}
          
          {/* Sample phone mockup */}
          <div className="relative z-10 flex flex-col items-center space-y-3 h-full justify-center px-3">
            {/* Landing name with theme font and color */}
            <div 
              className="font-bold text-base text-center truncate max-w-full"
              style={{ 
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontFamily
              }}
            >
              {landingName}
            </div>
            
            {/* Landing description with theme font and color */}
            <div 
              className="text-xs text-center truncate max-w-full opacity-90"
              style={{ 
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamily
              }}
            >
              {landingDescription}
            </div>
            
            {/* Sample link */}
            <div className="w-full max-w-32 mt-2">
              <div 
                className="w-full h-8 border-2 rounded-xl flex items-center px-3 shadow-sm transition-all"
                style={{ 
                  backgroundColor: theme.colors.linkBackground,
                  borderColor: theme.colors.linkBorder,
                  color: theme.colors.linkText
                }}
              >
                <div className="w-4 h-4 bg-gradient-to-br from-pink-400 to-purple-400 rounded mr-2 flex-shrink-0" />
                <div className="text-xs font-medium truncate">Instagram</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Font family indicator */}
        <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-700">
          <div 
            className="text-xs text-gray-400 text-center font-medium"
            style={{ fontFamily: theme.typography.fontFamily }}
          >
            {theme.typography.fontFamily.split(',')[0]}
          </div>
        </div>
        
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full p-2 shadow-lg"
            >
              <CheckIcon className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hover overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/0 via-transparent to-indigo-500/0 group-hover:from-indigo-500/20 group-hover:to-indigo-500/10 transition-all duration-300 pointer-events-none rounded-xl" />
      </div>
    </motion.div>
  );
}

export default function ThemeSelector({ currentThemeId = 'dark', onThemeChange, className = '', landingName, landingDescription }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = getThemeById(currentThemeId) || themes[0];

  // Precargar todas las fuentes de Google de los temas
  useEffect(() => {
    themes.forEach(theme => {
      if (theme.typography.googleFontsUrl) {
        // Verificar si la fuente ya está cargada
        const fontLinkId = `theme-font-${theme.id}`;
        if (!document.getElementById(fontLinkId)) {
          const link = document.createElement('link');
          link.id = fontLinkId;
          link.rel = 'stylesheet';
          link.href = theme.typography.googleFontsUrl;
          document.head.appendChild(link);
        }
      }
    });
  }, []);

  const handleThemeSelect = (themeId: string) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-gray-800/50 border-2 border-indigo-400/50 text-white hover:bg-gray-700/50 hover:border-indigo-400 transition-all duration-200 p-4 h-auto"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-8 h-8 rounded-lg border-2 border-white/30 shadow-lg"
            style={{ background: currentTheme.colors.background }}
          />
          <div className="text-left">
            <div className="font-semibold text-lg">{currentTheme.name}</div>
            <div className="text-sm text-gray-300">{currentTheme.description}</div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="h-5 w-5 text-indigo-400" />
        </motion.div>
      </Button>

      {/* Theme Selection Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900/50 rounded-xl shadow-2xl border border-gray-700/50 z-50 max-h-[500px] overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">🎨 Selecciona tu tema</h3>
                  <p className="text-gray-300">Elige el estilo que mejor represente tu personalidad</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {themes.map((theme, index) => (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ThemePreview
                        theme={theme}
                        isSelected={theme.id === currentThemeId}
                        onClick={() => handleThemeSelect(theme.id)}
                        landingName={landingName}
                        landingDescription={landingDescription}
                      />
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white bg-gray-800/50"
                  >
                    ✨ Cerrar selector
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}