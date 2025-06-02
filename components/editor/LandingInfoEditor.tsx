"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X, Save } from 'lucide-react';
import { API_URL, createAuthHeaders } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface LandingInfoEditorProps {
  landingId: string;
  initialName: string;
  initialDescription: string;
  onUpdate: (name: string, description: string) => void;
  className?: string;
}

export function LandingInfoEditor({ 
  landingId, 
  initialName, 
  initialDescription, 
  onUpdate, 
  className = '' 
}: LandingInfoEditorProps) {
  const t = useTranslations('landingInfoEditor');
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const [tempDescription, setTempDescription] = useState(initialDescription);

  // Sincronizar con props cuando cambien
  useEffect(() => {
    setName(initialName);
    setTempName(initialName);
  }, [initialName]);

  useEffect(() => {
    setDescription(initialDescription);
    setTempDescription(initialDescription);
  }, [initialDescription]);

  const updateLanding = async (updates: { name?: string; description?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/landings/${landingId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Actualizar estados locales
        if (updates.name !== undefined) {
          setName(updates.name);
          setTempName(updates.name);
        }
        if (updates.description !== undefined) {
          setDescription(updates.description);
          setTempDescription(updates.description);
        }
        
        // Notificar al componente padre
        onUpdate(
          updates.name !== undefined ? updates.name : name,
          updates.description !== undefined ? updates.description : description
        );
      } else {
        console.error('Error actualizando landing:', data.message);
        alert(data.message || t('errors.updateError'));
        
        // Revertir cambios temporales
        if (updates.name !== undefined) setTempName(name);
        if (updates.description !== undefined) setTempDescription(description);
      }
    } catch (error) {
      console.error('Error actualizando landing:', error);
      alert(t('errors.networkError'));
      
      // Revertir cambios temporales
      if (updates.name !== undefined) setTempName(name);
      if (updates.description !== undefined) setTempDescription(description);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSave = async () => {
    if (tempName.trim() && tempName !== name) {
      await updateLanding({ name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(name);
    setIsEditingName(false);
  };

  const handleDescriptionSave = async () => {
    if (tempDescription !== description) {
      await updateLanding({ description: tempDescription });
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setTempDescription(description);
    setIsEditingDescription(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      handleDescriptionCancel();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Edición del nombre */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">{t('nameLabel')}</label>
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder={t('namePlaceholder')}
              className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              disabled={isLoading}
              autoFocus
            />
            <Button
              onClick={handleNameSave}
              disabled={isLoading || !tempName.trim()}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white px-2"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleNameCancel}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <div 
              className="flex-1 p-2 bg-gray-800/30 border border-gray-700 rounded-md text-white min-h-[40px] flex items-center cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => setIsEditingName(true)}
            >
              {name || t('noName')}
            </div>
            <Button
              onClick={() => setIsEditingName(true)}
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-gray-700 px-2"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Edición de la descripción */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">{t('descriptionLabel')}</label>
        {isEditingDescription ? (
          <div className="space-y-2">
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              onKeyDown={handleDescriptionKeyDown}
              placeholder={t('descriptionPlaceholder')}
              className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
              rows={3}
              disabled={isLoading}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDescriptionSave}
                disabled={isLoading}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-1" />
                {t('save')}
              </Button>
              <Button
                onClick={handleDescriptionCancel}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                {t('cancel')}
              </Button>
              <span className="text-xs text-gray-400 ml-auto">
                {t('shortcuts')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 group">
            <div 
              className="flex-1 p-2 bg-gray-800/30 border border-gray-700 rounded-md text-white min-h-[60px] cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => setIsEditingDescription(true)}
            >
              {description || t('noDescription')}
            </div>
            <Button
              onClick={() => setIsEditingDescription(true)}
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-gray-700 px-2 mt-1"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
          {t('saving')}
        </div>
      )}
    </div>
  );
}