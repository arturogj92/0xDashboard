'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Reel, Keyword, PublicComment, Response } from '@/lib/types';
import { getReel, updateReelDescription, getMediaResponses, publishReel, updateReelUrl, getReelKeywords, getReelPublicComments } from '@/lib/api';
import { MediaSection } from '@/components/media/MediaSection';
import PublicCommentsSection from './components/PublicCommentsSection';
import {
    PencilIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    PhotoIcon,
    ChatBubbleLeftIcon,
    KeyIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

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
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [urlSaveTimeout, setUrlSaveTimeout] = useState<NodeJS.Timeout | null>(null);

    const extractInstagramReelId = (url: string) => {
        if (!url) return null;
        const regex = /(?:reel|p)\/([A-Za-z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const getThumbnailUrl = (url: string) => {
        if (!url) return null;
        const reelId = extractInstagramReelId(url);
        if (reelId) {
            return `https://www.instagram.com/p/${reelId}/media/?size=l`;
        }
        return null;
    };

    useEffect(() => {
        fetchReel();
    }, []);

    useEffect(() => {
        // Actualizar la miniatura cuando cambia la URL
        setThumbnailUrl(getThumbnailUrl(url));
    }, [url]);

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
                setThumbnailUrl(getThumbnailUrl(reelResponse.data.url || ''));

                // Cargar las respuestas, keywords y comentarios públicos después de tener el reel
                await Promise.all([
                    fetchResponses(reelData),
                    fetchKeywords(reelData),
                    fetchPublicComments(reelData)
                ]);
            } else {
                setError('Error al cargar los datos del reel');
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
            const keywordsResponse = await getReelKeywords(reelId);
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
    }, [reel?.id]);

    // Asegurarnos de que los comentarios públicos se carguen cuando cambia el reel
    useEffect(() => {
        if (reel?.id) {
            fetchPublicComments(reel);
        }
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

    const handleAutoSaveUrl = async (newUrl: string) => {
        if (!reel) return;
        
        try {
            setIsUrlSaving(true);
            const response = await updateReelUrl(reel.id, newUrl);
            if (response.success) {
                setReel({ ...reel, url: newUrl });
                setUrlError(null);
            } else {
                setUrlError('URL inválida');
            }
        } catch (err) {
            setUrlError('Error al actualizar la URL');
        } finally {
            setIsUrlSaving(false);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setUrl(newValue);
        setUrlError(null);
        
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

    // Función para publicar el reel
    const handlePublishReel = async () => {
        if (!reel || !url.trim()) return;

        setIsSaving(true);
        setError(null);
        try {
            const response = await publishReel(reel.id, url, description);
            if (response.success) {
                setReel({ ...reel, description, url });
            } else {
                setError('Error al publicar el reel');
            }
        } catch (err) {
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
            <div className="flex justify-center items-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
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
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header sin fondo con título a la izquierda e imagen a la derecha */}
                <div className="mb-8">
                    <div className="md:flex md:items-center md:justify-between w-full">
                        <div className="flex items-center">
                            <button
                                onClick={handleGoBack}
                                className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none"
                                aria-label="Volver atrás"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <div className="ml-2">
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
                                <p className="text-gray-400">
                                    Configura tu reel con palabras clave y respuestas automáticas
                                </p>
                            </div>
                        </div>

                        {/* Imagen de descripción sin fondo */}
                        <div className="mt-6 md:mt-0 md:w-1/3">
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
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Borrador
                                        </span>
                                    </div>
                                )}
                                
                                {/* URL del Reel */}
                                <div className="mb-4 relative">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
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
                                        <p className="mt-1 text-xs text-red-500">
                                            {urlError}
                                        </p>
                                    )}
                                </div>
                                
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

                                {/* Botón para guardar */}
                                {!reel.url && url.trim() !== '' && (
                                    <div className="flex justify-center mt-4">
                                        <button
                                            onClick={handlePublishReel}
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
                                        {url ? (
                                            <div className="relative w-full h-full overflow-hidden rounded-[36px]">
                                                {thumbnailUrl ? (
                                                    <div className="w-full h-full relative">
                                                        <Image 
                                                            src={thumbnailUrl} 
                                                            alt="Miniatura del reel"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <span className="text-xs text-gray-400">Cargando miniatura...</span>
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
                                                        La miniatura de tu reel aparecerá aquí cuando agregues una URL válida.
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
                        <p className="text-sm text-gray-400 mb-2">
                            Configura la respuesta automática que se enviará como mensaje directo cuando se detecten las palabras clave.
                        </p>
                        <MediaSection
                            mediaId={reel.id}
                            mediaType="reel"
                            keywords={[]}
                            responses={reel.responses || []}
                            onKeywordsChange={() => {}}
                            onResponsesChange={(responses) => setReel({ ...reel, responses })}
                            showSection="responses"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 