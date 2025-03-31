'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Story, Keyword, Response } from '@/lib/types';
import { getStory, updateStoryDescription, getStoryKeywords, getStoryResponses } from '@/lib/api';
import { MediaSection } from '@/components/media/MediaSection';
import {
    PencilIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    PhotoIcon
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
            const response = await getStoryKeywords(storyId);
            if (response.success) {
                setKeywords(response.data);
            }
        } catch (err) {
            console.error('Error al cargar las palabras clave:', err);
        }
    };

    const fetchResponses = async () => {
        try {
            const response = await getStoryResponses(storyId);
            console.log('Respuestas cargadas:', response);
            if (response.success) {
                setResponses(response.data);
            }
        } catch (err) {
            console.error('Error al cargar las respuestas:', err);
        }
    };

    const handleSaveDescription = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await updateStoryDescription(storyId, description);
            if (response.success) {
                setStory(response.data);
                setIsEditing(false);
            } else {
                setError('Error al guardar la descripción');
            }
        } catch (err) {
            setError('Error al guardar la descripción');
        } finally {
            setLoading(false);
        }
    };

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
        <div className="min-h-screen bg-black py-8">
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
                                <h1 className="text-2xl font-bold text-white">Editar respuesta a Historia</h1>
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
                    {/* Descripción y Palabras Clave en dos columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sección de Descripción */}
                        <div className="bg-[#120724] rounded-lg overflow-hidden">
                            <div className="p-6 relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-white flex items-center">
                                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                                        Descripción
                                    </h3>
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="inline-flex items-center justify-center p-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                            aria-label="Editar descripción"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>

                                <p className="text-sm text-gray-400 mb-4">
                                    Edita la descripción de tu story.
                                </p>

                                {/* Placeholder para imagen futura */}
                                <div className="mb-4 bg-[#1c1033] rounded-lg p-3 flex items-center justify-center aspect-[9/16] max-w-[200px] mx-auto">
                                    <div className="text-center">
                                        <PhotoIcon className="h-8 w-8 mx-auto text-gray-500" />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Imagen (próximamente)
                                        </p>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="space-y-4">
                                        <textarea
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Describe tu story"
                                        />
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDescription(story.description || '');
                                                    setIsEditing(false);
                                                }}
                                                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveDescription}
                                                disabled={loading}
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                                            >
                                                {loading ? 'Guardando...' : 'Guardar'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-white">{story.description || 'Sin descripción'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección de Palabras Clave */}
                        <div className="bg-[#120724] rounded-lg overflow-hidden">
                            {/* Pasamos solo la parte de keywords de MediaSection */}
                            <MediaSection
                                mediaId={storyId}
                                mediaType="story"
                                keywords={keywords}
                                responses={[]}
                                onKeywordsChange={setKeywords}
                                onResponsesChange={() => { }}
                                showKeywordsOnly={true}
                            />
                        </div>
                    </div>

                    {/* Sección de Respuesta en la segunda fila */}
                    <div className="bg-[#120724] rounded-lg overflow-hidden">
                        {/* Pasamos solo la parte de responses de MediaSection */}
                        <MediaSection
                            mediaId={storyId}
                            mediaType="story"
                            keywords={[]}
                            responses={responses}
                            onKeywordsChange={() => { }}
                            onResponsesChange={setResponses}
                            showResponsesOnly={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 