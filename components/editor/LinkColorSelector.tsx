"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface LinkColorSelectorProps {
  value: {
    background: string;
    text: string;
    backgroundOpacity?: number;
  };
  onChange: (linkColors: { background: string; text: string; backgroundOpacity?: number }) => void;
  onSave?: (linkColors: { background: string; text: string; backgroundOpacity?: number }) => void;
  className?: string;
}

export default function LinkColorSelector({ 
  value, 
  onChange, 
  onSave,
  className = "" 
}: LinkColorSelectorProps) {
  const t = useTranslations('linkColor');
  const [localColors, setLocalColors] = useState({
    ...value,
    backgroundOpacity: value.backgroundOpacity ?? 1
  });
  const [pendingValue, setPendingValue] = useState<{ background: string; text: string; backgroundOpacity?: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = React.useTransition();

  // Función para aplicar opacidad a un color hex
  const applyOpacityToColor = (color: string, opacity: number) => {
    // Si ya es rgba, extraer el color base
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    
    // Si es hex, convertir a rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
  };

  // Sincronizar con valor prop
  useEffect(() => {
    setLocalColors({
      ...value,
      backgroundOpacity: value.backgroundOpacity ?? 1
    });
  }, [value]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleColorChange = (colorKey: 'background' | 'text', newColor: string) => {
    const newLinkColors = { ...localColors, [colorKey]: newColor };
    setLocalColors(newLinkColors);
    setPendingValue(newLinkColors);
    
    // Actualizar inmediatamente en baja prioridad
    startTransition(() => {
      onChange(newLinkColors);
    });
    
    // Configurar guardado con debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (onSave) {
      timeoutRef.current = setTimeout(() => {
        onSave(newLinkColors);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  const handleOpacityChange = (opacity: number) => {
    const newLinkColors = { ...localColors, backgroundOpacity: opacity };
    setLocalColors(newLinkColors);
    setPendingValue(newLinkColors);
    
    // Actualizar inmediatamente en baja prioridad
    startTransition(() => {
      onChange(newLinkColors);
    });
    
    // Configurar guardado con debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (onSave) {
      timeoutRef.current = setTimeout(() => {
        onSave(newLinkColors);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  const presets = [
    { 
      name: t('presets.classicBlack'), 
      background: '#000000', 
      text: '#ffffff' 
    },
    { 
      name: t('presets.cleanWhite'), 
      background: '#ffffff', 
      text: '#000000' 
    },
    { 
      name: t('presets.darkGray'), 
      background: '#374151', 
      text: '#ffffff' 
    },
    { 
      name: t('presets.elegantBlue'), 
      background: '#1e40af', 
      text: '#ffffff' 
    }
  ];

  const handlePresetClick = (preset: { background: string; text: string }) => {
    const newColors = { ...preset, backgroundOpacity: 1 };
    setLocalColors(newColors);
    setPendingValue(newColors);
    
    // Actualizar inmediatamente
    startTransition(() => {
      onChange(newColors);
    });
    
    // Configurar guardado
    if (onSave) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onSave(newColors);
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
      
      {/* Vista previa del link */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <div 
            className="px-6 py-3 rounded-lg border flex items-center justify-center text-sm font-medium transition-all duration-200"
            style={{ 
              backgroundColor: applyOpacityToColor(localColors.background, localColors.backgroundOpacity || 1),
              color: localColors.text,
              borderColor: 'rgba(148, 163, 184, 0.2)'
            }}
          >
            {t('preview.exampleLink')}
          </div>
        </div>
        
        {/* Controles de color */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">{t('linkBackground')}</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="color"
                value={localColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-full px-2 py-2 h-12 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs sm:text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400">{t('linkText')}</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="color"
                value={localColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-full px-2 py-2 h-12 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs sm:text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
        
        {/* Control de opacidad */}
        <div className="space-y-2 mt-4">
          <label className="text-xs text-gray-400 flex items-center justify-between">
            <span>{t('backgroundOpacity')}</span>
            <span className="text-purple-400 font-medium">{Math.round((localColors.backgroundOpacity || 1) * 100)}%</span>
          </label>
          <div className="relative">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                style={{ width: `${(localColors.backgroundOpacity || 1) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localColors.backgroundOpacity || 1}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{t('transparent')}</span>
            <span>{t('solid')}</span>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400">{t('predefinedCombinations')}:</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isActive = localColors.background === preset.background && localColors.text === preset.text;
            
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetClick({ background: preset.background, text: preset.text })}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {/* Vista previa del link preset */}
                <div className="w-full mb-2">
                  <div 
                    className="w-full h-8 rounded border flex items-center justify-center text-xs font-medium"
                    style={{ 
                      backgroundColor: preset.background,
                      color: preset.text,
                      borderColor: 'rgba(148, 163, 184, 0.3)'
                    }}
                  >
                    {t('preview.link')}
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