'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReel } from '@/lib/api';

export default function NewReel() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDraft, setIsDraft] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            url: isDraft ? null : formData.get('url') as string,
            description: formData.get('description') as string,
            is_active: formData.get('is_active') === 'true',
            is_draft: isDraft
        };

        try {
            const response = await createReel(data, isDraft);
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

    const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsDraft(e.target.checked);
    };

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Nuevo Reel</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Añade un nuevo reel para configurar respuestas automáticas
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                            URL del Reel
                        </label>
                        <div className="mt-1">
                            <input
                                type="url"
                                name="url"
                                id="url"
                                required={!isDraft}
                                disabled={isDraft}
                                value={isDraft ? '' : undefined}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 text-black"
                                placeholder={isDraft ? "No requerido en modo borrador" : "https://www.instagram.com/reel/..."}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descripción
                        </label>
                        <div className="mt-1">
                            <textarea
                                name="description"
                                id="description"
                                rows={3}
                                required={true}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                                placeholder="Descripción del reel..."
                            />
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="is_active"
                                name="is_active"
                                type="checkbox"
                                value="true"
                                defaultChecked={true}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="is_active" className="font-medium text-gray-700">
                                Activo
                            </label>
                            <p className="text-gray-500">El reel estará activo y visible</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="is_draft"
                                name="is_draft"
                                type="checkbox"
                                value="true"
                                checked={isDraft}
                                onChange={handleDraftChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="is_draft" className="font-medium text-gray-700">
                                Guardar como borrador
                            </label>
                            <p className="text-gray-500">El reel se guardará como borrador</p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 