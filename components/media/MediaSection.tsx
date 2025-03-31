'use client';

import { useState, useEffect, useRef } from 'react';
import { Keyword, Response, Media } from '@/lib/types';
import { 
  createOrUpdateKeyword, 
  deleteReelKeyword,
  createOrUpdateStoryKeyword,
  deleteStoryKeyword,
  createOrUpdateResponse,
  createOrUpdateStoryResponse,
} from '@/lib/api';
import { 
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MediaSectionProps {
    mediaId: number;
    mediaType: 'reel' | 'story';
    keywords: Keyword[];
    responses: Response[];
    onKeywordsChange: (keywords: Keyword[]) => void;
    onResponsesChange: (responses: Response[]) => void;
    showKeywordsOnly?: boolean;
    showResponsesOnly?: boolean;
}

export function MediaSection({
    mediaId,
    mediaType,
    keywords,
    responses,
    onKeywordsChange,
    onResponsesChange,
    showKeywordsOnly = false,
    showResponsesOnly = false
}: MediaSectionProps) {
    const [newKeyword, setNewKeyword] = useState('');
    const [responseData, setResponseData] = useState({
        name: '',
        dm_message: '',
        button_text: '',
        button_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showEmojiPickerKeyword, setShowEmojiPickerKeyword] = useState(false);
    const [showEmojiPickerMessage, setShowEmojiPickerMessage] = useState(false);
    const keywordInputRef = useRef<HTMLInputElement>(null);
    const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

    const hasExistingResponse = responses.length > 0;
    const currentResponse = hasExistingResponse ? responses[0] : null;

    // Cargar la respuesta existente si hay una
    useEffect(() => {
        if (responses.length > 0) {
            const firstResponse = responses[0];
            setResponseData({
                name: firstResponse.name,
                dm_message: firstResponse.dm_message,
                button_text: firstResponse.button_text || '',
                button_url: firstResponse.button_url || ''
            });
        }
    }, [responses]);

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;
        
        // Comprobar el límite de 5 palabras clave
        if (keywords.length >= 5) {
            setError('Límite alcanzado: máximo 5 palabras clave por historia');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const createFn = mediaType === 'story' ? createOrUpdateStoryKeyword : createOrUpdateKeyword;
            const response = await createFn({
                id: 0,
                reel_id: mediaId,
                keyword: newKeyword,
                is_active: true
            });

            if (response.success) {
                onKeywordsChange([...keywords, response.data]);
                setNewKeyword('');
            } else {
                setError('Error al agregar la palabra clave');
            }
        } catch (err) {
            setError('Error al agregar la palabra clave');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKeyword = async (keywordId: number) => {
        setLoading(true);
        setError(null);

        try {
            const deleteFn = mediaType === 'story' ? deleteStoryKeyword : deleteReelKeyword;
            const response = await deleteFn(mediaId, keywordId);

            if (response.success) {
                onKeywordsChange(keywords.filter(k => k.id !== keywordId));
            } else {
                setError('Error al eliminar la palabra clave');
            }
        } catch (err) {
            setError('Error al eliminar la palabra clave');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!responseData.name.trim() || !responseData.dm_message.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const createFn = mediaType === 'story' ? createOrUpdateStoryResponse : createOrUpdateResponse;
            const response = await createFn({
                id: hasExistingResponse && currentResponse ? currentResponse.id : 0,
                media_id: mediaId,
                ...responseData,
                is_active: true
            });

            if (response.success) {
                onResponsesChange([response.data]);
                setIsEditing(false);
            } else {
                setError('Error al guardar la respuesta');
            }
        } catch (err) {
            setError('Error al guardar la respuesta');
        } finally {
            setLoading(false);
        }
    };

    // Específicamente cuando cambia el modo de edición
    const handleEditClick = () => {
        if (currentResponse) {
            setResponseData({
                name: currentResponse.name,
                dm_message: currentResponse.dm_message,
                button_text: currentResponse.button_text || '',
                button_url: currentResponse.button_url || ''
            });
        }
        setIsEditing(true);
    };

    // Función para manejar la selección de emoji para el campo de palabra clave
    const handleEmojiSelectKeyword = (emoji: any) => {
        if (keywordInputRef.current) {
            const start = keywordInputRef.current.selectionStart || 0;
            const end = keywordInputRef.current.selectionEnd || 0;
            const text = newKeyword;
            const newText = text.substring(0, start) + emoji.native + text.substring(end);
            setNewKeyword(newText);

            // Establecer el cursor después del emoji insertado
            setTimeout(() => {
                if (keywordInputRef.current) {
                    keywordInputRef.current.focus();
                    keywordInputRef.current.selectionStart = start + emoji.native.length;
                    keywordInputRef.current.selectionEnd = start + emoji.native.length;
                }
            }, 10);
        }
        setShowEmojiPickerKeyword(false);
    };

    // Función para manejar la selección de emoji para el campo de mensaje DM
    const handleEmojiSelectMessage = (emoji: any) => {
        if (messageTextareaRef.current) {
            const start = messageTextareaRef.current.selectionStart || 0;
            const end = messageTextareaRef.current.selectionEnd || 0;
            const text = responseData.dm_message;
            const newText = text.substring(0, start) + emoji.native + text.substring(end);
            setResponseData({ ...responseData, dm_message: newText });

            // Establecer el cursor después del emoji insertado
            setTimeout(() => {
                if (messageTextareaRef.current) {
                    messageTextareaRef.current.focus();
                    messageTextareaRef.current.selectionStart = start + emoji.native.length;
                    messageTextareaRef.current.selectionEnd = start + emoji.native.length;
                }
            }, 10);
        }
        setShowEmojiPickerMessage(false);
    };

    return (
        <div className="space-y-8">
            {/* Sección de Palabras Clave */}
            {!showResponsesOnly && (
                <div className="bg-[#120724] rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-white flex items-center mb-2">
                            <KeyIcon className="h-5 w-5 mr-2 text-[#ff9805]" />
                            Palabras Clave
                        </h3>
                        <p className="text-sm text-gray-400">
                            Define las palabras clave que activarán respuestas automáticas cuando sean mencionadas. Las respuestas se enviarán como mensaje directo.
                        </p>
                    </div>

                    <div className="px-6 pb-3">
                        {/* Lista de palabras clave */}
                        {keywords.length > 0 ? (
                            <div className="space-y-2 mb-3">
                                {keywords.map((keyword) => (
                                    <div key={keyword.id} className="flex items-center justify-between bg-[#1c1033] px-4 py-3 rounded-md">
                                        <span className="text-gray-200">{keyword.keyword}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteKeyword(keyword.id)}
                                            className="text-red-400 hover:text-red-300 focus:outline-none"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                                <div className="text-right text-xs text-gray-400">
                                    {keywords.length}/5 palabras clave
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-3 text-gray-500 mb-3">
                                No hay palabras clave configuradas. Añade una para activar respuestas automáticas.
                            </div>
                        )}

                        {/* Mostrar error si existe */}
                        {error && (
                            <div className="mb-3 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Formulario para agregar palabra clave - solo mostrar si hay menos de 5 keywords */}
                        {keywords.length < 5 ? (
                            <form onSubmit={handleAddKeyword} className="flex mb-0">
                                <div className="flex-1 relative">
                                    <input
                                        ref={keywordInputRef}
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        placeholder="Nueva palabra clave"
                                        className="w-full bg-[#1c1033] text-white rounded-l-md border-0 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPickerKeyword(!showEmojiPickerKeyword)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                    >
                                        😊
                                    </button>
                                    {showEmojiPickerKeyword && (
                                        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowEmojiPickerKeyword(false)}>
                                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                <Picker
                                                    data={data}
                                                    onEmojiSelect={handleEmojiSelectKeyword}
                                                    theme="dark"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !newKeyword.trim()}
                                    className="inline-flex items-center justify-center rounded-r-md bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                                >
                                    <PlusIcon className="h-5 w-5 mr-1" />
                                    Agregar
                                </button>
                            </form>
                        ) : (
                            <div className="text-center mb-0 py-2 px-3 bg-indigo-900/30 border border-indigo-800/50 rounded-md">
                                <p className="text-sm text-indigo-300">
                                    Has alcanzado el máximo de 5 palabras clave. Elimina alguna para añadir nuevas.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sección de Respuesta */}
            {!showKeywordsOnly && (
                <div className="bg-[#120724] rounded-lg overflow-hidden">
                    <div className="p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2 text-[#ff9805]" />
                                Respuesta
                            </h3>
                            <p className="text-sm text-gray-400">
                                Configura la respuesta automática que se enviará como mensaje directo cuando se detecten las palabras clave.
                            </p>
                        </div>
                        {!isEditing && hasExistingResponse && currentResponse && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={handleEditClick}
                                            className="inline-flex items-center justify-center p-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                            aria-label="Editar"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Editar respuesta</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>

                    <div className="px-6 pb-6">
                        {(hasExistingResponse && currentResponse && !isEditing) ? (
                            // Vista de lectura
                            <div className="space-y-6 text-gray-300">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 flex items-center">
                                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                                        Nombre
                                    </h4>
                                    <p className="mt-1 text-white">{currentResponse.name}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 flex items-center">
                                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                                        Mensaje DM
                                    </h4>
                                    <p className="mt-1 text-white whitespace-pre-line">{currentResponse.dm_message}</p>
                                </div>
                                {currentResponse.button_text && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400 flex items-center">
                                            <LinkIcon className="h-4 w-4 mr-1" />
                                            Botón
                                        </h4>
                                        <div className="mt-2 border border-dashed border-gray-700 p-3 rounded-md bg-[#1c1033]">
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center">
                                                    <span className="text-gray-400 text-xs min-w-20">Texto:</span>
                                                    <span className="text-white ml-2">{currentResponse.button_text}</span>
                                                </div>
                                                {currentResponse.button_url && (
                                                    <div className="flex items-center">
                                                        <span className="text-gray-400 text-xs min-w-20">URL:</span>
                                                        <a 
                                                            href={currentResponse.button_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-indigo-400 hover:text-indigo-300 truncate ml-2"
                                                        >
                                                            {currentResponse.button_url}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2 italic">
                                                Este botón aparecerá en el mensaje que recibirá el usuario
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Formulario de edición
                            <form onSubmit={handleSaveResponse} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={responseData.name}
                                        onChange={(e) => setResponseData({ ...responseData, name: e.target.value })}
                                        className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Nombre de la respuesta"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Identificador interno para esta respuesta
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="dm_message" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                                        Mensaje DM
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            ref={messageTextareaRef}
                                            id="dm_message"
                                            rows={4}
                                            value={responseData.dm_message}
                                            onChange={(e) => setResponseData({ ...responseData, dm_message: e.target.value })}
                                            className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Mensaje que se enviará por DM"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPickerMessage(!showEmojiPickerMessage)}
                                            className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                                        >
                                            😊
                                        </button>
                                        {showEmojiPickerMessage && (
                                            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowEmojiPickerMessage(false)}>
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <Picker
                                                        data={data}
                                                        onEmojiSelect={handleEmojiSelectMessage}
                                                        theme="dark"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Este texto se enviará como mensaje directo cuando se detecte una palabra clave
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="button_text" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                        <LinkIcon className="h-4 w-4 mr-1" />
                                        Texto del Botón (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        id="button_text"
                                        value={responseData.button_text}
                                        onChange={(e) => setResponseData({ ...responseData, button_text: e.target.value })}
                                        className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Texto que se mostrará en el botón"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Texto que aparecerá en el botón del mensaje
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="button_url" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                        <LinkIcon className="h-4 w-4 mr-1" />
                                        URL del Botón (opcional)
                                    </label>
                                    <input
                                        type="url"
                                        id="button_url"
                                        value={responseData.button_url}
                                        onChange={(e) => setResponseData({ ...responseData, button_url: e.target.value })}
                                        className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="URL a la que apuntará el botón"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enlace al que redirigirá el botón cuando sea pulsado
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (currentResponse) {
                                                    setResponseData({
                                                        name: currentResponse.name,
                                                        dm_message: currentResponse.dm_message,
                                                        button_text: currentResponse.button_text || '',
                                                        button_url: currentResponse.button_url || ''
                                                    });
                                                }
                                                setIsEditing(false);
                                            }}
                                            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando...' : hasExistingResponse ? 'Guardar Cambios' : 'Crear Respuesta'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md flex items-start" role="alert">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-bold">Error!</strong>
                        <span className="ml-1">{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
} 