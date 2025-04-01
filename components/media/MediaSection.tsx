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
  generateAIResponse,
  getMediaResponses,
  getStoryResponses
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
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  ChatBubbleLeftIcon
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
    showSection?: 'keywords' | 'responses';
}

export function MediaSection({
    mediaId,
    mediaType,
    keywords,
    responses,
    onKeywordsChange,
    onResponsesChange,
    showSection
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
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [includeButton, setIncludeButton] = useState(false);
    const [aiButtonUrl, setAiButtonUrl] = useState('');
    const [aiResponseName, setAiResponseName] = useState('');
    const [generatedResponse, setGeneratedResponse] = useState<Response | null>(null);
    const [showGeneratedResponse, setShowGeneratedResponse] = useState(false);
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

    // Log para depurar el problema con las keywords
    useEffect(() => {
        console.log('MediaSection recibió keywords:', keywords);
    }, [keywords]);

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;
        
        console.log('Intento de agregar keyword:', newKeyword);
        console.log('keywords actuales:', keywords);
        
        // Asegurarnos de que keywords sea un array
        const safeKeywords = Array.isArray(keywords) ? keywords : [];
        
        // Comprobar el límite de 5 palabras clave
        if (safeKeywords.length >= 5) {
            setError('Límite alcanzado: máximo 5 palabras clave por historia');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const createFn = mediaType === 'story' ? createOrUpdateStoryKeyword : createOrUpdateKeyword;
            const response = await createFn({
                id: 0,
                media_id: mediaId,
                keyword: newKeyword,
                is_active: true
            });

            console.log('Respuesta al crear keyword:', response);

            if (response.success) {
                console.log('Nueva lista de keywords:', [...safeKeywords, response.data]);
                onKeywordsChange([...safeKeywords, response.data]);
                setNewKeyword('');
            } else {
                setError('Error al agregar la palabra clave');
            }
        } catch (err) {
            console.error('Error al agregar palabra clave:', err);
            setError('Error al agregar la palabra clave');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKeyword = async (keywordId: number) => {
        console.log('Intento de eliminar keyword con ID:', keywordId);
        console.log('keywords actuales:', keywords);
        
        // Asegurarnos de que keywords sea un array
        const safeKeywords = Array.isArray(keywords) ? keywords : [];
        
        setLoading(true);
        setError(null);

        try {
            const deleteFn = mediaType === 'story' ? deleteStoryKeyword : deleteReelKeyword;
            const response = await deleteFn(mediaId, keywordId);

            console.log('Respuesta al eliminar keyword:', response);

            if (response.success) {
                const updatedKeywords = safeKeywords.filter(k => k.id !== keywordId);
                console.log('Nueva lista de keywords después de eliminar:', updatedKeywords);
                onKeywordsChange(updatedKeywords);
            } else {
                setError('Error al eliminar la palabra clave');
            }
        } catch (err) {
            console.error('Error al eliminar palabra clave:', err);
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

    // Función para generar respuesta con IA
    const handleGenerateAIResponse = async () => {
        if (!aiPrompt.trim() || !aiResponseName.trim()) return;
        
        setAiLoading(true);
        setError(null);
        
        try {
            const response = await generateAIResponse(mediaId, {
                prompt: aiPrompt,
                includeButton: includeButton,
                buttonUrl: includeButton ? aiButtonUrl : '',
                responseName: aiResponseName,
                save: true
            });
            
            if (response.success) {
                // Cerrar el modal inmediatamente
                setShowAIModal(false);
                
                // Limpiar el formulario
                setAiPrompt('');
                setIncludeButton(false);
                setAiButtonUrl('');
                setAiResponseName('');
                setGeneratedResponse(null);
                setShowGeneratedResponse(false);
                
                // Actualizar las respuestas directamente
                if (mediaType === 'reel') {
                    // Para reels, obtener las respuestas actualizadas del servidor
                    const updatedResponsesResult = await getMediaResponses(mediaId);
                    if (updatedResponsesResult.success) {
                        onResponsesChange(updatedResponsesResult.data);
                    }
                } else {
                    // Para stories, obtener las respuestas actualizadas del servidor
                    const updatedResponsesResult = await getStoryResponses(mediaId);
                    if (updatedResponsesResult.success) {
                        onResponsesChange(updatedResponsesResult.data);
                    }
                }
                
                // Si existe una respuesta, actualizar inmediatamente los datos mostrados
                if (hasExistingResponse) {
                    setResponseData({
                        name: response.data.name,
                        dm_message: response.data.dm_message,
                        button_text: response.data.button_text || '',
                        button_url: response.data.button_url || ''
                    });
                    setIsEditing(false);
                }
            } else {
                setError(response.message || 'Error al generar la respuesta con IA');
            }
        } catch (err) {
            setError('Error al comunicarse con el servicio de IA');
        } finally {
            setAiLoading(false);
        }
    };

    // Función para cerrar el modal y limpiar el formulario
    const handleCloseAIModal = () => {
        setShowAIModal(false);
        setAiPrompt('');
        setIncludeButton(false);
        setAiButtonUrl('');
        setAiResponseName('');
        setGeneratedResponse(null);
        setShowGeneratedResponse(false);
    };

    return (
        <div className="space-y-4">
            {/* Sección de Palabras Clave - mostrar solo cuando showSection="keywords" */}
            {showSection === 'keywords' && (
                <>
                    <div className="bg-[#120724] rounded-lg overflow-hidden">
                        <div className="p-6">
                            <p className="text-sm text-gray-400">
                                Define las palabras clave que activarán respuestas automáticas cuando sean mencionadas. Las respuestas se enviarán como mensaje directo.
                            </p>
                        </div>

                        <div className="px-6 pb-3">
                            {/* Lista de palabras clave */}
                            {keywords && Array.isArray(keywords) && keywords.length > 0 ? (
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
                            {!keywords || !Array.isArray(keywords) || keywords.length < 5 ? (
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
                </>
            )}

            {/* Sección de Respuesta - mostrar solo cuando showSection="responses" */}
            {showSection === 'responses' && (
                <>
                    <div className="bg-[#120724] rounded-lg overflow-hidden">
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                {(hasExistingResponse && currentResponse && !isEditing) ? (
                                    // Vista de lectura
                                    <div className="space-y-6 text-gray-300 flex-1">
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
                                    <form onSubmit={handleSaveResponse} className="space-y-6 flex-1">
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

                                <div className="flex space-x-2 ml-4">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAIModal(true)}
                                                    className="inline-flex items-center justify-center p-2 border border-transparent rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none"
                                                    aria-label="Generar con IA"
                                                >
                                                    <SparklesIcon className="h-5 w-5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Generar respuesta con IA</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    
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
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal para generar respuesta con IA */}
            {showAIModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a0e35] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <SparklesIcon className="h-5 w-5 mr-2 text-[#ff9805]" />
                                    Generar respuesta con IA
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleCloseAIModal}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            
                            {/* Mostrar la respuesta generada si existe */}
                            {generatedResponse ? (
                                <div className={`mt-6 transition-all duration-500 ease-in-out transform ${showGeneratedResponse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    <div className="bg-green-900/20 border border-green-800/30 p-3 rounded-md text-sm text-green-300 mb-4">
                                        <p className="flex items-center">
                                            <SparklesIcon className="h-4 w-4 mr-2" />
                                            ¡Respuesta generada con éxito!
                                        </p>
                                    </div>
                                    
                                    <div className="bg-[#120724] p-4 rounded-lg shadow-inner">
                                        <h4 className="text-lg font-medium text-white mb-2">{generatedResponse.name}</h4>
                                        
                                        <div className="space-y-4 mt-4">
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-400 flex items-center">
                                                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                                                    Mensaje DM
                                                </h5>
                                                <p className="mt-1 text-white bg-[#1c1033] p-3 rounded-md whitespace-pre-line">
                                                    {generatedResponse.dm_message}
                                                </p>
                                            </div>
                                            
                                            {generatedResponse.button_text && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-400 flex items-center">
                                                        <LinkIcon className="h-4 w-4 mr-1" />
                                                        Botón
                                                    </h5>
                                                    <div className="mt-1 border border-dashed border-indigo-800 p-3 rounded-md bg-[#1c1033]">
                                                        <div className="flex flex-col space-y-2">
                                                            <div className="flex items-center">
                                                                <span className="text-gray-400 text-xs min-w-20">Texto:</span>
                                                                <span className="text-white ml-2">{generatedResponse.button_text}</span>
                                                            </div>
                                                            {generatedResponse.button_url && (
                                                                <div className="flex items-center">
                                                                    <span className="text-gray-400 text-xs min-w-20">URL:</span>
                                                                    <a 
                                                                        href={generatedResponse.button_url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="text-indigo-400 hover:text-indigo-300 truncate ml-2"
                                                                    >
                                                                        {generatedResponse.button_url}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={handleCloseAIModal}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mt-4 bg-indigo-900/20 border border-indigo-800/30 p-3 rounded-md text-sm text-indigo-300">
                                        <p>Esta herramienta utiliza inteligencia artificial para generar una respuesta automática basada en tus instrucciones.</p>
                                        <p className="mt-2">La respuesta generada <span className="font-bold text-yellow-400">reemplazará la respuesta actual</span> si ya existe una.</p>
                                    </div>
                                    
                                    <form onSubmit={(e) => { e.preventDefault(); handleGenerateAIResponse(); }} className="mt-6 space-y-5">
                                        <div>
                                            <label htmlFor="ai-response-name" className="block text-sm font-medium text-gray-300 mb-1">
                                                Nombre de la respuesta
                                            </label>
                                            <input
                                                type="text"
                                                id="ai-response-name"
                                                value={aiResponseName}
                                                onChange={(e) => setAiResponseName(e.target.value)}
                                                placeholder="Ej: Respuesta curso logica"
                                                className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-300 mb-1">
                                                Instrucciones para la IA
                                            </label>
                                            <textarea
                                                id="ai-prompt"
                                                rows={4}
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder="Ej: Genera una respuesta para dar acceso a mi curso de lógica de programación desde 0 donde aprenderán a programar sin lenguaje de programación específico."
                                                className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="include-button"
                                                checked={includeButton}
                                                onChange={(e) => setIncludeButton(e.target.checked)}
                                                className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#1c1033]"
                                            />
                                            <label htmlFor="include-button" className="text-sm font-medium text-gray-300">
                                                Incluir botón en la respuesta
                                            </label>
                                        </div>
                                        
                                        {includeButton && (
                                            <div>
                                                <label htmlFor="ai-button-url" className="block text-sm font-medium text-gray-300 mb-1">
                                                    URL del botón
                                                </label>
                                                <input
                                                    type="text"
                                                    id="ai-button-url"
                                                    value={aiButtonUrl}
                                                    onChange={(e) => setAiButtonUrl(e.target.value)}
                                                    placeholder="Ej: art0x.link/curso-logica"
                                                    className="w-full bg-[#1c1033] text-white border-0 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    required={includeButton}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-end space-x-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleCloseAIModal}
                                                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={aiLoading || !aiPrompt.trim() || !aiResponseName.trim() || (includeButton && !aiButtonUrl.trim())}
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none disabled:opacity-50"
                                            >
                                                {aiLoading ? (
                                                    <>
                                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                                                        Generando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <SparklesIcon className="h-4 w-4 mr-2" />
                                                        Generar respuesta
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
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