'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Reel, Keyword, PublicComment, Response } from '@/lib/types';
import { getReel, updateReelDescription, getMediaResponses, publishReel, updateReelUrl, getMediaKeywords, getReelPublicComments } from '@/lib/api';
import { MediaSection } from '@/components/media/MediaSection';
import PublicCommentsSection from './components/PublicCommentsSection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    PencilIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    PhotoIcon,
    ChatBubbleLeftIcon,
    KeyIcon,
    ChatBubbleLeftRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { CardSkeleton, HeaderSkeleton, ImageSkeleton } from '@/components/ui/skeleton';
import { InstagramReelsDialog } from '@/components/dialogs/InstagramReelsDialog';

// Importar la imagen
import DescriptionImage from '@/public/images/descriptions/description-story.png';

export default function EditReel() {
    const { id } = useParams();
    const router = useRouter();
    const reelId = parseInt(id as string);
    const [reel, setReel] = useState<Reel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUrlSaving, setIsUrlSaving] = useState(false);
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const [saveTimeoutUrl, setSaveTimeoutUrl] = useState<NodeJS.Timeout | null>(null);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [urlSaveTimeout, setUrlSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isChangingUrl, setIsChangingUrl] = useState(false);
    const responsesSectionRef = useRef<any>(null);
    const [thumbnailLoading, setThumbnailLoading] = useState(true);
    const [instagramReelsDialogOpen, setInstagramReelsDialogOpen] = useState(false);
    const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState<string>('');
    const [selectedReelCaption, setSelectedReelCaption] = useState<string>('');

    const extractInstagramReelId = (url: string) => {
        if (!url) return null;
        const regex = /(?:reel|p)\/([A-Za-z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    useEffect(() => {
        fetchReel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchReel = async () => {
        try {
            const reelResponse = await getReel(reelId);
            console.log('Datos del reel recibidos:', reelResponse);

            if (reelResponse.success) {
                // Asegurarnos de que no hay duplicados en las respuestas
                if (reelResponse.data.responses) {
                    const uniqueResponses = Array.from(new Map(reelResponse.data.responses.map(item => [item.media_id, item])).values());
                    reelResponse.data.responses = uniqueResponses;
                }
                
                // Asegurarnos de que el objeto cumple con la interfaz Reel
                const reelData = {
                    ...reelResponse.data,
                    media_type: 'reel' as const, // Forzar a que sea de tipo 'reel'
                    shortcode: (reelResponse.data as any).shortcode || '',
                    keywords: reelResponse.data.keywords || [],
                    publicComments: (reelResponse.data as any).publicComments || []
                } as Reel; // Conversión explícita a Reel
                
                setReel(reelData);
                setDescription(reelResponse.data.description || '');
                setUrl(reelResponse.data.url || '');

                // Cargar las respuestas, keywords y comentarios públicos después de tener el reel
                await Promise.all([
                    fetchResponses(reelData),
                    fetchKeywords(reelData),
                    fetchPublicComments(reelData)
                ]);
            } else {
                // Manejar el error específico de permisos - Reel no pertenece al usuario
                if (reelResponse.statusCode === 403) {
                    setError('No tienes permisos para acceder a este reel');
                    // Redirigir a la página principal después de un breve retraso
                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                } else {
                    setError('Error al cargar los datos del reel');
                }
            }
        } catch (err) {
            setError('Error al cargar los datos del reel');
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async (currentReel: Reel) => {
        try {
            const responsesResponse = await getMediaResponses(reelId);
            if (responsesResponse.success) {
                setReel({
                    ...currentReel,
                    responses: responsesResponse.data
                });
            }
        } catch (err) {
            console.error('Error al cargar las respuestas:', err);
        }
    };

    const fetchKeywords = async (currentReel: Reel) => {
        try {
            console.log('Cargando keywords...');
            const keywordsResponse = await getMediaKeywords(reelId);
            console.log('Keywords recibidas:', keywordsResponse);
            
            if (keywordsResponse.success) {
                // Asegurarnos de que las keywords no son nulas ni indefinidas
                const safeKeywords = keywordsResponse.data || [];
                console.log('Keywords que se van a establecer:', safeKeywords);
                
                // Actualizar el estado con las keywords recibidas
                setReel(prevReel => {
                    if (!prevReel) return currentReel;
                    return {
                        ...prevReel,
                        keywords: safeKeywords
                    };
                });
            }
        } catch (err) {
            console.error('Error al cargar las keywords:', err);
        }
    };

    const fetchPublicComments = async (currentReel: Reel) => {
        try {
            console.log('Cargando comentarios públicos...');
            const commentsResponse = await getReelPublicComments(reelId);
            console.log('Comentarios públicos recibidos:', commentsResponse);
            
            if (commentsResponse.success) {
                // Asegurarnos de que los comentarios públicos no son nulos ni indefinidos
                const safeComments = commentsResponse.data || [];
                console.log('Comentarios públicos que se van a establecer:', safeComments);
                
                // Actualizar el estado con los comentarios públicos recibidos
                setReel(prevReel => {
                    if (!prevReel) return currentReel;
                    return {
                        ...prevReel,
                        publicComments: safeComments
                    };
                });
            }
        } catch (err) {
            console.error('Error al cargar los comentarios públicos:', err);
        }
    };

    // Asegurarnos de que las keywords se actualicen cuando cambian
    useEffect(() => {
        if (reel?.id) {
            fetchKeywords(reel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reel?.id]);

    // Asegurarnos de que los comentarios públicos se carguen cuando cambia el reel
    useEffect(() => {
        if (reel?.id) {
            fetchPublicComments(reel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reel?.id]);

    // Si hay keywords o comentarios públicos en la respuesta inicial pero no se muestran, forzar una actualización
    useEffect(() => {
        if (reel) {
            if (reel.keywords && Array.isArray(reel.keywords) && reel.keywords.length > 0) {
                console.log('Keywords disponibles en reel:', reel.keywords);
            }
            if (reel.publicComments && Array.isArray(reel.publicComments) && reel.publicComments.length > 0) {
                console.log('Comentarios públicos disponibles en reel:', reel.publicComments);
            }
        }
    }, [reel]);

    // Cuando cambie el valor de thumbnailLoading o la URL de la miniatura, resetear isChangingUrl 
    useEffect(() => {
        if ((!thumbnailLoading && reel?.thumbnail_url) || selectedThumbnailUrl) {
            setIsChangingUrl(false);
        }
    }, [thumbnailLoading, reel?.thumbnail_url, selectedThumbnailUrl]);

    const handleGoBack = () => {
        router.back();
    };

    const handleAutoSave = async (newDescription: string, newUrl?: string) => {
        if (!reel) return;
        try {
            const response = await updateReelDescription(reel.id, newDescription, false, newUrl);
            if (response.success) {
                setReel({ ...reel, description: newDescription, url: newUrl || reel.url });
            }
        } catch (err) {
            console.error('Error en auto-guardado:', err);
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDescription(newValue);
        
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        const timeoutId = setTimeout(() => {
            handleAutoSave(newValue, url);
        }, 1000);

        setSaveTimeout(timeoutId);
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const oldValue = url;
        
        // Si está borrando la URL o cambiándola significativamente
        if ((oldValue && !newValue) || (oldValue && newValue && oldValue.length > 5 && !newValue.includes(oldValue.substring(0, 5)))) {
            setIsChangingUrl(true);
        }
        
        setUrl(newValue);
        setUrlError(null);
        
        // Mostrar estado de "cargando" inmediatamente
        if (newValue && newValue.includes('instagram.com/reel/')) {
            setIsChangingUrl(true);
        }
        
        // Solo auto-guardar si el reel ya está publicado
        if (reel?.url) {
            setIsUrlSaving(true);
            if (urlSaveTimeout) {
                clearTimeout(urlSaveTimeout);
            }
            
            const timeoutId = setTimeout(() => {
                handleAutoSaveUrl(newValue);
            }, 2000); // 2 segundos

            setUrlSaveTimeout(timeoutId);
        }
    };

    const handleAutoSaveUrl = async (newUrl: string) => {
        if (!reel) return;
        
        try {
            setIsUrlSaving(true);
            
            // Si la URL es de Instagram, intentar extraer la miniatura inmediatamente
            if (newUrl && newUrl.includes('instagram.com/reel/')) {
                // Actualizar primero con la URL, mientras se obtiene la miniatura
                setReel({
                    ...reel,
                    url: newUrl
                });
                
                // Mostrar que estamos actualizando
                setIsChangingUrl(true);
            }
            
            const response = await updateReelUrl(reel.id, newUrl);
            if (response.success) {
                // Preservar la miniatura existente si el backend no devuelve una
                const newThumbnailUrl = response.data.thumbnail_url || reel.thumbnail_url || selectedThumbnailUrl;
                
                // Actualizar el reel preservando la miniatura
                setReel({ 
                    ...reel, 
                    url: newUrl,
                    thumbnail_url: newThumbnailUrl
                });
                setUrlError(null);
                
                // Resetear la bandera de cambio de URL
                if (newThumbnailUrl) {
                    setIsChangingUrl(false);
                    // Forzar reinicio del estado de carga de la miniatura
                    setThumbnailLoading(true);
                    
                    // Si no tenemos una miniatura seleccionada pero tenemos una del backend, guardarla también en selectedThumbnailUrl
                    if (response.data.thumbnail_url && !selectedThumbnailUrl) {
                        setSelectedThumbnailUrl(response.data.thumbnail_url);
                    }
                } else if (newUrl && newUrl.includes('instagram.com/reel/')) {
                    // Si no tenemos miniatura pero la URL parece válida, intentar cargarla de nuevo en 2 segundos
                    setTimeout(() => {
                        fetchReelThumbnail(newUrl);
                    }, 2000);
                }
            } else {
                setUrlError('URL inválida');
            }
        } catch (err) {
            setUrlError('Error al actualizar la URL');
        } finally {
            setIsUrlSaving(false);
        }
    };

    // Nueva función para cargar específicamente la miniatura de un reel
    const fetchReelThumbnail = async (reelUrl: string) => {
        if (!reel) return;
        
        try {
            // Usar updateReelUrl de nuevo, pero esta vez específicamente para obtener la miniatura
            const response = await updateReelUrl(reel.id, reelUrl);
            
            if (response.success && response.data.thumbnail_url) {
                // Si tenemos éxito en obtener la miniatura, actualizar el estado
                setReel({
                    ...reel,
                    thumbnail_url: response.data.thumbnail_url
                });
                setSelectedThumbnailUrl(response.data.thumbnail_url);
                setIsChangingUrl(false);
                setThumbnailLoading(true);
            } else {
                // Si después del segundo intento sigue sin haber miniatura, mostrar un mensaje
                console.log('No se pudo obtener la miniatura del reel después de varios intentos');
                setIsChangingUrl(false);
            }
        } catch (err) {
            console.error('Error al obtener la miniatura:', err);
            setIsChangingUrl(false);
        }
    };

    const handleInstagramReelSelect = (reelUrl: string, thumbnailUrl: string, caption: string) => {
        setUrl(reelUrl);
        setSelectedThumbnailUrl(thumbnailUrl);
        setSelectedReelCaption(caption);
        
        // Actualizar la miniatura en el estado del reel para mostrarla inmediatamente
        if (reel) {
            setReel({
                ...reel,
                url: reelUrl,
                thumbnail_url: thumbnailUrl
            });
        }
        
        // Si el reel está en modo borrador y se selecciona un reel, actualizar inmediatamente
        if (!reel?.url) {
            handlePublishReel(reelUrl);
        } else {
            // Si ya está publicado, guardar la nueva URL
            setIsChangingUrl(true);
            handleAutoSaveUrl(reelUrl);
        }
    };

    const handlePublishReel = async (customUrl?: string) => {
        if (!reel) return;
        const urlToPublish = customUrl || url;

        if (!urlToPublish.trim()) return;

        setIsSaving(true);
        setError(null);
        try {
            const response = await publishReel(reel.id, urlToPublish, description);
            console.log("Respuesta de publicar reel:", response); // Para debug
            
            if (response.success) {
                // Creamos un nuevo objeto con todos los datos actualizados
                const updatedReel = {
                    ...reel,
                    description,
                    url: urlToPublish,
                    thumbnail_url: response.data.thumbnail_url
                };
                console.log("Nuevo estado del reel:", updatedReel); // Para debug
                
                // Actualizamos el estado completo
                setReel(updatedReel);
                setUrl(urlToPublish);
                
                // Resetear la bandera de cambio de URL
                setIsChangingUrl(false);
                
                // Forzar una re-renderización si es necesario
                setTimeout(() => {
                    setReel({...updatedReel});
                }, 100);
            } else {
                setError('Error al publicar el reel');
            }
        } catch (err) {
            console.error("Error al publicar:", err); // Para debug
            setError('Error al publicar el reel');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        return () => {
            if (saveTimeout) clearTimeout(saveTimeout);
            if (urlSaveTimeout) clearTimeout(urlSaveTimeout);
        };
    }, [saveTimeout, urlSaveTimeout]);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <HeaderSkeleton />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <CardSkeleton />
                            </div>
                            <div className="md:col-span-2">
                                <CardSkeleton />
                                <div className="mt-6">
                                    <CardSkeleton />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !reel) {
        return (
            <div className="min-h-screen bg-black py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="relative px-4 py-10 bg-[#111827] shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <div className="divide-y divide-gray-700">
                                <div className="py-8 text-base leading-6 space-y-4 text-red-400 sm:text-lg sm:leading-7">
                                    <p>{error || 'Reel no encontrado'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header sin fondo con título a la izquierda e imagen a la derecha */}
                    <div className="mb-8">
                        <div className="md:flex md:items-center w-full justify-between">
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center">
                                    <ArrowLeftIcon 
                                        className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" 
                                        onClick={handleGoBack}
                                    />
                                    <h1 className="text-2xl font-bold text-white flex items-center">
                                        <Image
                                            src="/images/icons/reel-icon.png"
                                            alt="Reel Icon"
                                            width={84}
                                            height={84}
                                            className="mr-2"
                                        />
                                        Editar Reel
                                    </h1>
                                </div>
                                <p className="text-gray-400 ml-6">
                                    Configura tu reel con palabras clave y respuestas automáticas
                                </p>
                            </div>

                            {/* Imagen de descripción sin fondo */}
                            <div className="mt-6 md:mt-0 md:w-1/3 flex justify-end">
                                <div className="relative w-full h-48 md:h-32 lg:h-48">
                                    <Image
                                        src={DescriptionImage}
                                        alt="Descripción del reel"
                                        fill
                                        className="object-contain"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 400px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Primera fila: Información del Reel y Palabras Clave */}
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
                            {/* Columna izquierda - URL y Descripción del Reel (40%) */}
                            <div className="md:col-span-4 bg-[#120724] rounded-lg overflow-hidden">
                                <div className="p-6 relative">
                                    {/* Estado del reel */}
                                    {!reel.url && (
                                        <div className="mb-4 text-center">
                                            <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-amber-400 bg-[#120724] border border-amber-500/70">
                                                DRAFT
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Título/Descripción */}
                                    <div className="text-center mb-4 relative">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Descripción
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={handleDescriptionChange}
                                            placeholder="Descripción de tu reel"
                                            className="w-full text-center text-xl font-semibold text-white bg-transparent hover:bg-[#1c1033] focus:bg-[#1c1033] rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-text border-b border-gray-600"
                                        />
                                        {isSaving && (
                                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                                Guardando...
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* URL del Reel */}
                                    <div className="mb-4 relative">
                                        <label className="block text-sm font-medium text-gray-400 mb-1 text-center">
                                            URL del Reel
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={handleUrlChange}
                                                placeholder="https://www.instagram.com/reel/..."
                                                className={`w-full text-white bg-transparent hover:bg-[#1c1033] focus:bg-[#1c1033] rounded-md px-4 py-2 focus:outline-none focus:ring-1 ${
                                                    urlError ? 'focus:ring-red-500 border-red-500' : 'focus:ring-indigo-500 border-b border-gray-600'
                                                }`}
                                            />
                                            {isUrlSaving && reel?.url && !urlError && (
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-r-transparent"></div>
                                                </div>
                                            )}
                                        </div>
                                        {urlError && (
                                            <p className="mt-1 text-xs text-red-500 text-center">
                                                {urlError}
                                            </p>
                                        )}

                                        <div className="relative mt-2">
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
                                            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-md border border-indigo-500/50 hover:bg-indigo-600/20"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-indigo-400"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                                            <span className="text-sm text-gray-200">Seleccionar reel de Instagram</span>
                                        </Button>
                                    </div>

                                    {/* Botón para guardar */}
                                    {!reel.url && url.trim() !== '' && (
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={() => handlePublishReel()}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {isSaving ? 'Publicando...' : 'Publicar Reel'}
                                            </button>
                                        </div>
                                    )}

                                    {/* iPhone con previsualización del reel */}
                                    <div className="relative w-[200px] h-[398px] mx-auto mt-6">
                                        {/* Marco del iPhone */}
                                        <img
                                            src="/images/iphone16-frame.png"
                                            alt="iPhone frame"
                                            className="absolute w-full h-full z-20 pointer-events-none"
                                        />
                                        
                                        {/* Contenido del iPhone (miniatura del reel) */}
                                        <div className="absolute top-0 left-0 right-0 bottom-0 z-10 flex items-center justify-center">
                                            {url && !isChangingUrl ? (
                                                <div className="relative w-full h-full overflow-hidden rounded-[36px]">
                                                    {(reel && ((reel.thumbnail_url && reel.thumbnail_url !== '' && reel.thumbnail_url.startsWith('http')) || selectedThumbnailUrl)) ? (
                                                        <div className="w-full h-full relative" key={(reel.thumbnail_url || selectedThumbnailUrl || 'placeholder') + new Date().getTime()}>
                                                            {thumbnailLoading && (
                                                                <ImageSkeleton className="absolute inset-0 z-10" />
                                                            )}
                                                            <Image 
                                                                src={reel.thumbnail_url && reel.thumbnail_url !== '' && reel.thumbnail_url.startsWith('http') 
                                                                    ? reel.thumbnail_url 
                                                                    : selectedThumbnailUrl} 
                                                                alt="Miniatura del reel"
                                                                fill
                                                                className={`object-cover transition-opacity duration-300 ${thumbnailLoading ? 'opacity-0' : 'opacity-100'}`}
                                                                unoptimized
                                                                loader={({ src }) => src}
                                                                onLoadingComplete={() => setThumbnailLoading(false)}
                                                                onError={() => setThumbnailLoading(false)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                            <span className="text-xs text-gray-400">Sin miniatura disponible</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="relative w-full h-full overflow-hidden rounded-[36px] bg-[#0a0a0a] flex items-center justify-center">
                                                    <div className="absolute top-0 left-0 right-0 h-[25px] bg-black rounded-t-[36px] z-10">
                                                        <div className="absolute top-[6px] left-0 right-0 mx-auto w-[65px] h-[15px] bg-black rounded-full"></div>
                                                    </div>
                                                    <div className="text-center p-3 mt-[25px]">
                                                        <PhotoIcon className="h-5 w-5 mx-auto text-gray-500" />
                                                        <p className="mt-1 text-[10px] text-gray-400 px-1">
                                                            {isChangingUrl 
                                                                ? "Actualizando URL, la miniatura aparecerá pronto..." 
                                                                : "La miniatura de tu reel aparecerá aquí cuando agregues una URL válida."}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-gray-400 px-1">
                                                            Cuando alguien escriba una de tus palabras clave, recibirá tu respuesta por DM 👍
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna derecha - Palabras Clave (60%) */}
                            <div className="md:col-span-6 bg-[#120724] rounded-lg overflow-hidden p-6">
                                <div className="flex items-center mb-4">
                                    <KeyIcon className="h-6 w-6 text-amber-400 mr-2" />
                                    <h2 className="text-xl font-bold text-white">Palabras Clave</h2>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    Configura hasta 5 palabras clave que cuando aparezcan en un comentario, activarán la respuesta automática.
                                </p>
                                <MediaSection
                                    mediaId={reel.id}
                                    mediaType="reel"
                                    keywords={reel.keywords || []}
                                    responses={[]}
                                    onKeywordsChange={(keywords) => {
                                        console.log('Actualizando keywords:', keywords);
                                        setReel((prevReel) => {
                                            if (!prevReel) return reel;
                                            return { ...prevReel, keywords };
                                        });
                                    }}
                                    onResponsesChange={() => {}}
                                    showSection="keywords"
                                />
                            </div>
                        </div>

                        {/* Segunda fila: Comentarios Públicos (todo el ancho) */}
                        <div className="bg-[#120724] rounded-lg overflow-hidden p-6">
                            <div className="flex items-center mb-4">
                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-amber-400 mr-2" />
                                <h2 className="text-xl font-bold text-white">Comentarios Públicos</h2>
                            </div>
                            <PublicCommentsSection
                                reelId={reel.id}
                                comments={reel.publicComments || []}
                                onCommentsChange={(comments) => setReel({ ...reel, publicComments: comments })}
                            />
                        </div>

                        {/* Tercera fila: Respuesta por DM (todo el ancho) */}
                        <div className="bg-[#120724] rounded-lg overflow-hidden p-6">
                            <div className="flex items-center mb-1">
                                <ChatBubbleLeftIcon className="h-6 w-6 text-amber-400 mr-2" />
                                <h2 className="text-xl font-bold text-white">Respuesta por DM</h2>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">
                                    Configura la respuesta automática que se enviará como mensaje directo cuando se detecten las palabras clave.
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                        if (responsesSectionRef.current && responsesSectionRef.current.openAIModal) {
                                            responsesSectionRef.current.openAIModal();
                                        }
                                    }}
                                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 text-white hover:from-indigo-600/30 hover:to-indigo-600/20 border-indigo-500/50"
                                >
                                    <SparklesIcon className="h-4 w-4 text-indigo-400" />
                                    <span>Generar con IA</span>
                                </Button>
                            </div>
                            <MediaSection
                                ref={responsesSectionRef}
                                mediaId={reel.id}
                                mediaType="reel"
                                keywords={[]}
                                responses={reel.responses || []}
                                onKeywordsChange={() => {}}
                                onResponsesChange={(responses) => setReel({ ...reel, responses })}
                                showSection="responses"
                                hideAIButton={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Diálogo de selección de reels de Instagram */}
            <InstagramReelsDialog 
                open={instagramReelsDialogOpen}
                onOpenChange={setInstagramReelsDialogOpen}
                onSelectReel={handleInstagramReelSelect}
            />
        </ProtectedRoute>
    );
} 