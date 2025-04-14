'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Instagram, Play, Pause } from 'lucide-react';
import { createReel, createStory } from '@/lib/api';
import Image from 'next/image';
import { InstagramReelsDialog } from '@/components/dialogs/InstagramReelsDialog';

interface CreateMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaType: 'reel' | 'story';
  onSuccess: (id: number) => void;
}

export function CreateMediaModal({ open, onOpenChange, mediaType, onSuccess }: CreateMediaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [urlValue, setUrlValue] = useState('');
  const [description, setDescription] = useState('');
  const [instagramReelsDialogOpen, setInstagramReelsDialogOpen] = useState(false);
  const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState<string>('');
  const [selectedReelCaption, setSelectedReelCaption] = useState<string>('');
  const [showThumbnail, setShowThumbnail] = useState(false);

  const isReelType = mediaType === 'reel';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isReelType) {
        const response = await createReel({
          url: isDraft ? '' : urlValue,
          description,
          is_active: isActive,
          media_type: 'reel'
        }, isDraft);

        if (response.success) {
          onSuccess(response.data.id);
          resetForm();
        } else {
          setError('Error al crear el reel');
        }
      } else {
        const response = await createStory({
          url: '',
          description,
          is_active: isActive,
          media_type: 'story'
        });

        if (response.success) {
          onSuccess(response.data.id);
          resetForm();
        } else {
          setError('Error al crear la historia');
        }
      }
    } catch (err) {
      setError(`Error al crear ${isReelType ? 'el reel' : 'la historia'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrlValue('');
    setDescription('');
    setIsDraft(false);
    setIsActive(true);
    setError(null);
    setSelectedThumbnailUrl('');
    setSelectedReelCaption('');
    setShowThumbnail(false);
  };

  const handleCloseModal = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleDraftChange = () => {
    setIsDraft(!isDraft);
    if (!isDraft) {
      setUrlValue('');
      setShowThumbnail(false);
      setSelectedThumbnailUrl('');
      setSelectedReelCaption('');
    }
  };

  const handleActiveChange = () => {
    setIsActive(!isActive);
  };

  const handleInstagramReelSelect = (reelUrl: string, thumbnailUrl: string, caption: string) => {
    setUrlValue(reelUrl);
    setSelectedThumbnailUrl(thumbnailUrl);
    setSelectedReelCaption(caption);
    setShowThumbnail(!!thumbnailUrl);
    
    // Si está en modo borrador y selecciona un reel, desactivar el modo borrador
    if (isDraft) {
      setIsDraft(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className={`max-w-md bg-[#120724] ${isReelType && isDraft 
            ? 'border-2 border-amber-500/70' 
            : 'border border-indigo-900/30'
          } rounded-xl shadow-xl`}
        >
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <Image
                src={`/images/icons/${isReelType ? 'reel' : 'story'}-icon.png`}
                alt={isReelType ? "Reel Icon" : "Story Icon"}
                width={36}
                height={36}
                className="mr-[-10px]"
              />
              <DialogTitle className="text-xl font-semibold text-white">
                {isReelType ? 'Nueva automatización de Reel' : 'Nueva automatización de Historia'}
                {isReelType && isDraft && (
                  <span className="inline-flex items-center rounded-md px-2.5 py-1 ml-2 text-xs font-medium text-amber-400 bg-[#120724] border border-amber-500/70">
                    DRAFT
                  </span>
                )}
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 mt-1">
              {isReelType 
                ? 'Añade un nuevo reel para configurar respuestas automáticas' 
                : 'Añade una nueva historia para configurar respuestas automáticas'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {isReelType && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-200 mb-2">
                  URL del Reel
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="url"
                        name="url"
                        id="url"
                        required={!isDraft}
                        disabled={isDraft}
                        value={urlValue}
                        onChange={(e) => {
                          setUrlValue(e.target.value);
                          // Si se borra la URL, quitar la miniatura
                          if (!e.target.value) {
                            setShowThumbnail(false);
                          }
                        }}
                        className="block w-full rounded-md border-gray-700 bg-[#1c1033] py-2.5 px-3 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm disabled:bg-gray-900"
                        placeholder={isDraft ? "No requerido en modo borrador" : "https://www.instagram.com/reel/..."}
                      />
                    </div>
                  </div>
                  
                  {/* Añadir miniatura si está disponible */}
                  {!isDraft && showThumbnail && selectedThumbnailUrl && (
                    <div className="flex items-center p-2 bg-[#1c1033]/50 rounded-md mt-2">
                      <div className="relative w-16 h-28 overflow-hidden rounded-md mr-3">
                        <Image 
                          src={selectedThumbnailUrl}
                          alt="Vista previa del reel"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-300 font-medium mb-1">Reel seleccionado:</p>
                        <p className="text-xs text-gray-400 line-clamp-2">{selectedReelCaption}</p>
                      </div>
                    </div>
                  )}

                  {!isDraft && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-[#120724] px-2 text-xs text-gray-400">
                            o
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setInstagramReelsDialogOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-indigo-500/50 hover:bg-indigo-600/20"
                      >
                        <Instagram className="h-5 w-5 text-indigo-400" />
                        <span className="text-sm text-gray-200">Seleccionar reel de Instagram</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                Descripción
              </label>
              <div>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  required={true}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-md border-gray-700 bg-[#1c1033] py-2.5 px-3 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  placeholder={`Descripción ${isReelType ? 'del reel' : 'de la historia'}...`}
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex justify-end space-x-3 pt-2">
              <div className="flex items-center space-x-3">
                <Toggle
                  id="is_active"
                  pressed={isActive}
                  onPressedChange={handleActiveChange}
                  className={`flex items-center space-x-2 bg-[#1c1033] hover:bg-[#2c1b4d] border ${
                    isActive 
                      ? 'border-green-500 text-green-500' 
                      : 'border-red-500 text-red-500'
                  } rounded-md px-3 py-1.5`}
                >
                  {isActive ? (
                    <Play className="h-4 w-4 mr-1.5 text-green-500" />
                  ) : (
                    <Pause className="h-4 w-4 mr-1.5 text-red-500" />
                  )}
                  <span className={`text-sm ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </Toggle>
                
                {isReelType && (
                  <Toggle
                    id="is_draft"
                    pressed={isDraft}
                    onPressedChange={handleDraftChange}
                    className={`flex items-center space-x-2 bg-[#1c1033] hover:bg-[#2c1b4d] border ${isDraft ? 'border-amber-500/70' : 'border-gray-700'} rounded-md px-3 py-1.5`}
                  >
                    {isDraft ? (
                      <DocumentTextIcon className="h-4 w-4 text-amber-400 mr-1.5" />
                    ) : (
                      <DocumentTextIcon className="h-4 w-4 opacity-50 mr-1.5" />
                    )}
                    <span className={`text-sm ${isDraft ? 'text-amber-400' : 'text-gray-200'}`}>
                      {'Draft'}
                    </span>
                  </Toggle>
                )}
              </div>
            </div>

            {isDraft && (
              <div className="mt-3 p-3 text-xs rounded-md bg-amber-900/20 border border-amber-500/30 text-amber-300">
                <p>
                  El modo Draft te permite preparar la automatización (respuestas, palabras clave) antes de publicar el reel. 
                  Una vez que publiques tu reel en Instagram, añade la URL o selecciona el reel y el modo Draft se desactivará automáticamente.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseModal}
                className="rounded-md border-gray-700 bg-[#1c1033] text-white hover:bg-[#2c1b4d] px-8 py-2.5"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="rounded-md bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-2.5"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <InstagramReelsDialog 
        open={instagramReelsDialogOpen}
        onOpenChange={setInstagramReelsDialogOpen}
        onSelectReel={handleInstagramReelSelect}
      />
    </>
  );
} 