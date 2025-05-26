"use client";

import { useState, useCallback, useEffect } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';

interface EffectsConfiguration {
  showBadge?: boolean;
  typewriterEffect?: boolean;
}

interface EffectsSelectorProps {
  currentConfig: EffectsConfiguration;
  onConfigUpdate: (config: { effects: EffectsConfiguration }) => void;
  onConfigSave: (config: { effects: EffectsConfiguration }) => void;
}

export default function EffectsSelector({ 
  currentConfig, 
  onConfigUpdate, 
  onConfigSave 
}: EffectsSelectorProps) {
  console.log('EffectsSelector render:', currentConfig);
  const [localConfig, setLocalConfig] = useState<EffectsConfiguration>({
    showBadge: currentConfig.showBadge ?? true,
    typewriterEffect: currentConfig.typewriterEffect ?? true,
  });

  // Sincronizar con configuración externa cuando cambie
  useEffect(() => {
    setLocalConfig({
      showBadge: currentConfig.showBadge ?? true,
      typewriterEffect: currentConfig.typewriterEffect ?? true,
    });
  }, [currentConfig]);

  const handleToggle = useCallback((field: keyof EffectsConfiguration, value: boolean) => {
    console.log('EffectsSelector handleToggle:', field, value);
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    
    // Actualizar inmediatamente para ver cambios en tiempo real
    onConfigUpdate({ effects: newConfig });
    
    // Guardar en backend con debounce
    onConfigSave({ effects: newConfig });
  }, [localConfig, onConfigUpdate, onConfigSave]);

  return (
    <div className="border border-indigo-900/30 p-4 border-dashed rounded-md bg-[#120724] hover:bg-indigo-950/20">
      <div className="text-center mb-4 w-full">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Efectos Visuales</h3>
        </div>
        <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          Activa o desactiva efectos especiales para tu landing page
        </p>
      </div>

      <div className="space-y-4">
        {/* Badge de verificación */}
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">Badge de Verificación</h4>
            <p className="text-gray-400 text-sm">Muestra un badge azul de verificado al lado del nombre</p>
          </div>
          <input
            type="checkbox"
            checked={localConfig.showBadge}
            onChange={(e) => handleToggle('showBadge', e.target.checked)}
            className="ml-4 w-4 h-4 accent-purple-600"
          />
        </div>

        {/* Efecto typewriter */}
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">Efecto Máquina de Escribir</h4>
            <p className="text-gray-400 text-sm">La descripción aparece como si se estuviera escribiendo en tiempo real</p>
          </div>
          <input
            type="checkbox"
            checked={localConfig.typewriterEffect}
            onChange={(e) => handleToggle('typewriterEffect', e.target.checked)}
            className="ml-4 w-4 h-4 accent-purple-600"
          />
        </div>
      </div>
    </div>
  );
}