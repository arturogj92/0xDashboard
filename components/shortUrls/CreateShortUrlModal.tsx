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

interface CreateShortUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShortUrlData) => Promise<void>;
}

export function CreateShortUrlModal({ isOpen, onClose, onSubmit }: CreateShortUrlModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      setError('La URL original es requerida');
      return;
    }

    if (!userUsername) {
      setError('Necesitas configurar tu slug de usuario antes de crear URLs cortas');
      return;
    }

    if (slug && slugAvailable === false) {
      setError('El slug seleccionado no está disponible');
      return;
    }

    // Validar y añadir https si no tiene protocolo
    let validatedUrl = originalUrl.trim();
    if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
      validatedUrl = 'https://' + validatedUrl;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CreateShortUrlData = {
        originalUrl: validatedUrl,
        slug: slug || undefined,
        title: title || undefined,
        description: description || undefined
      };

      await onSubmit(data);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al crear la URL corta');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOriginalUrl('');
    setSlug('');
    setTitle('');
    setDescription('');
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#120724] border border-indigo-900/30 rounded-xl shadow-xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-8 h-8" style={{ color: '#d08216' }} />
            <DialogTitle className="text-xl font-semibold text-white">
              Crear enlace corto
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 mt-1">
            Convierte cualquier URL larga en un enlace corto y fácil de recordar
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
              URL Original *
            </label>
            <div className="relative">
              <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="originalUrl"
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="pl-10 bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500"
                placeholder="https://ejemplo.com/enlace-muy-largo..."
                required
              />
            </div>
          </div>

          {/* Slug personalizado */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-200 mb-2">
              Slug personalizado (opcional)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="pl-10 bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500"
                placeholder="mi-enlace-personalizado"
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
                {slugAvailable ? '✓ Slug disponible' : '✗ Slug no disponible'}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Solo letras minúsculas, números y guiones. Mínimo 3 caracteres.
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
              <p className="text-xs font-medium text-gray-300 mb-2">Vista previa:</p>
              <p className="text-sm text-indigo-300 font-mono break-all">
                {getPreviewUrl()}
              </p>
              {!loadingUsername && userUsername && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 Tip: Usa slugs descriptivos como "ofertas", "descuento", "curso-gratis" para mayor memorabilidad
                </p>
              )}
              {!userUsername && !loadingUsername && (
                <p className="text-xs text-gray-400 mt-2">
                  ⚠️ Configura tu slug de usuario arriba o desde tu perfil para crear URLs cortas
                </p>
              )}
            </div>
          )}

          {/* Título (opcional) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
              Título (opcional)
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500"
              placeholder="Título descriptivo del enlace"
              maxLength={100}
            />
          </div>

          {/* Descripción (opcional) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-md border-gray-700 bg-[#1c1033] py-2.5 px-3 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="Breve descripción del contenido del enlace"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Información sobre redes sociales */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-blue-200 font-medium mb-1">
                  Perfecto para redes sociales
                </p>
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  Las URLs cortas son ideales para Instagram, TikTok y Twitter donde los enlaces largos son difíciles de recordar y compartir.
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
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (slugTouched && slugAvailable === false)}
              className="rounded-md bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-2.5 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear enlace'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}