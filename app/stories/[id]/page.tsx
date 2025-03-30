'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Story, Keyword, Response } from '@/lib/types';
import { getStory, updateStoryDescription, getStoryKeywords, getStoryResponses } from '@/lib/api';
import { MediaSection } from '@/components/media/MediaSection';
import { 
    PencilIcon, 
    DocumentTextIcon, 
    ArrowLeftIcon, 
    PhotoIcon 
} from '@heroicons/react/24/outline';

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
                {/* Header y botón de volver */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleGoBack}
                            className="p-2 rounded-full bg-[#111827] text-gray-400 hover:text-white focus:outline-none"
                            aria-label="Volver atrás"
                        >
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Editar Historia</h1>
                        <div className="w-10"></div> {/* Espacio para mantener el header centrado */}
                    </div>
                    <p className="mt-2 text-center text-gray-400">
                        Configura tu historia con palabras clave y respuestas automáticas
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Sección de Descripción con espacio para imagen */}
                    <div className="bg-[#111827] rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2" />
                                Descripción
                            </h3>
                            <p className="text-sm text-gray-400">
                                Edita la descripción de tu story.
                            </p>
                        </div>
                        <div className="px-6 pb-6">
                            {/* Espacio para la imagen (pendiente de implementación en backend) */}
                            <div className="mb-6 flex items-center justify-center bg-[#1f2937] rounded-lg p-4 h-64">
                                <div className="text-center">
                                    <PhotoIcon className="h-16 w-16 mx-auto text-gray-500" />
                                    <p className="mt-2 text-sm text-gray-400">
                                        Imagen de la historia (próximamente)
                                    </p>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-[#1f2937] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                                <div className="space-y-4">
                                    <p className="text-white">{story.description || 'Sin descripción'}</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center justify-center p-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                        aria-label="Editar descripción"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de Keywords y Responses */}
                    <MediaSection
                        mediaId={storyId}
                        mediaType="story"
                        keywords={keywords}
                        responses={responses}
                        onKeywordsChange={setKeywords}
                        onResponsesChange={setResponses}
                    />
                </div>
            </div>
        </div>
    );
} 