'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReel } from '@/lib/api';
import { Toggle } from '@/components/ui/toggle';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/outline';


export default function NewReel() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDraft, setIsDraft] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [urlValue, setUrlValue] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            url: isDraft ? null : formData.get('url') as string,
            description: formData.get('description') as string,
            is_active: isActive,
            is_draft: isDraft,
            media_type: 'reel' as const
        };
        try {
            const response = await createReel({
                ...data,
                url: isDraft ? '' : (data.url || '')
            }, isDraft);
            if (response.success) {
                // Redirigir a la página del reel recién creado
                router.push(`/reels/${response.data.id}`);
            } else {
                setError('Error al crear el reel');
            }
        } catch (err) {
            setError('Error al crear el reel');
        } finally {
            setLoading(false);
        }
    };

    const handleDraftChange = () => {
        setIsDraft(!isDraft);
        if (!isDraft) {
            setUrlValue('');
        }
    };

    const handleActiveChange = () => {
        setIsActive(!isActive);
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrlValue(e.target.value);
    };

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-foreground">Nuevo Reel</h1>
                        {isDraft && (
                            <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-400/30">
                                DRAFT
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                        Añade un nuevo reel para configurar respuestas automáticas
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-200">
                            URL del Reel
                        </label>
                        <div className="mt-1">
                            <input
                                type="url"
                                name="url"
                                id="url"
                                required={!isDraft}
                                disabled={isDraft}
                                value={urlValue}
                                onChange={handleUrlChange}
                                className="block w-full rounded-md border-gray-700 bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-900 text-gray-200"
                                placeholder={isDraft ? "No requerido en modo borrador" : "https://www.instagram.com/reel/..."}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-200">
                            Descripción
                        </label>
                        <div className="mt-1">
                            <textarea
                                name="description"
                                id="description"
                                rows={3}
                                required={true}
                                className="block w-full rounded-md border-gray-700 bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-200"
                                placeholder="Descripción del reel..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <div className="flex items-center space-x-2">
                            <Toggle
                                id="is_active"
                                pressed={isActive}
                                onPressedChange={handleActiveChange}
                                className="
                                w-10 h-6
                                flex items-center justify-center
                                hover:bg-purple-900
                                "
                                variant="outline"
                            >
                                {isActive ? <EyeIcon/> : <EyeSlashIcon/>}
                            </Toggle>
                            
                            <Toggle
                                id="is_draft"
                                pressed={isDraft}
                                onPressedChange={handleDraftChange}
                                className="
                                w-10 h-6
                                flex items-center justify-center
                                hover:bg-purple-900
                                "
                                variant="outline"
                            >
                                {isDraft ? 
                                    <DocumentTextIcon className="text-amber-400"/> : 
                                    <DocumentTextIcon className="opacity-50"/>
                                }
                            </Toggle>
                            {isDraft && (
                                <span className="text-xs text-amber-400">Borrador</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="rounded-md border border-gray-700 bg-gray-800 py-2 px-4 text-sm font-medium text-gray-200 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 