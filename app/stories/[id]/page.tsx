'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Story, Keyword, Response } from '@/lib/types';
import { getStory, updateStoryDescription, getMediaResponses, getMediaKeywords } from '@/lib/api';
import { MediaSection } from '@/components/media/MediaSection';
import {
    PencilIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    PhotoIcon,
    KeyIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

// Importar la imagen
import DescriptionImage from '@/public/images/descriptions/description-story.png';

export default function EditStory() {
    const { id } = useParams();
    const router = useRouter();
    const storyId = parseInt(id as string);
    const [story, setStory] = useState<Story | null>(null);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [responses, setResponses] = useState<Response[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchStory();
        fetchKeywords();
        fetchResponses();
    }, []);

    const fetchStory = async () => {
        try {
            const response = await getStory(storyId);
            if (response.success) {
                setStory(response.data);
                setDescription(response.data.description || '');
            } else {
                setError('Error al cargar la story');
            }
        } catch (err) {
            setError('Error al cargar la story');
        } finally {
            setLoading(false);
        }
    };

    const fetchKeywords = async () => {
        try {
            const response = await getMediaKeywords(storyId);
            if (response.success) {
                setKeywords(response.data);
            }
        } catch (err) {
            console.error('Error al cargar las palabras clave:', err);
        }
    };

    const fetchResponses = async () => {
        try {
            const response = await getMediaResponses(storyId);
            console.log('Respuestas cargadas:', response);
            if (response.success) {
                setResponses(response.data);
            }
        } catch (err) {
            console.error('Error al cargar las respuestas:', err);
        }
    };

    const handleSaveDescription = async () => {
        if (!storyId) {
            setError('ID de historia no válido');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await updateStoryDescription(storyId, description);
            if (response.success) {
                setStory(response.data);
                setIsEditing(false);
            } else {
                setError(response.message || 'Error al guardar la descripción');
            }
        } catch (err) {
            setError('Error al guardar la descripción');
        } finally {
            setIsSaving(false);
        }
    };

    // Manejar el autoguardado
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDescription(newValue);
        
        // Limpiar el timeout anterior si existe
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Establecer un nuevo timeout para guardar después de 1 segundo
        // Capturamos el valor actual de newValue para asegurar que la última letra se guarde
        const timeout = setTimeout(() => {
            // Usamos el valor capturado de newValue en lugar del estado que podría no estar actualizado
            updateStoryDescription(storyId, newValue)
                .then((response) => {
                    if (response.success) {
                        setStory(response.data);
                        setIsSaving(false);
                    } else {
                        setError(response.message || 'Error al guardar la descripción');
                        setIsSaving(false);
                    }
                })
                .catch(() => {
                    setError('Error al guardar la descripción');
                    setIsSaving(false);
                });
            
            setIsSaving(true);
        }, 1000);
        
        setSaveTimeout(timeout);
    };

    // Limpiar el timeout cuando el componente se desmonta
    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
        };
    }, [saveTimeout]);

    const handleGoBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="min-h-screen bg-black py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="relative px-4 py-10 bg-[#111827] shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <div className="divide-y divide-gray-700">
                                <div className="py-8 text-base leading-6 space-y-4 text-red-400 sm:text-lg sm:leading-7">
                                    <p>{error || 'Story no encontrada'}</p>
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
                                        src="/images/icons/story-icon.png"
                                        alt="Story Icon"
                                        width={84}
                                        height={84}
                                        className="mr-2"
                                    />
                                    Editar Historia
                                </h1>
                                <p className="text-gray-400">
                                    Configura tu historia con palabras clave y respuestas automáticas
                                </p>
                            </div>
                        </div>

                        {/* Imagen de descripción sin fondo */}
                        <div className="mt-6 md:mt-0 md:w-1/3">
                            <div className="relative w-full h-48 md:h-32 lg:h-48">
                                <Image
                                    src={DescriptionImage}
                                    alt="Descripción de la historia"
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
                    {/* Descripción y Palabras Clave en dos columnas con proporción 30/70 */}
                    <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
                        {/* Sección de Descripción (30%) - Nuevo diseño como en la imagen de referencia */}
                        <div className="md:col-span-4 bg-[#120724] rounded-lg overflow-hidden">
                            <div className="p-6 relative">
                                {/* Título directamente editable y centrado */}
                                <div className="text-center mb-4 relative">
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                        placeholder="Título de tu historia"
                                        className="w-full text-center text-xl font-semibold text-white bg-transparent hover:bg-[#1c1033] focus:bg-[#1c1033] rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-text border-b border-gray-600"
                                    />
                                    {isSaving && (
                                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                            Guardando...
                                        </span>
                                    )}
                                </div>

                                {/* Imagen de la historia dentro de un iPhone más pequeño */}
                                <div className="relative w-[200px] h-[398px] mx-auto">
                                    {/* Marco del iPhone */}
                                    <img
                                        src="/images/iphone16-frame.png"
                                        alt="iPhone frame"
                                        className="absolute w-full h-full z-20 pointer-events-none"
                                    />
                                    
                                    {/* Contenido del iPhone (imagen de la historia) - ahora con Dynamic Island visible */}
                                    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 flex items-center justify-center">
                                        {story.story_url_image ? (
                                            <div className="relative w-full h-full overflow-hidden rounded-[36px]">
                                                <Image
                                                    src={story.story_url_image}
                                                    alt="Imagen de la historia"
                                                    fill
                                                    className="object-cover"
                                                    priority
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-full overflow-hidden rounded-[36px] bg-[#0a0a0a] flex items-center justify-center">
                                                <div className="absolute top-0 left-0 right-0 h-[25px] bg-black rounded-t-[36px] z-10">
                                                    <div className="absolute top-[6px] left-0 right-0 mx-auto w-[65px] h-[15px] bg-black rounded-full"></div>
                                                </div>
                                                <div className="text-center p-3 mt-[25px]">
                                                    <PhotoIcon className="h-5 w-5 mx-auto text-gray-500" />
                                                    <p className="mt-1 text-[10px] text-gray-400 px-1">
                                                        ¡No te preocupes! La imagen de tu historiaaparecerá automáticamente cuando alguien escriba una de tus palabras clave.
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-gray-400 px-1">
                                                        No necesitas hacer nada más 👍
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sección de Palabras Clave (70%) */}
                        <div className="md:col-span-6 bg-[#120724] rounded-lg overflow-hidden">
                            <div className="p-6 relative">
                                <div className="flex items-center mb-4">
                                    <KeyIcon className="h-6 w-6 text-amber-400 mr-2" />
                                    <h2 className="text-xl font-bold text-white">Palabras Clave</h2>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    Configura hasta 5 palabras clave que cuando aparezcan en un comentario, activarán la respuesta automática.
                                </p>
                                <MediaSection
                                    mediaId={storyId}
                                    mediaType="story"
                                    keywords={keywords}
                                    responses={[]}
                                    onKeywordsChange={setKeywords}
                                    onResponsesChange={() => {}}
                                    showSection="keywords"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección de Respuesta en la segunda fila */}
                    <div className="bg-[#120724] rounded-lg overflow-hidden">
                        <div className="p-6 relative">
                            <div className="flex items-center mb-4">
                                <ChatBubbleLeftIcon className="h-6 w-6 text-amber-400 mr-2" />
                                <h2 className="text-xl font-bold text-white">Respuesta</h2>
                            </div>
                            <MediaSection
                                mediaId={storyId}
                                mediaType="story"
                                keywords={[]}
                                responses={responses}
                                onKeywordsChange={() => {}}
                                onResponsesChange={setResponses}
                                showSection="responses"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 