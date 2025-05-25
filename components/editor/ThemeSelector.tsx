"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, Theme, getThemeById } from '@/lib/themes';
import { SwatchIcon, CheckIcon } from '@heroicons/react/24/outline';
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
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer group ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
      onClick={onClick}
    >
      {/* Preview Card */}
      <div className="relative bg-white rounded-lg border shadow-sm overflow-hidden">
        {/* Header with theme name */}
        <div className="p-3 border-b">
          <h3 className="font-medium text-sm text-gray-900">{theme.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
        </div>
        
        {/* Visual Preview */}
        <div className="p-4 h-32 relative">
          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.colors.background}`} />
          
          {/* Sample avatar */}
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div className={`w-8 h-8 bg-gray-300 ${theme.layout.borderRadiusAvatar}`} />
            
            {/* Sample title */}
            <div className={`w-16 h-3 bg-gray-400 ${theme.layout.borderRadius}`} />
            
            {/* Sample links */}
            <div className="space-y-1 w-full">
              <div className={`w-full h-6 ${theme.colors.linkBackground} ${theme.colors.linkBorder} border ${theme.layout.borderRadiusCard} ${theme.layout.shadowCard} flex items-center px-2`}>
                <div className="w-3 h-3 bg-gray-300 rounded mr-2" />
                <div className="w-12 h-2 bg-gray-400 rounded" />
              </div>
              <div className={`w-full h-6 ${theme.colors.linkBackground} ${theme.colors.linkBorder} border ${theme.layout.borderRadiusCard} ${theme.layout.shadowCard} flex items-center px-2`}>
                <div className="w-3 h-3 bg-gray-300 rounded mr-2" />
                <div className="w-16 h-2 bg-gray-400 rounded" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1"
            >
              <CheckIcon className="w-3 h-3" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
      </div>
      
      {/* Font preview */}
      <div className="mt-2 text-center">
        <div 
          className="text-xs text-gray-600"
          style={{ fontFamily: theme.typography.fontFamily }}
        >
          {theme.typography.fontFamily}
        </div>
      </div>
    </motion.div>
  );
}

export default function ThemeSelector({ currentThemeId = 'minimal', onThemeChange, className = '' }: ThemeSelectorProps) {
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
        className="flex items-center gap-2 w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <SwatchIcon className="w-4 h-4" />
          <span>Tema: {currentTheme.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona un tema</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <ThemePreview
                      key={theme.id}
                      theme={theme}
                      isSelected={theme.id === currentThemeId}
                      onClick={() => handleThemeSelect(theme.id)}
                    />
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    Cerrar
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