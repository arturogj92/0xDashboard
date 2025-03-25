'use client';

import { useState } from 'react';
import { PublicComment } from '@/lib/types';
import { createPublicComment, updatePublicComment, deletePublicComment } from '@/lib/api';

interface PublicCommentsSectionProps {
    reelId: number;
    comments: PublicComment[];
    onCommentsChange: (comments: PublicComment[]) => void;
}

export default function PublicCommentsSection({ reelId, comments, onCommentsChange }: PublicCommentsSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await createPublicComment({
                reel_id: reelId,
                comment_message: newComment.trim(),
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
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Comentarios Públicos</h3>
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
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Nuevo comentario"
                            className="block w-full rounded-md border-gray-300 text-black pl-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading || !newComment.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Añadir
                        </button>
                    </div>
                </form>
                <div className="mt-4">
                    <ul className="divide-y divide-gray-200">
                        {comments.map((comment) => (
                            <li key={comment.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-900">{comment.comment_message}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(comment.id)}
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