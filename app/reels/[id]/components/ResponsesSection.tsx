'use client';

import { useState, useRef, useEffect } from 'react';
import { Response } from '@/lib/types';
import { createOrUpdateResponse, deleteResponse } from '@/lib/api';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface ResponsesSectionProps {
    reelId: number;
    responses: Response[];
    onResponsesChange: (responses: Response[]) => void;
}

// Extender la interfaz Response para incluir el campo id
interface ResponseWithId extends Response {
    id: number;
}

export default function ResponsesSection({ reelId, responses, onResponsesChange }: ResponsesSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentResponseId, setCurrentResponseId] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        dm_message: '',
        button_text: '',
        button_url: '',
    });

    // Ajustar automáticamente la altura del textarea según el contenido
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [formData.dm_message]);

    const handleEmojiSelect = (emoji: any) => {
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const text = formData.dm_message;
            const newText = text.substring(0, start) + emoji.native + text.substring(end);
            setFormData({ ...formData, dm_message: newText });

            // Establecer el cursor después del emoji insertado
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.selectionStart = start + emoji.native.length;
                    textareaRef.current.selectionEnd = start + emoji.native.length;
                }
            }, 10);
        }
        setShowEmojiPicker(false);
    };

    const handleEdit = (response: ResponseWithId) => {
        setFormData({
            name: response.name,
            dm_message: response.dm_message,
            button_text: response.button_text || '',
            button_url: response.button_url || '',
        });
        setCurrentResponseId(response.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.dm_message.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const apiResponse = await createOrUpdateResponse({
                reel_id: reelId,
                id: currentResponseId || undefined,
                ...formData,
            } as ResponseWithId);

            if (apiResponse.success) {
                if (isEditing) {
                    // Actualizar la respuesta existente
                    onResponsesChange(
                        responses.map(r => (r as ResponseWithId).id === currentResponseId ? apiResponse.data : r)
                    );
                } else {
                    // Añadir nueva respuesta
                    onResponsesChange([...responses, apiResponse.data]);
                }
                setShowForm(false);
                setIsEditing(false);
                setCurrentResponseId(null);
                setFormData({
                    name: '',
                    dm_message: '',
                    button_text: '',
                    button_url: '',
                });
            } else {
                setError('Error al ' + (isEditing ? 'actualizar' : 'crear') + ' la respuesta');
            }
        } catch (err) {
            setError('Error al ' + (isEditing ? 'actualizar' : 'crear') + ' la respuesta');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (responseId: number) => {
        setLoading(true);
        setError(null);

        try {
            const apiResponse = await deleteResponse(reelId, responseId);

            if (apiResponse.success) {
                onResponsesChange(responses.filter(r => (r as ResponseWithId).id !== responseId));
            } else {
                setError('Error al eliminar la respuesta');
            }
        } catch (err) {
            setError('Error al eliminar la respuesta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Respuestas DM</h3>
                    {responses.length === 0 && !showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Nueva Respuesta
                        </button>
                    )}
                    {showForm && (
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setIsEditing(false);
                                setCurrentResponseId(null);
                                setFormData({
                                    name: '',
                                    dm_message: '',
                                    button_text: '',
                                    button_url: '',
                                });
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
                {error && (
                    <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}
                {showForm && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-black">
                                Nombre
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="dm_message" className="block text-sm font-medium text-gray-700">
                                Mensaje DM
                            </label>
                            <div className="mt-1 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="absolute right-2 top-2 z-10 p-2 rounded hover:bg-gray-100"
                                >
                                    😊
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute right-0 z-10">
                                        <Picker
                                            data={data}
                                            onEmojiSelect={handleEmojiSelect}
                                            theme="light"
                                        />
                                    </div>
                                )}
                                <textarea
                                    ref={textareaRef}
                                    id="dm_message"
                                    value={formData.dm_message}
                                    onChange={(e) => setFormData({ ...formData, dm_message: e.target.value })}
                                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    style={{ minHeight: '100px', overflow: 'hidden' }}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="button_text" className="block text-sm font-medium text-gray-700">
                                Texto del Botón (opcional)
                            </label>
                            <input
                                type="text"
                                id="button_text"
                                value={formData.button_text}
                                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="button_url" className="block text-sm font-medium text-gray-700">
                                URL del Botón (opcional)
                            </label>
                            <input
                                type="url"
                                id="button_url"
                                value={formData.button_url}
                                onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                    </form>
                )}
                <div className="mt-4">
                    <ul className="divide-y divide-gray-200">
                        {responses.map((response) => {
                            const responseId = (response as ResponseWithId).id;
                            // No mostrar la respuesta en la lista si está siendo editada
                            if (isEditing && currentResponseId === responseId) {
                                return null;
                            }

                            return (
                                <li key={responseId} className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{response.name}</p>
                                                <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
                                                    {response.dm_message}
                                                </p>
                                                {response.button_text && response.button_url && (
                                                    <p className="text-sm text-indigo-600 mt-2">
                                                        Botón: {response.button_text} ({response.button_url})
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(response as ResponseWithId)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
} 