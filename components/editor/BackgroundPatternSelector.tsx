"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

interface BackgroundPatternConfiguration {
  pattern: string;
  color: string;
  opacity: number;
}

interface BackgroundPatternSelectorProps {
  value: BackgroundPatternConfiguration;
  onChange: (config: BackgroundPatternConfiguration) => void;
  onSave: (config: BackgroundPatternConfiguration) => void;
}


// Colors will be defined inside the component to access translations

// Function to generate pattern CSS (for preview in selector)
const generatePatternCSS = (pattern: string, color: string, opacity: number) => {
  const colorWithOpacity = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  
  switch (pattern) {
    case 'grid':
      return {
        backgroundImage: `
          linear-gradient(${colorWithOpacity} 1px, transparent 1px),
          linear-gradient(90deg, ${colorWithOpacity} 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      };
    
    case 'dots':
      return {
        backgroundImage: `radial-gradient(circle, ${colorWithOpacity} 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      };
    
    case 'diagonal':
      return {
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 40px,
          ${colorWithOpacity} 40px,
          ${colorWithOpacity} 42px
        )`
      };
    
    case 'waves':
      return {
        backgroundImage: `
          radial-gradient(ellipse at center, transparent 50%, ${colorWithOpacity} 50%),
          linear-gradient(90deg, transparent 50%, ${colorWithOpacity} 50%)
        `,
        backgroundSize: '40px 40px, 40px 20px'
      };
    
    case 'geometric':
      return {
        backgroundImage: `url('/images/background/geometric.png')`,
        backgroundSize: '200px 200px',
        backgroundRepeat: 'repeat',
        opacity: opacity
      };
    
    case 'circuit':
      return {
        backgroundImage: `
          linear-gradient(90deg, ${colorWithOpacity} 1px, transparent 1px),
          linear-gradient(${colorWithOpacity} 1px, transparent 1px),
          radial-gradient(circle at 20px 20px, ${colorWithOpacity} 2px, transparent 2px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 40px 40px'
      };
    
    case 'dark_marble':
      return {
        backgroundImage: `url('/images/background/dark_marmol.png')`,
        backgroundSize: '300px 300px',
        backgroundRepeat: 'repeat',
        opacity: opacity
      };
    
    case 'white_marble':
      return {
        backgroundImage: `url('/images/background/white_marmol.png')`,
        backgroundSize: '300px 300px',
        backgroundRepeat: 'repeat',
        opacity: opacity
      };
    
    default:
      return {};
  }
};

export default function BackgroundPatternSelector({ value, onChange, onSave }: BackgroundPatternSelectorProps) {
  const t = useTranslations('backgroundPattern');
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(value);
  const [customColor, setCustomColor] = useState('#3b82f6');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const getPatterns = () => [
    {
      id: 'none',
      name: t('patterns.none.name'),
      description: t('patterns.none.description'),
      type: 'none'
    },
    {
      id: 'grid',
      name: t('patterns.grid.name'),
      description: t('patterns.grid.description'),
      type: 'css'
    },
    {
      id: 'dots',
      name: t('patterns.dots.name'),
      description: t('patterns.dots.description'),
      type: 'css'
    },
    {
      id: 'diagonal',
      name: t('patterns.diagonal.name'),
      description: t('patterns.diagonal.description'),
      type: 'css'
    },
    {
      id: 'waves',
      name: t('patterns.waves.name'),
      description: t('patterns.waves.description'),
      type: 'css'
    },
    {
      id: 'geometric',
      name: t('patterns.geometric.name'),
      description: t('patterns.geometric.description'),
      type: 'image'
    },
    {
      id: 'circuit',
      name: t('patterns.circuit.name'),
      description: t('patterns.circuit.description'),
      type: 'css'
    },
    {
      id: 'dark_marble',
      name: t('patterns.darkMarble.name'),
      description: t('patterns.darkMarble.description'),
      type: 'image'
    },
    {
      id: 'white_marble',
      name: t('patterns.whiteMarble.name'),
      description: t('patterns.whiteMarble.description'),
      type: 'image'
    }
  ];

  const patterns = getPatterns();

  const colors = [
    { name: t('colors.snow'), value: '#ffffff' },
    { name: t('colors.midnight'), value: '#000000' },
    { name: t('colors.ocean'), value: '#3b82f6' },
    { name: t('colors.electric'), value: '#8b5cf6' },
    { name: t('colors.neon'), value: '#ec4899' },
    { name: t('colors.mint'), value: '#10b981' },
    { name: t('colors.sunset'), value: '#f97316' },
    { name: t('colors.custom'), value: 'custom' }
  ];

  // Debounced onChange to avoid many calls
  const debouncedOnChange = useCallback((config: BackgroundPatternConfiguration) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onChange(config);
      onSave(config); // También guardar después del debounce
    }, 300); // 300ms delay
  }, [onChange, onSave]);

  const handlePatternChange = (pattern: string) => {
    const newConfig = { ...localConfig, pattern };
    setLocalConfig(newConfig);
    debouncedOnChange(newConfig);
  };

  const handleColorChange = (color: string) => {
    const finalColor = color === 'custom' ? customColor : color;
    const newConfig = { ...localConfig, color: finalColor };
    setLocalConfig(newConfig);
    debouncedOnChange(newConfig);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    // Si estamos en modo personalizado, actualizar inmediatamente
    if (!colors.some(c => c.value === localConfig.color && c.value !== 'custom')) {
      const newConfig = { ...localConfig, color };
      setLocalConfig(newConfig);
      debouncedOnChange(newConfig);
    }
  };

  const handleOpacityChange = (opacity: number) => {
    const newConfig = { ...localConfig, opacity };
    setLocalConfig(newConfig);
    debouncedOnChange(newConfig);
  };


  // Synchronize with parent value when it changes
  useEffect(() => {
    setLocalConfig(value);
    // Si el color actual es un color personalizado, actualizar customColor
    const isCustomColor = !colors.some(c => c.value === value.color && c.value !== 'custom');
    if (isCustomColor && value.color) {
      setCustomColor(value.color);
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const selectedPattern = patterns.find(p => p.id === localConfig.pattern) || patterns[0];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-gray-700/90 hover:to-gray-600/90 rounded-xl border border-gray-500/30 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-lg border-2 border-gray-500/30 flex-shrink-0 shadow-inner overflow-hidden"
              style={{
                background: localConfig.pattern === 'none' ? localConfig.color : undefined,
                ...generatePatternCSS(localConfig.pattern, localConfig.color, localConfig.opacity)
              }}
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-gray-800 shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-white font-semibold text-base">{selectedPattern.name}</div>
            <div className="text-gray-300 text-sm opacity-80">{selectedPattern.description}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-purple-400 font-medium">
            {localConfig.pattern !== 'none' ? `${Math.round(localConfig.opacity * 100)}%` : ''}
          </div>
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDownIcon className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-6 p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-500/30 backdrop-blur-sm shadow-2xl">
          {/* Pattern selector */}
          <div>
            <label className="block text-base font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              {t('title')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => handlePatternChange(pattern.id)}
                  className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    localConfig.pattern === pattern.id
                      ? 'border-purple-500 bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-lg shadow-purple-500/25'
                      : 'border-gray-600/50 bg-gray-800/40 hover:bg-gray-700/60 hover:border-gray-500'
                  }`}
                >
                  <div
                    className="w-full h-10 rounded-lg mb-3 border-2 border-gray-600/30 shadow-inner overflow-hidden"
                    style={{
                      background: pattern.id === 'none' ? localConfig.color : undefined,
                      ...generatePatternCSS(pattern.id, localConfig.color, localConfig.opacity)
                    }}
                  />
                  <div className={`text-sm font-medium transition-colors ${
                    localConfig.pattern === pattern.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {pattern.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color selector (only if not 'none' and type is 'css') */}
          {localConfig.pattern !== 'none' && selectedPattern.type === 'css' && (
            <div>
              <label className="block text-base font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                {t('patternColor')}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={`group p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      (color.value === 'custom' ? 
                        !colors.some(c => c.value === localConfig.color && c.value !== 'custom') : 
                        localConfig.color === color.value)
                        ? 'border-purple-500 bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-lg shadow-purple-500/25'
                        : 'border-gray-600/50 bg-gray-800/40 hover:bg-gray-700/60 hover:border-gray-500'
                    }`}
                  >
                    {color.value === 'custom' ? (
                      <div className="w-8 h-8 rounded-lg border-2 border-gray-600/30 mx-auto mb-2 bg-gradient-to-br from-red-400 via-purple-400 to-blue-400 shadow-inner" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-gray-600/30 mx-auto mb-2 shadow-inner"
                        style={{ backgroundColor: color.value }}
                      />
                    )}
                    <div className={`text-xs font-medium transition-colors ${
                      (color.value === 'custom' ? 
                        !colors.some(c => c.value === localConfig.color && c.value !== 'custom') : 
                        localConfig.color === color.value)
                        ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {color.name}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Custom color selector */}
              {!colors.some(c => c.value === localConfig.color && c.value !== 'custom') && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
                    {t('customColor')}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="w-14 h-10 rounded-lg border-2 border-gray-600/30 bg-transparent cursor-pointer shadow-inner"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-gray-700/50 border-2 border-gray-600/30 rounded-lg text-white text-sm font-mono focus:border-purple-500/50 focus:outline-none transition-colors"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opacity slider (only if not 'none') */}
          {localConfig.pattern !== 'none' && (
            <div>
              <label className="block text-base font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                {t('opacity')} 
                <span className="text-purple-400 font-bold">{Math.round(localConfig.opacity * 100)}%</span>
              </label>
              <div className="relative">
                <div className="mx-3 h-3 bg-gray-700 rounded-lg overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                    style={{ 
                      width: `${((localConfig.opacity - 0.1) / 0.9) * 100}%`
                    }}
                  />
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={localConfig.opacity}
                  onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                  className="absolute top-0 left-0 w-full h-3 appearance-none bg-transparent cursor-pointer opacity-slider"
                />
              </div>
            </div>
          )}

        </div>
      )}
      
      {/* CSS styles for custom slider */}
      <style jsx>{`
        .opacity-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          outline: none;
          margin: 0;
          padding: 0;
        }
        
        .opacity-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          margin-top: -5px;
          position: relative;
        }
        
        .opacity-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          margin-top: -5px;
        }
        
        .opacity-slider::-moz-range-track {
          background: transparent;
          border: none;
          height: 12px;
        }
      `}</style>
    </div>
  );
}