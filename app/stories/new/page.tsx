'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStory } from '@/lib/api';
import { Toggle } from '@/components/ui/toggle';
import { Power, PowerOff } from 'lucide-react';
import { Story } from '@/lib/types';

export default function NewStory() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            url: '',  // URL vacía por defecto
            description: formData.get('description') as string,
            is_active: isActive,
            media_type: 'story' as const
        };

        try {
            const response = await createStory(data);
            if (response.success) {
                router.push(`/stories/${response.data.id}`);
            } else {
                setError('Error al crear la historia');
            }
        } catch (err) {
            setError('Error al crear la historia');
        } finally {
            setLoading(false);
        }
    };

    const handleActiveChange = () => {
        setIsActive(!isActive);
    };

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-foreground">Nueva Historia</h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Añade una nueva historia para configurar respuestas automáticas
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                            placeholder="Descripción de la historia..."
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Toggle
                        pressed={isActive}
                        onPressedChange={handleActiveChange}
                        className="flex items-center space-x-2"
                    >
                        {isActive ? (
                            <Power className="h-4 w-4" />
                        ) : (
                            <PowerOff className="h-4 w-4" />
                        )}
                        <span className="text-sm text-gray-200">
                            {isActive ? 'Activar' : 'Desactivar'}
                        </span>
                    </Toggle>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : 'Crear Historia'}
                    </button>
                </div>
            </form>
        </div>
    );
} 