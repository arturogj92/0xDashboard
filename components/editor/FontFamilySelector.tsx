"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface FontFamilySelectorProps {
  value: {
    family: string;
    url: string;
  };
  onChange: (fontFamily: { family: string; url: string }) => void;
  onSave?: (fontFamily: { family: string; url: string }) => void;
  className?: string;
}

export default function FontFamilySelector({ 
  value, 
  onChange, 
  onSave,
  className = "" 
}: FontFamilySelectorProps) {
  const t = useTranslations('fontFamily');
  const [localFont, setLocalFont] = useState(value);
  const [pendingValue, setPendingValue] = useState<{ family: string; url: string } | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = React.useTransition();

  // Popular Google Fonts
  const googleFonts = [
    // Modern Sans Serif
    { 
      name: 'Inter', 
      family: 'Inter', 
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Roboto', 
      family: 'Roboto', 
      url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Poppins', 
      family: 'Poppins', 
      url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Montserrat', 
      family: 'Montserrat', 
      url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Open Sans', 
      family: 'Open Sans', 
      url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Lato', 
      family: 'Lato', 
      url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Nunito', 
      family: 'Nunito', 
      url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Source Sans Pro', 
      family: 'Source Sans Pro', 
      url: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Raleway', 
      family: 'Raleway', 
      url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
      category: 'Sans Serif'
    },
    { 
      name: 'Ubuntu', 
      family: 'Ubuntu', 
      url: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap',
      category: 'Sans Serif'
    },
    
    // Elegant Serif
    { 
      name: 'Playfair Display', 
      family: 'Playfair Display', 
      url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
      category: 'Serif'
    },
    { 
      name: 'Merriweather', 
      family: 'Merriweather', 
      url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
      category: 'Serif'
    },
    { 
      name: 'Lora', 
      family: 'Lora', 
      url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
      category: 'Serif'
    },
    { 
      name: 'Crimson Text', 
      family: 'Crimson Text', 
      url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap',
      category: 'Serif'
    },
    { 
      name: 'Libre Baskerville', 
      family: 'Libre Baskerville', 
      url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
      category: 'Serif'
    },
    
    // Display and Creative
    { 
      name: 'Oswald', 
      family: 'Oswald', 
      url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap',
      category: 'Display'
    },
    { 
      name: 'Bebas Neue', 
      family: 'Bebas Neue', 
      url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
      category: 'Display'
    },
    { 
      name: 'Anton', 
      family: 'Anton', 
      url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
      category: 'Display'
    },
    { 
      name: 'Abril Fatface', 
      family: 'Abril Fatface', 
      url: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap',
      category: 'Display'
    },
    
    // Handwriting
    { 
      name: 'Dancing Script', 
      family: 'Dancing Script', 
      url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap',
      category: 'Handwriting'
    },
    { 
      name: 'Pacifico', 
      family: 'Pacifico', 
      url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
      category: 'Handwriting'
    },
    { 
      name: 'Caveat', 
      family: 'Caveat', 
      url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap',
      category: 'Handwriting'
    },
    
    // Monospace
    { 
      name: 'JetBrains Mono', 
      family: 'JetBrains Mono', 
      url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
      category: 'Monospace'
    },
    { 
      name: 'Fira Code', 
      family: 'Fira Code', 
      url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap',
      category: 'Monospace'
    }
  ];

  // Synchronize with prop value
  useEffect(() => {
    setLocalFont(value);
  }, [value]);

  // Load font dynamically
  const loadFont = React.useCallback((url: string, family: string) => {
    if (fontsLoaded.has(family)) return;

    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.onload = () => {
      setFontsLoaded(prev => new Set([...prev, family]));
    };
    document.head.appendChild(link);
  }, [fontsLoaded]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleFontChange = (font: { family: string; url: string }) => {
    setLocalFont(font);
    setPendingValue(font);
    
    // Load font if not already loaded
    loadFont(font.url, font.family);
    
    // Actualizar inmediatamente en baja prioridad
    startTransition(() => {
      onChange(font);
    });
    
    // Configure saving with debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (onSave) {
      timeoutRef.current = setTimeout(() => {
        onSave(font);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  // Load current font when mounting component
  useEffect(() => {
    if (localFont.url && localFont.family) {
      loadFont(localFont.url, localFont.family);
    }
  }, [localFont.url, localFont.family, loadFont]);

  // Load all fonts to show previews
  useEffect(() => {
    googleFonts.forEach(font => {
      loadFont(font.url, font.family);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFont]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          {t('title')}
        </label>
      </div>
      
      {/* Font preview */}
      <div className="space-y-3">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <div 
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: `${localFont.family}, system-ui, sans-serif` }}
          >
            {t('previewName')}
          </div>
          <div 
            className="text-sm text-gray-300"
            style={{ fontFamily: `${localFont.family}, system-ui, sans-serif` }}
          >
            {t('previewDescription')}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {t('currentFont')} {localFont.family}
          </div>
        </div>
      </div>

      {/* Font selector */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400">{t('availableFonts')} ({googleFonts.length}):</span>
        <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-600 rounded-lg p-2">
          {googleFonts.map((font) => {
            const isActive = localFont.family === font.family;
            
            return (
              <button
                key={font.family}
                onClick={() => handleFontChange({ family: font.family, url: font.url })}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:bg-gray-700 hover:border-gray-500 ${
                  isActive
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:text-white'
                }`}
              >
                <div 
                  className="text-base font-medium mb-1"
                  style={{ 
                    fontFamily: fontsLoaded.has(font.family) ? `${font.family}, system-ui, sans-serif` : 'system-ui, sans-serif'
                  }}
                >
                  {font.name}
                </div>
                <div 
                  className="text-sm text-gray-400 mb-1"
                  style={{ 
                    fontFamily: fontsLoaded.has(font.family) ? `${font.family}, system-ui, sans-serif` : 'system-ui, sans-serif'
                  }}
                >
                  {t('exampleText')}
                </div>
                <div className="text-xs text-gray-500">
                  {font.category} • Google Fonts
                </div>
                {!fontsLoaded.has(font.family) && isActive && (
                  <div className="text-xs text-blue-400 mt-1">
                    {t('loadingFont')}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}