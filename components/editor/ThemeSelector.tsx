/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, Theme, getThemeById } from '@/lib/themes';
import { SwatchIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface ThemeSelectorProps {
  currentThemeId?: string;
  onThemeChange: (themeId: string) => void;
  className?: string;
}

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}

function ThemePreview({ theme, isSelected, onClick }: ThemePreviewProps) {
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
      <div className="relative bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden transition-all duration-300 group-hover:border-indigo-300">
        {/* Header with theme name and icon */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getThemeIcon(theme.id)}</span>
            <h3 className="font-bold text-base text-gray-900">{theme.name}</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{theme.description}</p>
        </div>
        
        {/* Visual Preview */}
        <div className="p-4 h-40 relative">
          {/* Background */}
          <div 
            className="absolute inset-0 rounded-b-xl"
            style={{ background: theme.colors.background }}
          />
          
          {/* Sample phone mockup */}
          <div className="relative z-10 flex flex-col items-center space-y-3 h-full justify-center">
            {/* Sample avatar with better styling */}
            <div 
              className="w-12 h-12 rounded-full border-3 border-white shadow-lg bg-gradient-to-br from-gray-200 to-gray-400"
              style={{ backgroundColor: theme.colors.textSecondary }}
            />
            
            {/* Sample title with theme font */}
            <div 
              className="px-3 py-1 rounded-lg font-bold text-sm text-center shadow-sm"
              style={{ 
                backgroundColor: theme.colors.textPrimary,
                color: theme.colors.background,
                fontFamily: theme.typography.fontFamily
              }}
            >
              @usuario
            </div>
            
            {/* Sample links with better styling */}
            <div className="space-y-2 w-full max-w-32">
              <div 
                className="w-full h-8 border-2 rounded-xl flex items-center px-3 shadow-sm transition-all"
                style={{ 
                  backgroundColor: theme.colors.linkBackground,
                  borderColor: theme.colors.linkBorder,
                  color: theme.colors.linkText
                }}
              >
                <div className="w-4 h-4 bg-gradient-to-br from-indigo-400 to-purple-400 rounded mr-2" />
                <div className="text-xs font-medium">Instagram</div>
              </div>
              <div 
                className="w-full h-8 border-2 rounded-xl flex items-center px-3 shadow-sm transition-all"
                style={{ 
                  backgroundColor: theme.colors.linkBackground,
                  borderColor: theme.colors.linkBorder,
                  color: theme.colors.linkText
                }}
              >
                <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded mr-2" />
                <div className="text-xs font-medium">YouTube</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Font family indicator */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div 
            className="text-xs text-gray-600 text-center font-medium"
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
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/0 via-transparent to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none rounded-xl" />
      </div>
    </motion.div>
  );
}

export default function ThemeSelector({ currentThemeId = 'dark', onThemeChange, className = '' }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = getThemeById(currentThemeId) || themes[0];

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
              className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-white via-gray-50 to-indigo-50/50 rounded-xl shadow-2xl border border-indigo-200/50 z-50 max-h-[500px] overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">🎨 Selecciona tu tema</h3>
                  <p className="text-gray-600">Elige el estilo que mejor represente tu personalidad</p>
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
                      />
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-indigo-200/50">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
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