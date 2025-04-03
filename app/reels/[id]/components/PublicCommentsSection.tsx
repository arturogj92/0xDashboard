'use client';

import { useState, useRef } from 'react';
import { PublicComment } from '@/lib/types';
import { createPublicComment, deletePublicComment, generateAIPublicComments } from '@/lib/api';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface PublicCommentsSectionProps {
    reelId: number;
    comments: PublicComment[];
    onCommentsChange: (comments: PublicComment[]) => void;
}

export default function PublicCommentsSection({ reelId, comments, onCommentsChange }: PublicCommentsSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [openAIDialog, setOpenAIDialog] = useState(false);
    const [aiCommentsCount, setAiCommentsCount] = useState(1);
    const [generatingAI, setGeneratingAI] = useState(false);
    
    const MAX_COMMENTS = 10;
    const commentsCount = comments.length;
    const canAddMoreComments = commentsCount < MAX_COMMENTS;
    const maxPossibleAIComments = MAX_COMMENTS - commentsCount;

    const handleEmojiSelect = (emoji: any) => {
        if (inputRef.current) {
            const start = inputRef.current.selectionStart || 0;
            const end = inputRef.current.selectionEnd || 0;
            const text = newComment;
            const newText = text.substring(0, start) + emoji.native + text.substring(end);
            setNewComment(newText);

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
        if (!newComment.trim() || !canAddMoreComments) return;

        setLoading(true);
        setError(null);

        try {
            const response = await createPublicComment({
                reel_id: reelId,
                comment_message: newComment.trim(),
                id: 0
            });

            if (response.success) {
                onCommentsChange([...comments, response.data]);
                setNewComment('');
            } else {
                setError('Error al crear el comentario');
            }
        } catch (err) {
            setError('Error al crear el comentario');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await deletePublicComment(reelId, commentId);

            if (response.success) {
                onCommentsChange(comments.filter((c) => c.id !== commentId));
            } else {
                setError('Error al eliminar el comentario');
            }
        } catch (err) {
            setError('Error al eliminar el comentario');
        } finally {
            setLoading(false);
        }
    };

    const generateAIComments = async () => {
        if (aiCommentsCount <= 0 || aiCommentsCount > maxPossibleAIComments) return;
        
        setGeneratingAI(true);
        setError(null);
        
        try {
            const response = await generateAIPublicComments(reelId, aiCommentsCount);
            
            if (response.success) {
                onCommentsChange([...comments, ...response.data]);
                setOpenAIDialog(false);
            } else {
                setError(response.message || 'Error al generar comentarios con IA');
            }
        } catch (err) {
            setError('Error al generar comentarios con IA');
        } finally {
            setGeneratingAI(false);
        }
    };

    return (
        <div className="text-white">
            {error && (
                <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded" role="alert">
                    <span>{error}</span>
                </div>
            )}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">
                        Define los comentarios públicos que se mostrarán en tu reel.
                    </p>
                    
                    {canAddMoreComments && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setOpenAIDialog(true)}
                            className="flex items-center gap-1 bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 text-white hover:from-indigo-600/30 hover:to-indigo-600/20 border-indigo-500/50"
                        >
                            <SparklesIcon className="h-4 w-4 text-indigo-400" />
                            <span>Generar con IA</span>
                        </Button>
                    )}
                </div>
                
                <div className="flex items-center justify-between">
                    <p className="text-sm text-amber-400">
                        <span className="font-semibold">{commentsCount}</span> de <span className="font-semibold">{MAX_COMMENTS}</span> comentarios permitidos
                    </p>
                    {!canAddMoreComments && (
                        <p className="text-xs text-red-400">Has alcanzado el límite máximo de comentarios</p>
                    )}
                </div>
            </div>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex mb-0">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={canAddMoreComments ? "Nuevo comentario público" : "Límite de comentarios alcanzado"}
                            className="w-full bg-[#1c1033] text-white rounded-l-md border-0 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            ref={inputRef}
                            disabled={!canAddMoreComments}
                        />
                        <button
                            type="button"
                            onClick={() => canAddMoreComments && setShowEmojiPicker(!showEmojiPicker)}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${canAddMoreComments ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 cursor-not-allowed'}`}
                            disabled={!canAddMoreComments}
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowEmojiPicker(false)}>
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <Picker 
                                        data={data} 
                                        onEmojiSelect={handleEmojiSelect} 
                                        theme="dark"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim() || !canAddMoreComments}
                        className="inline-flex items-center justify-center rounded-r-md bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                    >
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Agregar
                    </button>
                </div>
            </form>
            
            <div>
                <ul className="space-y-2">
                    {comments.map((comment) => (
                        <li key={comment.id} className="flex items-center justify-between px-4 py-2 bg-indigo-900/20 rounded-lg">
                            <span className="text-white">{comment.comment_message}</span>
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30"
                                aria-label="Eliminar comentario"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Dialog para generar comentarios con IA */}
            <Dialog open={openAIDialog} onOpenChange={setOpenAIDialog}>
                <DialogContent className="bg-[#120724] border border-indigo-900/30 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <SparklesIcon className="h-5 w-5 text-indigo-400" />
                            Generar comentarios con IA
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            La IA generará comentarios relevantes para tu reel basándose en el título del reel y la respuesta que has definido. Es recomendable tener configurada tu respuesta automática antes de generar comentarios.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <div className="bg-amber-900/20 border border-amber-800/30 p-3 rounded-md text-sm text-amber-300 mb-4">
                            <p>La generación de comentarios puede tardar unos segundos. Por favor, ten paciencia mientras la IA procesa tu solicitud.</p>
                        </div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Número de comentarios a generar
                        </label>
                        <div className="flex items-center bg-[#1c1033] rounded-md p-2">
                            <button
                                type="button"
                                onClick={() => setAiCommentsCount(prev => Math.max(1, prev - 1))}
                                className="w-8 h-8 flex items-center justify-center text-white bg-indigo-700/30 rounded-md hover:bg-indigo-700/50"
                                disabled={aiCommentsCount <= 1}
                            >
                                -
                            </button>
                            <span className="flex-1 text-center text-xl font-semibold">
                                {aiCommentsCount}
                            </span>
                            <button
                                type="button"
                                onClick={() => setAiCommentsCount(prev => Math.min(3, prev + 1))}
                                className="w-8 h-8 flex items-center justify-center text-white bg-indigo-700/30 rounded-md hover:bg-indigo-700/50"
                                disabled={aiCommentsCount >= 3}
                            >
                                +
                            </button>
                        </div>
                        
                        <p className="mt-2 text-xs text-gray-400">
                            Puedes generar hasta <span className="text-amber-400 font-semibold">3</span> comentarios por generación.
                        </p>
                    </div>
                    
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setOpenAIDialog(false)}
                            className="border-gray-700 hover:bg-[#1c1033] text-gray-300"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={generateAIComments}
                            disabled={generatingAI || aiCommentsCount <= 0 || aiCommentsCount > maxPossibleAIComments}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                        >
                            {generatingAI ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="h-4 w-4" />
                                    Generar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 