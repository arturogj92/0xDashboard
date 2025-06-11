'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LinkIcon, GlobeAltIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { checkSlugAvailability, getUserSlug, type CreateShortUrlData } from '@/lib/api';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { UserSlugConfiguration } from '@/components/auth/UserSlugConfiguration';
import { useTranslations } from 'next-intl';

interface CreateShortUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShortUrlData) => Promise<void>;
}

export function CreateShortUrlModal({ isOpen, onClose, onSubmit }: CreateShortUrlModalProps) {
  const { user } = useAuth();
  const t = useTranslations('shortUrls.createModal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [userUsername, setUserUsername] = useState<string | null>(null);
  const [loadingUsername, setLoadingUsername] = useState(true);

  // Cargar el slug del usuario
  useEffect(() => {
    const loadUserSlug = async () => {
      if (!user?.id || !isOpen) return;
      
      try {
        setLoadingUsername(true);
        const response = await getUserSlug();
        
        if (response.success && response.data.slug) {
          setUserUsername(response.data.slug);
        } else {
          // Si no tiene slug configurado, dejar null para que el usuario lo configure
          setUserUsername(null);
        }
        
      } catch (error) {
        console.error('Error loading user slug:', error);
        setUserUsername(null);
      } finally {
        setLoadingUsername(false);
      }
    };

    loadUserSlug();
  }, [user?.id, isOpen]);

  // Función para limpiar el slug (solo letras, números y guiones)
  const cleanSlug = (input: string) => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Verificar disponibilidad del slug
  const checkSlug = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const response = await checkSlugAvailability(slugToCheck);
      if (response.success) {
        setSlugAvailable(response.data.available);
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    } finally {
      setCheckingSlug(false);
    }
  };

  // Debounced slug check
  useEffect(() => {
    if (!slugTouched || !slug) return;
    
    const timer = setTimeout(() => {
      checkSlug(slug);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, slugTouched]);

  const handleSlugChange = (value: string) => {
    const cleanedSlug = cleanSlug(value);
    setSlug(cleanedSlug);
    setSlugTouched(true);
    setSlugAvailable(null);
  };

  // Función para normalizar URL agregando https:// y www. automáticamente
  const normalizeUrl = (url: string) => {
    let normalized = url.trim();
    
    // Agregar https:// si no tiene protocolo
    if (!normalized.match(/^https?:\/\//)) {
      normalized = 'https://' + normalized;
    }
    
    try {
      const urlObj = new URL(normalized);
      const hostname = urlObj.hostname;
      
      // Validar que el hostname tenga un TLD válido
      const tldPattern = /\.[a-z]{2,}$/i;
      if (!hostname.match(tldPattern)) {
        throw new Error(t('errors.invalidTld'));
      }
      
      // No agregar www. si:
      // - Ya tiene www.
      // - Es localhost o IP
      // - Ya tiene un subdominio (más de 2 partes antes del TLD)
      if (!hostname.startsWith('www.') && 
          !hostname.includes('localhost') && 
          !hostname.match(/^\d+\.\d+\.\d+\.\d+/) && 
          hostname.split('.').length === 2) {
        urlObj.hostname = 'www.' + hostname;
        normalized = urlObj.toString();
      }
      
      return normalized;
    } catch (error) {
      // Si hay error al parsear la URL o falta TLD válido, lanzar error
      if (error instanceof Error && error.message === t('errors.invalidTld')) {
        throw error;
      }
      throw new Error(t('errors.invalidUrl'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      setError(t('errors.urlRequired'));
      return;
    }

    if (!userUsername) {
      setError(t('errors.slugRequired'));
      return;
    }

    if (slug && slugAvailable === false) {
      setError(t('errors.slugUnavailable'));
      return;
    }

    // Validar y normalizar URL agregando https:// y www. automáticamente
    let validatedUrl;
    try {
      validatedUrl = normalizeUrl(originalUrl);
    } catch (urlError: any) {
      setError(urlError.message || t('errors.invalidUrl'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CreateShortUrlData = {
        originalUrl: validatedUrl,
        slug: slug || undefined
      };

      await onSubmit(data);
      resetForm();
    } catch (err: any) {
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOriginalUrl('');
    setSlug('');
    setError(null);
    setSlugAvailable(null);
    setSlugTouched(false);
    setUserUsername(null);
    setLoadingUsername(true);
  };

  // Callback cuando se actualiza el slug de usuario
  const handleSlugUpdated = (newSlug: string) => {
    setUserUsername(newSlug);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Generar preview de la URL corta
  const getPreviewUrl = () => {
    if (loadingUsername) return 'Cargando...';
    if (!userUsername) return 'No se pudo cargar el username';
    const baseUrl = `${userUsername}.creator0x.com`;
    const urlSlug = slug || 'tu-enlace';
    return `${baseUrl}/${urlSlug}`;
  };

  // Determinar si el botón de crear debe estar deshabilitado
  const isCreateButtonDisabled = () => {
    // Si está cargando, deshabilitar
    if (loading || loadingUsername) return true;
    
    // Si no hay URL original, deshabilitar
    if (!originalUrl.trim()) return true;
    
    // Si no hay username configurado, deshabilitar
    if (!userUsername) return true;
    
    // Si hay slug personalizado pero no está validado
    if (slug.trim()) {
      // Si el slug es muy corto, deshabilitar
      if (slug.length < 3) return true;
      
      // Si estamos verificando el slug, deshabilitar
      if (checkingSlug) return true;
      
      // Si el slug ha sido tocado pero no está disponible, deshabilitar
      if (slugTouched && slugAvailable === false) return true;
      
      // Si el slug ha sido tocado pero aún no sabemos si está disponible, deshabilitar
      if (slugTouched && slugAvailable === null) return true;
    }
    
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#120724] border border-indigo-900/30 rounded-xl shadow-xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-8 h-8" style={{ color: '#d08216' }} />
            <DialogTitle className="text-xl font-semibold text-white">
              {t('title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 mt-1">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* URL Original */}
          <div>
            <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-200 mb-2">
              {t('originalUrlLabel')} *
            </label>
            <div className="relative">
              <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="originalUrl"
                type="text"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="pl-10 bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500"
                placeholder={t('originalUrlPlaceholder')}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              💡 {t('urlHelpText')}
            </p>
          </div>

          {/* Slug personalizado */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-200 mb-2">
              {t('slugLabel')}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="pl-10 bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500"
                placeholder={t('slugPlaceholder')}
                minLength={3}
                maxLength={50}
              />
              {checkingSlug && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full"></div>
                </div>
              )}
              {slugTouched && !checkingSlug && slugAvailable !== null && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {slugAvailable ? (
                    <CheckIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {slugTouched && !checkingSlug && slugAvailable !== null && (
              <p className={`text-xs mt-1 ${slugAvailable ? 'text-green-400' : 'text-red-400'}`}>
                {slugAvailable ? t('slugStatus.available') : t('slugStatus.unavailable')}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {t('slugHelpText')}
            </p>
          </div>

          {/* Configuración del slug de usuario */}
          <UserSlugConfiguration
            variant="modal"
            onSlugUpdated={handleSlugUpdated}
            showTitle={!userUsername && !loadingUsername}
            autoLoad={isOpen}
            className={(!userUsername && !loadingUsername) ? '' : 'hidden'}
          />

          {/* Preview de la URL */}
          {user?.id && (
            <div className="bg-[#1c1033]/50 border border-indigo-900/30 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-300 mb-2">{t('previewLabel')}</p>
              <p className="text-sm text-indigo-300 font-mono break-all">
                {getPreviewUrl()}
              </p>
              {!loadingUsername && userUsername && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 Tip: Usa slugs descriptivos como &quot;ofertas&quot;, &quot;descuento&quot;, &quot;curso-gratis&quot; para mayor memorabilidad
                </p>
              )}
              {!userUsername && !loadingUsername && (
                <p className="text-xs text-gray-400 mt-2">
                  ⚠️ Configura tu slug de usuario arriba o desde tu perfil para crear URLs cortas
                </p>
              )}
            </div>
          )}


          {/* Información sobre redes sociales */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-blue-200 font-medium mb-1">
                  {t('socialMediaInfo')}
                </p>
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  {t('socialMediaDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6 pt-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="rounded-md border-gray-700 bg-[#1c1033] text-white hover:bg-[#2c1b4d] px-8 py-2.5"
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isCreateButtonDisabled()}
              className="rounded-md bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('creating') : checkingSlug ? t('validating') : t('createButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}