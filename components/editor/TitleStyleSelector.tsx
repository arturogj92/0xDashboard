"use client";

import { useState, useCallback, useEffect } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

interface TitleStyleConfiguration {
  fontSize?: string;
  gradientEnabled?: boolean;
  gradientColors?: {
    from: string;
    via?: string;
    to: string;
  };
  gradientDirection?: string;
}

interface TitleStyleSelectorProps {
  value: TitleStyleConfiguration;
  onChange: (config: TitleStyleConfiguration) => void;
  onSave: (config: TitleStyleConfiguration) => void;
}

// Note: fontSizeOptions will be moved inside component to use translations

const gradientPresets = [
  {
    name: 'Apple Blue',
    from: '#007AFF',
    via: '#5AC8FA',
    to: '#00D4FF',
    direction: 'to right'
  },
  {
    name: 'Sunset',
    from: '#FF6B6B',
    via: '#FFE66D',
    to: '#FF6B35',
    direction: 'to right'
  },
  {
    name: 'Ocean',
    from: '#667eea',
    via: '#764ba2',
    to: '#f093fb',
    direction: 'to right'
  },
  {
    name: 'Purple Rain',
    from: '#667eea',
    to: '#764ba2',
    direction: 'to bottom right'
  },
  {
    name: 'Fire',
    from: '#f12711',
    to: '#f5af19',
    direction: 'to right'
  },
  {
    name: 'Cool Blues',
    from: '#2196F3',
    via: '#21CBF3',
    to: '#2196F3',
    direction: 'to right'
  }
];

export default function TitleStyleSelector({ value, onChange, onSave }: TitleStyleSelectorProps) {
  const t = useTranslations('titleStyle');
  
  const fontSizeOptions = [
    { label: t('fontSizes.small'), value: 'text-lg', px: '18px' },
    { label: t('fontSizes.normal'), value: 'text-xl', px: '20px' },
    { label: t('fontSizes.large'), value: 'text-2xl', px: '24px' },
    { label: t('fontSizes.extraLarge'), value: 'text-3xl', px: '30px' },
    { label: t('fontSizes.giant'), value: 'text-4xl', px: '36px' },
  ];
  
  const [localConfig, setLocalConfig] = useState<TitleStyleConfiguration>({
    fontSize: value.fontSize || 'text-2xl',
    gradientEnabled: value.gradientEnabled ?? false,
    gradientColors: value.gradientColors || { from: '#007AFF', to: '#00D4FF' },
    gradientDirection: value.gradientDirection || 'to right',
  });

  // Sincronizar con props cuando cambien
  useEffect(() => {
    setLocalConfig({
      fontSize: value.fontSize || 'text-2xl',
      gradientEnabled: value.gradientEnabled ?? false,
      gradientColors: value.gradientColors || { from: '#007AFF', to: '#00D4FF' },
      gradientDirection: value.gradientDirection || 'to right',
    });
  }, [value]);

  // Debounce para guardar
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(localConfig);
    }, 500);
    return () => clearTimeout(timer);
  }, [localConfig, onSave]);

  const handleConfigChange = useCallback((newConfig: Partial<TitleStyleConfiguration>) => {
    const updatedConfig = { ...localConfig, ...newConfig };
    console.log('TitleStyleSelector - handleConfigChange:', updatedConfig);
    setLocalConfig(updatedConfig);
    onChange(updatedConfig);
  }, [localConfig, onChange]);

  const applyGradientPreset = (preset: typeof gradientPresets[0]) => {
    handleConfigChange({
      gradientColors: {
        from: preset.from,
        via: preset.via,
        to: preset.to
      },
      gradientDirection: preset.direction,
      gradientEnabled: true
    });
  };

  // Generar CSS para el gradiente
  const getGradientStyle = () => {
    if (!localConfig.gradientEnabled) {
      return { 
        color: '#ffffff',
        background: 'none',
        WebkitBackgroundClip: 'unset',
        WebkitTextFillColor: 'unset'
      };
    }
    
    const { from, via, to } = localConfig.gradientColors!;
    const direction = localConfig.gradientDirection;
    
    let gradientString = `linear-gradient(${direction}, ${from}`;
    if (via) gradientString += `, ${via}`;
    gradientString += `, ${to})`;
    
    return {
      background: gradientString,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      MozBackgroundClip: 'text',
      MozTextFillColor: 'transparent',
      color: 'transparent',
      display: 'inline-block',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    };
  };

  return (
    <div className="border border-indigo-900/30 p-4 border-dashed rounded-md bg-[#120724] hover:bg-indigo-950/20">
      <div className="text-center mb-4 w-full">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
        </div>
        <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          {t('description')}
        </p>
      </div>

      {/* Preview del título */}
      <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
        <p className="text-xs text-gray-400 mb-2 text-center">{t('preview')}:</p>
        <h2 
          key={`preview-${localConfig.gradientEnabled}-${JSON.stringify(localConfig.gradientColors)}`}
          className={`${localConfig.fontSize} font-semibold text-center`}
          style={getGradientStyle()}
        >
          {t('exampleName')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Tamaño de fuente */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">{t('titleSize')}</label>
          <div className="grid grid-cols-2 gap-2">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleConfigChange({ fontSize: option.value })}
                className={`p-2 rounded-lg border text-sm transition-all ${
                  localConfig.fontSize === option.value
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-purple-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle gradiente */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">{t('gradientEnabled')}</h4>
            <p className="text-gray-400 text-sm">{t('gradientDescription')}</p>
          </div>
          <input
            type="checkbox"
            checked={localConfig.gradientEnabled}
            onChange={(e) => handleConfigChange({ gradientEnabled: e.target.checked })}
            className="w-4 h-4 accent-purple-600"
          />
        </div>

        {/* Gradientes predefinidos */}
        {localConfig.gradientEnabled && (
          <div className="space-y-3">
            <label className="text-white font-medium text-sm">{t('predefinedGradients')}</label>
            <div className="grid grid-cols-2 gap-2">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyGradientPreset(preset)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-800/50 hover:border-purple-400 transition-all group"
                >
                  <div 
                    className="w-full h-4 rounded mb-2"
                    style={{
                      background: `linear-gradient(${preset.direction}, ${preset.from}${preset.via ? `, ${preset.via}` : ''}, ${preset.to})`
                    }}
                  />
                  <span className="text-xs text-gray-300 group-hover:text-white">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Colores personalizados */}
            <div className="space-y-3 border-t border-gray-700 pt-3">
              <label className="text-white font-medium text-sm">{t('customColors')}</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('initialColor')}</label>
                  <input
                    type="color"
                    value={localConfig.gradientColors!.from}
                    onChange={(e) => handleConfigChange({
                      gradientColors: { ...localConfig.gradientColors!, from: e.target.value }
                    })}
                    className="w-full h-8 rounded border border-gray-600 bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('finalColor')}</label>
                  <input
                    type="color"
                    value={localConfig.gradientColors!.to}
                    onChange={(e) => handleConfigChange({
                      gradientColors: { ...localConfig.gradientColors!, to: e.target.value }
                    })}
                    className="w-full h-8 rounded border border-gray-600 bg-transparent"
                  />
                </div>
              </div>
              
              {/* Color intermedio opcional */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('intermediateColor')}</label>
                <input
                  type="color"
                  value={localConfig.gradientColors!.via || '#ffffff'}
                  onChange={(e) => handleConfigChange({
                    gradientColors: { ...localConfig.gradientColors!, via: e.target.value }
                  })}
                  className="w-full h-8 rounded border border-gray-600 bg-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}