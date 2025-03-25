'use client';

import { useEffect, useState } from 'react';
import { Reel } from '@/lib/types';
import { getReels, toggleReelStatus, deleteReel } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await getReels();
        if (response.success) {
          // Mapear is_active a active para mantener compatibilidad
          const formattedReels = response.data.map((reel: any) => ({
            ...reel,
            active: reel.is_active
          }));
          setReels(formattedReels);
        } else {
          setError('Error al cargar los reels');
        }
      } catch (err) {
        setError('Error al cargar los reels');
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este reel?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      // Llamar a la API para eliminar el reel
      const response = await deleteReel(id);

      if (response.success) {
        // Actualizar el estado local después de eliminar
        setReels(reels.filter(reel => reel.id !== id));
      } else {
        setError('Error al eliminar el reel');
      }
    } catch (err) {
      setError('Error al eliminar el reel');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setDeleteLoading(id);
    try {
      // Implementar la llamada a la API para cambiar el estado
      const response = await toggleReelStatus(id, !currentStatus);

      if (response.success) {
        // Actualizar el estado local después de cambiar el estado
        setReels(reels.map(reel =>
          reel.id === id ? { ...reel, active: !currentStatus, is_active: !currentStatus } : reel
        ));
      } else {
        setError('Error al cambiar el estado del reel');
      }
    } catch (err) {
      setError('Error al cambiar el estado del reel');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Reels</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de reels configurados para respuestas automáticas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/reels/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Añadir Reel
          </Link>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      URL
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Descripción
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reels.map((reel) => (
                    <tr key={reel.id} className={!reel.is_active ? "bg-gray-50" : ""}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <a href={reel.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                          {reel.url}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reel.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${reel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {reel.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex space-x-3 justify-end">
                          <Link
                            href={`/reels/${reel.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggleActive(reel.id, reel.is_active || false)}
                            disabled={deleteLoading === reel.id}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {deleteLoading === reel.id ? 'Procesando...' : (reel.is_active ? 'Desactivar' : 'Activar')}
                          </button>
                          <button
                            onClick={() => handleDelete(reel.id)}
                            disabled={deleteLoading === reel.id}
                            className="text-red-600 hover:text-red-900"
                          >
                            {deleteLoading === reel.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
