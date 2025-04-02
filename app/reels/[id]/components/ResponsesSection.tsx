'use client';

import { useState, useRef, useEffect } from 'react';
import { Response } from '@/lib/types';
import { createOrUpdateResponse, deleteResponse } from '@/lib/api';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { XMarkIcon, FaceSmileIcon, ArrowUpRightIcon, SparklesIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ResponsesSectionProps {
    reelId: number;
    responses: Response[];
    onResponsesChange: (responses: Response[]) => void;
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
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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

    const handleEdit = (response: Response) => {
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
            const responseData: Omit<Response, 'created_at' | 'updated_at'> = {
                id: currentResponseId || 0,
                media_id: reelId,
                name: formData.name,
                dm_message: formData.dm_message,
                button_text: formData.button_text,
                button_url: formData.button_url,
                is_active: true
            };

            const apiResponse = await createOrUpdateResponse(responseData);

            if (apiResponse.success) {
                if (isEditing) {
                    // Actualizar la respuesta existente
                    onResponsesChange(
                        responses.map(r => r.id === currentResponseId ? apiResponse.data : r)
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
                onResponsesChange(responses.filter(r => r.id !== responseId));
            } else {
                setError('Error al eliminar la respuesta');
            }
        } catch (err) {
            setError('Error al eliminar la respuesta');
        } finally {
            setLoading(false);
        }
    };

    // Función para generar respuesta por IA
    const handleGenerateAIResponse = async () => {
        setIsGeneratingAI(true);
        // Aquí normalmente habría una llamada a la API para generar texto con IA
        setTimeout(() => {
            // Simulamos una respuesta de la IA
            const aiResponse = "¡Hola! Muchas gracias por tu comentario en mi reel 😊 Me alegra que te haya gustado. Si tienes alguna pregunta o quieres saber más, no dudes en decírmelo. ¡Un abrazo fuerte! 💙";
            setFormData({
                ...formData,
                dm_message: aiResponse
            });
            setIsGeneratingAI(false);
        }, 1500);
    };

    return (
        <div className="text-white">
            {!showForm && (
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-sm text-gray-400 mb-2">
                            Configura la respuesta automática que se enviará como mensaje directo cuando se detecten las palabras clave.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 text-white hover:from-indigo-600/30 hover:to-indigo-600/20 border border-indigo-500/50"
                    >
                        <PlusIcon className="h-4 w-4 text-indigo-400" />
                        {isEditing ? 'Editar Respuesta' : 'Nueva Respuesta'}
                    </button>
                </div>
            )}
            
            {error && (
                <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded" role="alert">
                    <span>{error}</span>
                </div>
            )}
            
            {showForm ? (
                <form onSubmit={handleSubmit} className="bg-indigo-900/20 rounded-lg p-4 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Nombre
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-600 bg-transparent shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="dm_message" className="block text-sm font-medium text-gray-300">
                                    Mensaje DM
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerateAIResponse}
                                    disabled={isGeneratingAI}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 text-white hover:from-indigo-600/30 hover:to-indigo-600/20 border border-indigo-500/50"
                                >
                                    <SparklesIcon className="h-4 w-4 text-indigo-400" />
                                    {isGeneratingAI ? 'Generando...' : 'Generar con IA'}
                                </button>
                            </div>
                            <div className="mt-1 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="absolute right-2 top-2 z-10 p-2 rounded hover:bg-indigo-800/50"
                                >
                                    <FaceSmileIcon className="h-5 w-5 text-gray-300" />
                                </button>
                                <textarea
                                    id="dm_message"
                                    ref={textareaRef}
                                    value={formData.dm_message}
                                    onChange={(e) => setFormData({ ...formData, dm_message: e.target.value })}
                                    rows={3}
                                    className="block w-full rounded-md border-gray-600 bg-transparent shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white pr-10"
                                    required
                                />
                                {showEmojiPicker && (
                                    <div className="absolute right-0 z-10 mt-2">
                                        <Picker 
                                            data={data} 
                                            onEmojiSelect={handleEmojiSelect} 
                                            theme="dark"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="button_text" className="block text-sm font-medium text-gray-300">
                                Texto del Botón (opcional)
                            </label>
                            <input
                                type="text"
                                id="button_text"
                                value={formData.button_text}
                                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-600 bg-transparent shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="button_url" className="block text-sm font-medium text-gray-300">
                                URL del Botón (opcional)
                            </label>
                            <input
                                type="url"
                                id="button_url"
                                value={formData.button_url}
                                onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-600 bg-transparent shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                            />
                        </div>
                        <div className="flex space-x-3 pt-3">
                            <button
                                type="submit"
                                disabled={loading || !formData.name.trim() || !formData.dm_message.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
                            </button>
                            <button
                                type="button"
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
                                className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            ) : null}
            
            <div>
                {responses.length > 0 ? (
                    <div className="space-y-4">
                        {responses.map((response: any) => (
                            <div key={response.id} className="bg-indigo-900/20 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium text-white">{response.name}</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(response)}
                                            className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-800/50"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(response.id)}
                                            className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-black/30 rounded-lg p-3 mb-3">
                                    <p className="text-gray-200 whitespace-pre-wrap">{response.dm_message}</p>
                                </div>
                                {response.button_text && response.button_url && (
                                    <div className="mt-2 flex">
                                        <a
                                            href={response.button_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300"
                                        >
                                            {response.button_text}
                                            <ArrowUpRightIcon className="h-4 w-4 ml-1" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-indigo-900/20 rounded-lg">
                        <p className="text-gray-400">Aún no hay respuestas configuradas. Añade una nueva respuesta.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 