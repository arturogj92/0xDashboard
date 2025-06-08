'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getUserSlug, updateUserSlug } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

interface UserSlugConfigurationProps {
  // Personalización del comportamiento
  variant?: 'modal' | 'profile' | 'wizard';
  onSlugUpdated?: (slug: string) => void;
  showTitle?: boolean;
  autoLoad?: boolean;
  className?: string;
}

export function UserSlugConfiguration({ 
  variant = 'modal', 
  onSlugUpdated,
  showTitle = true,
  autoLoad = true,
  className = ''
}: UserSlugConfigurationProps) {
  const { user } = useAuth();
  const t = useTranslations('components.userSlugConfiguration');
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [loading, setLoading] = useState(autoLoad);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Función para limpiar el slug (solo letras, números y guiones)
  const cleanSlug = (input: string) => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Cargar slug actual
  const loadCurrentSlug = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getUserSlug();
      
      if (response.success && response.data.slug) {
        setCurrentSlug(response.data.slug);
        setNewSlug(response.data.slug);
      } else {
        setCurrentSlug(null);
        setNewSlug('');
      }
    } catch (err) {
      console.error('Error loading user slug:', err);
      setError(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  // Guardar slug
  const handleSaveSlug = async () => {
    if (!newSlug || newSlug.length < 3) {
      setError(t('errorMinLength'));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateUserSlug(newSlug);
      if (response.success) {
        setCurrentSlug(response.data.slug);
        setNewSlug(response.data.slug);
        setIsEditing(false);
        
        // Mensaje de éxito personalizado según el contexto
        if (response.data.stored_as_preference) {
          setSuccess(t('successPreference'));
        } else {
          setSuccess(t('successUpdated'));
        }

        // Notificar al componente padre
        if (onSlugUpdated) {
          onSlugUpdated(response.data.slug);
        }
      } else {
        setError(response.message || t('errorSaving'));
      }
    } catch (err) {
      setError(t('errorSaving'));
      console.error('Error saving user slug:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewSlug(currentSlug || '');
    setError(null);
    setSuccess(null);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  // Auto-cargar si está habilitado
  useEffect(() => {
    if (autoLoad && user?.id) {
      loadCurrentSlug();
    }
  }, [user?.id, autoLoad]);

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Estilos según variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'modal':
        return {
          container: 'bg-indigo-900/20 border border-indigo-600/30 rounded-lg p-4',
          title: 'text-sm font-semibold text-indigo-300 mb-2',
          description: 'text-xs text-gray-300 mb-3',
          button: 'bg-indigo-600 hover:bg-indigo-700'
        };
      case 'profile':
        return {
          container: 'bg-[#120724] border border-indigo-900/30 rounded-lg p-6',
          title: 'text-lg font-semibold text-white mb-2',
          description: 'text-sm text-gray-300 mb-4',
          button: 'bg-indigo-600 hover:bg-indigo-700'
        };
      case 'wizard':
        return {
          container: 'bg-purple-900/20 border border-purple-600/30 rounded-lg p-4',
          title: 'text-sm font-semibold text-purple-300 mb-2',
          description: 'text-xs text-gray-300 mb-3',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      default:
        return {
          container: 'bg-gray-900/20 border border-gray-600/30 rounded-lg p-4',
          title: 'text-sm font-semibold text-gray-300 mb-2',
          description: 'text-xs text-gray-300 mb-3',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const styles = getVariantStyles();

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Si no tiene slug y no está editando, mostrar creación
  if (!currentSlug && !isEditing) {
    return (
      <div className={`${styles.container} ${className}`}>
        {showTitle && (
          <h4 className={styles.title}>
            🎯 {t('title')}
          </h4>
        )}
        <p className={styles.description}>
          {variant === 'wizard' 
            ? t('descriptionWizard')
            : t('descriptionModal')
          }
        </p>
        
        <div className="space-y-3">
          <div>
            <Input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(cleanSlug(e.target.value))}
              className="bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500"
              placeholder={t('placeholder')}
              disabled={saving}
            />
            {error && (
              <p className="text-xs text-red-400 mt-1">{error}</p>
            )}
            {success && (
              <p className="text-xs text-green-400 mt-1">{success}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              onClick={handleSaveSlug}
              disabled={!newSlug || newSlug.length < 3 || saving}
              className={`${styles.button} text-white text-xs px-3 py-1 h-auto`}
            >
              {saving ? t('saving') : t('createSlug')}
            </Button>
            <p className="text-xs text-gray-400">
              {t('preview')} <span className="text-indigo-300">{newSlug || t('placeholder')}.creator0x.com</span>
            </p>
          </div>
          
          {variant === 'modal' && (
            <p className="text-xs text-gray-400">
              💡 {t('tipsModal')}
            </p>
          )}
          {variant === 'wizard' && (
            <p className="text-xs text-gray-400">
              💡 {t('tipsModalWizard')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si tiene slug, mostrar información actual con opción de editar
  if (currentSlug && !isEditing) {
    return (
      <div className={`${styles.container} ${className}`}>
        {showTitle && (
          <h4 className={styles.title}>
            ✅ {t('titleCreated')}
          </h4>
        )}
        <div className="space-y-3">
          <div className="bg-[#1c1033]/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('currentUrl')}</p>
            <p className="text-sm text-indigo-300 font-mono break-all">
              {currentSlug}.creator0x.com
            </p>
          </div>
          
          {success && (
            <p className="text-xs text-green-400">{success}</p>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleStartEdit}
              className={`${styles.button} text-white text-xs px-3 py-1 h-auto`}
            >
              {t('changeSlug')}
            </Button>
            {variant === 'modal' && (
              <p className="text-xs text-gray-400">
                {t('tipsProfile')}
              </p>
            )}
            {variant === 'wizard' && (
              <p className="text-xs text-gray-400">
                {t('tipsWizard')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Si está editando
  if (isEditing) {
    return (
      <div className={`${styles.container} ${className}`}>
        {showTitle && (
          <h4 className={styles.title}>
            ✏️ {t('titleEdit')}
          </h4>
        )}
        <div className="space-y-3">
          <div>
            <Input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(cleanSlug(e.target.value))}
              className="bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500"
              placeholder="mi-usuario"
              disabled={saving}
            />
            {error && (
              <p className="text-xs text-red-400 mt-1">{error}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              onClick={handleSaveSlug}
              disabled={!newSlug || newSlug.length < 3 || saving || newSlug === currentSlug}
              className={`${styles.button} text-white text-xs px-3 py-1 h-auto`}
            >
              {saving ? t('saving') : t('updateSlug')}
            </Button>
            <Button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 h-auto"
            >
              {t('cancel')}
            </Button>
          </div>
          
          <p className="text-xs text-gray-400">
            {t('preview')} <span className="text-indigo-300">{newSlug || currentSlug}.creator0x.com</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
}