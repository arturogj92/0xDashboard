'use client';

import { useState, useRef, useEffect } from 'react';
import { Keyword } from '@/lib/types';
import { createOrUpdateKeyword, deleteReelKeyword } from '@/lib/api';
import { XMarkIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface KeywordsSectionProps {
    reelId: number;
    keywords: Keyword[];
    onKeywordsChange: (keywords: Keyword[]) => void;
}

export default function KeywordsSection({ reelId, keywords, onKeywordsChange }: KeywordsSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newKeyword, setNewKeyword] = useState('');
    const [wordCount, setWordCount] = useState(keywords.length);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleEmojiSelect = (emoji: any) => {
        if (inputRef.current) {
            const start = inputRef.current.selectionStart || 0;
            const end = inputRef.current.selectionEnd || 0;
            const text = newKeyword;
            const newText = text.substring(0, start) + emoji.native + text.substring(end);
            setNewKeyword(newText);

            // Establecer el cursor después del emoji insertado
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.selectionStart = start + emoji.native.length;
                    inputRef.current.selectionEnd = start + emoji.native.length;
                }
            }, 10);
        }
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await createOrUpdateKeyword({
                id: 0,
                keyword: newKeyword.trim(),
                is_active: true,
                media_id: reelId
            });

            if (response.success) {
                onKeywordsChange([...keywords, response.data]);
                setNewKeyword('');
                setWordCount(wordCount + 1);
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
                setWordCount(wordCount - 1);
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
        <div className="text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Palabras Clave</h3>
                <div className="text-sm text-gray-400">{wordCount}/5 palabras clave</div>
            </div>
            {error && (
                <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded" role="alert">
                    <span>{error}</span>
                </div>
            )}
            <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">
                    Define las palabras clave que activarán respuestas automáticas cuando sean mencionadas. Las respuestas se enviarán como mensaje directo.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-2 relative">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Nueva palabra clave"
                            disabled={wordCount >= 5}
                            className="block w-full rounded-md bg-transparent border-gray-600 text-white px-4 py-2 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ref={inputRef}
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                            <FaceSmileIcon className="h-5 w-5" />
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute right-0 mt-2 z-10">
                                <Picker 
                                    data={data} 
                                    onEmojiSelect={handleEmojiSelect} 
                                    theme="dark"
                                />
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !newKeyword.trim() || wordCount >= 5}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Añadir
                    </button>
                </div>
                {wordCount >= 5 && (
                    <p className="mt-2 text-sm text-amber-400">
                        Has alcanzado el máximo de 5 palabras clave. Elimina alguna para añadir nuevas.
                    </p>
                )}
            </form>
            
            <div>
                <ul className="space-y-2">
                    {keywords.map((keyword) => (
                        <li key={keyword.id} className="flex items-center justify-between px-4 py-2 bg-indigo-900/20 rounded-lg">
                            <span className="text-white">{keyword.keyword}</span>
                            <button
                                onClick={() => handleDelete(keyword.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30"
                                aria-label="Eliminar palabra clave"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
} 