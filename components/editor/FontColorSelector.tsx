"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface FontColorSelectorProps {
  value: {
    primary: string;
    secondary: string;
  };
  onChange: (fontColors: { primary: string; secondary: string }) => void;
  onSave?: (fontColors: { primary: string; secondary: string }) => void;
  className?: string;
}

export default function FontColorSelector({ 
  value, 
  onChange, 
  onSave,
  className = "" 
}: FontColorSelectorProps) {
  const t = useTranslations('fontColor');
  const [localColors, setLocalColors] = useState(value);
  const [pendingValue, setPendingValue] = useState<{ primary: string; secondary: string } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = React.useTransition();

  // Sincronizar con valor prop
  useEffect(() => {
    setLocalColors(value);
  }, [value]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleColorChange = (colorKey: 'primary' | 'secondary', newColor: string) => {
    const newFontColors = { ...localColors, [colorKey]: newColor };
    setLocalColors(newFontColors);
    setPendingValue(newFontColors);
    
    // Actualizar inmediatamente en baja prioridad
    startTransition(() => {
      onChange(newFontColors);
    });
    
    // Configurar guardado con debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (onSave) {
      timeoutRef.current = setTimeout(() => {
        onSave(newFontColors);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  const presets = [
    { 
      name: t('presets.classicWhite'), 
      primary: '#ffffff', 
      secondary: '#e2e8f0' 
    },
    { 
      name: t('presets.elegantBlack'), 
      primary: '#000000', 
      secondary: '#1e293b' 
    },
    { 
      name: t('presets.modernGray'), 
      primary: '#374151', 
      secondary: '#6b7280' 
    },
    { 
      name: t('presets.softBlue'), 
      primary: '#1e40af', 
      secondary: '#3b82f6' 
    }
  ];

  const handlePresetClick = (preset: { primary: string; secondary: string }) => {
    setLocalColors(preset);
    setPendingValue(preset);
    
    // Actualizar inmediatamente
    startTransition(() => {
      onChange(preset);
    });
    
    // Configurar guardado
    if (onSave) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onSave(preset);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          {t('title')}
        </label>
      </div>
      
      {/* Vista previa de los colores de fuente */}
      <div className="space-y-3">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <div 
            className="text-lg font-semibold mb-2"
            style={{ color: localColors.primary }}
          >
            {t('preview.mainTitle')}
          </div>
          <div 
            className="text-sm"
            style={{ color: localColors.secondary }}
          >
            {t('preview.description')}
          </div>
        </div>
        
        {/* Controles de color */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">{t('primaryColor')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400">{t('secondaryColor')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="#e2e8f0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400">{t('predefinedCombinations')}:</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isActive = localColors.primary === preset.primary && localColors.secondary === preset.secondary;
            
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetClick({ primary: preset.primary, secondary: preset.secondary })}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {/* Vista previa de los colores */}
                <div className="w-full mb-2 space-y-1">
                  <div 
                    className="text-xs font-semibold text-center"
                    style={{ color: preset.primary }}
                  >
                    {t('preview.title')}
                  </div>
                  <div 
                    className="text-xs text-center"
                    style={{ color: preset.secondary }}
                  >
                    {t('preview.subtitle')}
                  </div>
                </div>
                <span className="text-xs font-medium text-center">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}