"use client";

import { useState, useCallback, useEffect } from "react";
import { UserIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

interface AvatarDisplayConfiguration {
  showAvatar?: boolean;
}

interface AvatarDisplaySelectorProps {
  value: AvatarDisplayConfiguration;
  onChange: (config: AvatarDisplayConfiguration) => void;
  onSave: (config: AvatarDisplayConfiguration) => void;
}

export default function AvatarDisplaySelector({ value, onChange, onSave }: AvatarDisplaySelectorProps) {
  const t = useTranslations('avatarDisplaySelector');
  const [localConfig, setLocalConfig] = useState<AvatarDisplayConfiguration>({
    showAvatar: value.showAvatar ?? true,
  });

  // Sincronizar con props cuando cambien
  useEffect(() => {
    setLocalConfig({
      showAvatar: value.showAvatar ?? true,
    });
  }, [value]);

  // Debounce para guardar
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(localConfig);
    }, 500);
    return () => clearTimeout(timer);
  }, [localConfig, onSave]);

  const handleConfigChange = useCallback((showAvatar: boolean) => {
    const updatedConfig = { showAvatar };
    setLocalConfig(updatedConfig);
    onChange(updatedConfig);
  }, [onChange]);

  return (
    <div className="border border-indigo-900/30 p-4 border-dashed rounded-md bg-[#120724] hover:bg-indigo-950/20">
      <div className="text-center mb-4 w-full">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-lg shadow-lg">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
        </div>
        <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          {t('description')}
        </p>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
        <p className="text-xs text-gray-400 mb-3 text-center">{t('preview')}:</p>
        <div className="flex flex-col items-center gap-2">
          {localConfig.showAvatar && (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-300" />
            </div>
          )}
          <h2 className="text-lg font-semibold text-white">
            {t('exampleName')}
          </h2>
        </div>
      </div>

      {/* Opciones */}
      <div className="space-y-3">
        <div 
          onClick={() => handleConfigChange(true)}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            localConfig.showAvatar
              ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
              : 'border-gray-600 bg-gray-800/50 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${localConfig.showAvatar ? 'text-purple-300' : 'text-white'}`}>
                {t('withAvatar.title')}
              </h4>
              <p className="text-sm text-gray-400">
                {t('withAvatar.description')}
              </p>
            </div>
            {localConfig.showAvatar && (
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div 
          onClick={() => handleConfigChange(false)}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            !localConfig.showAvatar
              ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
              : 'border-gray-600 bg-gray-800/50 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-400">Aa</span>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${!localConfig.showAvatar ? 'text-purple-300' : 'text-white'}`}>
                {t('nameOnly.title')}
              </h4>
              <p className="text-sm text-gray-400">
                {t('nameOnly.description')}
              </p>
            </div>
            {!localConfig.showAvatar && (
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}