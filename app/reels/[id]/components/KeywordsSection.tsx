'use client';

import { useState } from 'react';
import { Keyword } from '@/lib/types';
import { createOrUpdateKeyword, deleteReelKeyword } from '@/lib/api';

interface KeywordsSectionProps {
    reelId: number;
    keywords: Keyword[];
    onKeywordsChange: (keywords: Keyword[]) => void;
}

export default function KeywordsSection({ reelId, keywords, onKeywordsChange }: KeywordsSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newKeyword, setNewKeyword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await createOrUpdateKeyword({
                reel_id: reelId,
                keyword: newKeyword.trim(),
                is_active: true,
            });

            if (response.success) {
                onKeywordsChange([...keywords, response.data]);
                setNewKeyword('');
            } else {
                setError('Error al crear la palabra clave');
            }
        } catch (err) {
            setError('Error al crear la palabra clave');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (keywordId: number) => {
        setLoading(true);
        setError(null);

        try {
            // Usar el endpoint correcto que incluye el reelId
            const response = await deleteReelKeyword(reelId, keywordId);

            if (response.success) {
                onKeywordsChange(keywords.filter((k) => k.id !== keywordId));
            } else {
                setError('Error al eliminar la palabra clave');
            }
        } catch (err) {
            setError('Error al eliminar la palabra clave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Palabras Clave</h3>
                {error && (
                    <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Nueva palabra clave"
                            className="block w-full rounded-md border-gray-300 text-black pl-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading || !newKeyword.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Añadir
                        </button>
                    </div>
                </form>
                <div className="mt-4">
                    <ul className="divide-y divide-gray-200">
                        {keywords.map((keyword) => (
                            <li key={keyword.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-900">{keyword.keyword}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(keyword.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 