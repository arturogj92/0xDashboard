'use client';

import { useState, useRef } from 'react';
import { PublicComment } from '@/lib/types';
import { createPublicComment, updatePublicComment, deletePublicComment } from '@/lib/api';
import { XMarkIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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
        if (!newComment.trim()) return;

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

    const handleToggleActive = async (comment: PublicComment) => {
        setLoading(true);
        setError(null);

        try {
            const response = await updatePublicComment(comment.id, {});

            if (response.success) {
                onCommentsChange(
                    comments.map((c) => (c.id === comment.id ? response.data : c))
                );
            } else {
                setError('Error al actualizar el comentario');
            }
        } catch (err) {
            setError('Error al actualizar el comentario');
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

    return (
        <div className="text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Comentarios Públicos</h3>
            </div>
            {error && (
                <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded" role="alert">
                    <span>{error}</span>
                </div>
            )}
            <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">
                    Define los comentarios públicos que se mostrarán en tu reel.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-2 relative">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Nuevo comentario público"
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
                        disabled={loading || !newComment.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Añadir
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
        </div>
    );
} 