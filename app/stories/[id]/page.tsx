'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Story, Keyword, Response } from '@/lib/types';
import { getStory, updateStoryDescription } from '@/lib/api';
import KeywordsSection from '../../reels/[id]/components/KeywordsSection';
import ResponsesSection from '../../reels/[id]/components/ResponsesSection';
import { use } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function EditStory({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const response = await getStory(parseInt(resolvedParams.id));
                if (response.success) {
                    setStory(response.data);
                    setDescription(response.data.description);
                    setUrl(response.data.url);
                } else {
                    setError('Error al cargar la historia');
                }
            } catch (err) {
                setError('Error al cargar la historia');
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [resolvedParams.id]);

    const handleGoBack = () => {
        router.back();
    };

    const handleSaveDescription = async () => {
        if (!story) return;

        setIsSaving(true);
        try {
            const response = await updateStoryDescription(story.id, description);
            if (response.success) {
                setStory({ ...story, description });
                setIsEditing(false);
            } else {
                setError('Error al actualizar la descripción');
            }
        } catch (err) {
            setError('Error al actualizar la descripción');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setDescription(story?.description || '');
        setUrl(story?.url || '');
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error || 'Historia no encontrada'}</span>
            </div>
        );
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto flex items-center">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="mr-3 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Editar Historia</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Configura las respuestas automáticas para esta historia
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-6">
                {/* Descripción y URL */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Información básica</h3>
                        <div className="mt-5">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Descripción
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={3}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveDescription}
                                            disabled={isSaving}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {isSaving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                                        <p className="mt-1 text-sm text-gray-900">{story.description}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Palabras clave */}
                <KeywordsSection
                    reelId={story.id}
                    keywords={story.keywords || []}
                    onKeywordsChange={(keywords) => setStory({ ...story, keywords })}
                />

                {/* Respuestas DM */}
                <ResponsesSection
                    reelId={story.id}
                    responses={story.responses || []}
                    onResponsesChange={(responses) => setStory({ ...story, responses })}
                />
            </div>
        </div>
    );
} 