'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reel, Keyword, PublicComment, Response } from '@/lib/types';
import { getReel, updateReelDescription } from '@/lib/api';
import KeywordsSection from './components/KeywordsSection';
import PublicCommentsSection from './components/PublicCommentsSection';
import ResponsesSection from './components/ResponsesSection';
import { use } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function EditReel({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [reel, setReel] = useState<Reel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reelResponse = await getReel(parseInt(resolvedParams.id));
                console.log('Datos del reel recibidos:', reelResponse);

                if (reelResponse.success) {
                    // Asegurarnos de que no hay duplicados en las respuestas
                    if (reelResponse.data.responses) {
                        const uniqueResponses = Array.from(new Map(reelResponse.data.responses.map(item => [item.reel_id, item])).values());
                        reelResponse.data.responses = uniqueResponses;
                    }
                    setReel(reelResponse.data);
                    setDescription(reelResponse.data.description || '');
                    setUrl(reelResponse.data.url || '');
                } else {
                    setError('Error al cargar los datos del reel');
                }
            } catch (err) {
                setError('Error al cargar los datos del reel');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [resolvedParams.id]);

    const handleGoBack = () => {
        router.push('/');
    };

    const handleEditDescription = () => {
        setIsEditing(true);
    };

    const handleSaveDescription = async () => {
        if (!reel) return;

        setIsSaving(true);
        try {
            // Verificamos si estamos publicando un borrador (cuando no tiene URL pero ahora se está añadiendo una)
            const isPublishingDraft = !reel.url && url.trim() !== '';
            const response = await updateReelDescription(reel.id, description, isPublishingDraft, url);
            if (response.success) {
                setReel({ ...reel, description, url });
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
        setDescription(reel?.description || '');
        setUrl(reel?.url || '');
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !reel) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error || 'Reel no encontrado'}</span>
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
                        <h1 className="text-2xl font-semibold text-gray-900">Editar Reel</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Configura las respuestas automáticas para este reel
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-8">
                {/* Información del Reel */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Información del Reel
                            {!reel.url && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Borrador
                                </span>
                            )}
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                            URL del Reel
                                        </label>
                                        <input
                                            type="url"
                                            id="url"
                                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />
                                        {!reel.url && url.trim() !== '' && (
                                            <p className="mt-1 text-sm text-yellow-600">
                                                Al guardar con URL, el borrador será publicado.
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Descripción
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveDescription}
                                            disabled={isSaving}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {isSaving ? 'Guardando...' : (!reel.url && url.trim() !== '' ? 'Publicar' : 'Guardar')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <p className="font-medium text-gray-700 mr-2">URL:</p>
                                        {reel.url ? (
                                            <a href={reel.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                                                {reel.url}
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">Sin URL (Borrador)</span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <p className="font-medium text-gray-700 mr-2">Descripción:</p>
                                        <p className="text-gray-500">{reel.description}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleEditDescription}
                                        className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Palabras Clave */}
                <KeywordsSection
                    reelId={reel.id}
                    keywords={reel.keywords || []}
                    onKeywordsChange={(keywords) => setReel({ ...reel, keywords })}
                />

                {/* Comentarios Públicos */}
                <PublicCommentsSection
                    reelId={reel.id}
                    comments={reel.publicComments || []}
                    onCommentsChange={(comments) => setReel({ ...reel, publicComments: comments })}
                />

                {/* Respuestas DM */}
                <ResponsesSection
                    reelId={reel.id}
                    responses={reel.responses || []}
                    onResponsesChange={(responses) => setReel({ ...reel, responses })}
                />
            </div>
        </div>
    );
} 