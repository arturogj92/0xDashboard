'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/Pagination';
import { SortingDropdown } from '@/components/ui/SortingDropdown';
import { HideFiltersDropdown } from '@/components/ui/HideFiltersDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LinkIcon, 
  ClipboardDocumentIcon, 
  EyeIcon, 
  EyeSlashIcon,
  TrashIcon,
  PencilIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  HeartIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { type ShortUrl } from '@/lib/api';

interface ShortUrlsTableProps {
  urls: ShortUrl[];
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  filters: {
    search: string;
    isActive: boolean | null;
    sortBy: string;
    sortOrder: string;
  };
  onFiltersChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  onCopyUrl: (url: string) => void;
  onDeleteUrl: (id: string) => void;
  onUpdateUrl: (id: string, data: any) => void;
  onRefresh: () => void;
  copyMessage: string | null;
}

export function ShortUrlsTable({
  urls,
  pagination,
  filters,
  onFiltersChange,
  onPageChange,
  onCopyUrl,
  onDeleteUrl,
  onUpdateUrl,
  onRefresh,
  copyMessage
}: ShortUrlsTableProps) {
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ title: string; description: string }>({ title: '', description: '' });
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [clickedUrl, setClickedUrl] = useState<string | null>(null);

  const sortOptions = [
    { value: 'created_at', label: 'Fecha de creación' },
    { value: 'click_count', label: 'Número de clicks' },
    { value: 'slug', label: 'Slug' },
    { value: 'title', label: 'Título' }
  ];

  const statusOptions = [
    { value: null, label: 'Todos los estados' },
    { value: true, label: 'Solo activos' },
    { value: false, label: 'Solo inactivos' }
  ];

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  const handleStatusFilter = (isActive: boolean | null) => {
    onFiltersChange({ ...filters, isActive });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    onUpdateUrl(id, { isActive: !currentStatus });
  };

  const handleStartEdit = (url: ShortUrl) => {
    setEditingUrl(url.id);
    setEditData({
      title: url.title || '',
      description: url.description || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingUrl) {
      onUpdateUrl(editingUrl, editData);
      setEditingUrl(null);
      setEditData({ title: '', description: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingUrl(null);
    setEditData({ title: '', description: '' });
  };

  const handleCopyWithAnimation = (url: string) => {
    setClickedUrl(url);
    onCopyUrl(url);
    setTimeout(() => setClickedUrl(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getShortUrl = (url: ShortUrl) => {
    return url.shortUrl || `${url.username || 'user'}.creator0x.com/${url.slug}`;
  };

  const getClicksIcon = (clickCount: number) => {
    if (clickCount > 100) return <FireIcon className="h-4 w-4 text-orange-400 mr-2" />;
    if (clickCount > 50) return <HeartIcon className="h-4 w-4 text-pink-400 mr-2" />;
    if (clickCount > 10) return <SparklesIcon className="h-4 w-4 text-yellow-400 mr-2" />;
    return <ChartBarIcon className="h-4 w-4 text-green-400 mr-2" />;
  };

  const getClicksColor = (clickCount: number) => {
    if (clickCount > 100) return 'text-orange-400';
    if (clickCount > 50) return 'text-pink-400';
    if (clickCount > 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (urls.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl p-12 text-center relative overflow-hidden"
      >
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full blur-xl"
          />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2 
          }}
        >
          <LinkIcon className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
        </motion.div>
        
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent"
        >
          {filters.search ? '🔍 No encontramos nada' : '✨ Tu primer enlace te espera'}
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 mb-6 text-lg"
        >
          {filters.search 
            ? 'Intenta con otras palabras clave o limpia la búsqueda' 
            : 'Crea enlaces cortos memorables y observa cómo crecen tus clicks 📈'
          }
        </motion.p>
        
        {filters.search && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              onClick={() => handleSearchChange('')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-purple-900/30 transform transition-all duration-200 hover:scale-105"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Limpiar búsqueda
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda con animaciones */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="flex-1">
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="🔍 Buscar por slug, título o URL..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </motion.div>
        </div>
        
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SortingDropdown
            options={sortOptions}
            currentSort={filters.sortBy}
            currentOrder={filters.sortOrder}
            onSortChange={handleSortChange}
          />
          
          <HideFiltersDropdown
            options={statusOptions}
            currentFilter={filters.isActive}
            onFilterChange={handleStatusFilter}
            label="Estado"
          />
        </motion.div>
      </motion.div>

      {/* Tabla responsive con animaciones */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-900/30">
            <thead className="bg-gradient-to-r from-[#1c1033] to-[#2c1b4d]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                  🔗 URL Corta
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                  🎯 Destino
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                  📊 Clicks
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                  ⚡ Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                  📅 Creado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-200 uppercase tracking-wider">
                  🛠️ Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-900/30">
              <AnimatePresence>
                {urls.map((url, index) => (
                  <motion.tr 
                    key={url.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gradient-to-r hover:from-[#1c1033]/50 hover:to-[#2c1b4d]/50 transition-all duration-300 group"
                    onMouseEnter={() => setHoveredUrl(url.id)}
                    onMouseLeave={() => setHoveredUrl(null)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <motion.div
                          animate={{ 
                            rotate: hoveredUrl === url.id ? [0, -10, 10, 0] : 0,
                            scale: hoveredUrl === url.id ? 1.1 : 1 
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <LinkIcon className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <motion.div 
                            className="text-sm font-medium text-white truncate"
                            whileHover={{ scale: 1.02 }}
                          >
                            {getShortUrl(url)}
                          </motion.div>
                          {(url.title || editingUrl === url.id) && (
                            <motion.div 
                              className="text-xs text-gray-400 mt-1"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                            >
                              {editingUrl === url.id ? (
                                <motion.input
                                  initial={{ scale: 0.95 }}
                                  animate={{ scale: 1 }}
                                  type="text"
                                  value={editData.title}
                                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                  className="w-full bg-[#1c1033] border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                  placeholder="✨ Título"
                                />
                              ) : (
                                url.title
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 truncate max-w-xs group-hover:text-white transition-colors">
                        {url.originalUrl}
                      </div>
                      {(url.description || editingUrl === url.id) && (
                        <motion.div 
                          className="text-xs text-gray-400 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {editingUrl === url.id ? (
                            <motion.textarea
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              value={editData.description}
                              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                              className="w-full bg-[#1c1033] border border-gray-600 rounded px-2 py-1 text-xs text-white resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                              placeholder="📝 Descripción"
                              rows={2}
                            />
                          ) : (
                            <span className="line-clamp-2">{url.description}</span>
                          )}
                        </motion.div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <motion.div
                          animate={{ 
                            rotate: hoveredUrl === url.id ? [0, 360] : 0 
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          {getClicksIcon(url.clickCount)}
                        </motion.div>
                        <span className={`text-sm font-bold ${getClicksColor(url.clickCount)}`}>
                          {url.clickCount.toLocaleString()}
                        </span>
                      </motion.div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleStatus(url.id, url.isActive)}
                        className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                          url.isActive
                            ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 border border-green-500/30 hover:from-green-800/50 hover:to-emerald-800/50 shadow-lg shadow-green-900/20'
                            : 'bg-gradient-to-r from-red-900/40 to-pink-900/40 text-red-300 border border-red-500/30 hover:from-red-800/50 hover:to-pink-800/50 shadow-lg shadow-red-900/20'
                        }`}
                      >
                        <motion.div
                          animate={{ rotate: url.isActive ? 0 : 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          {url.isActive ? (
                            <EyeIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <EyeSlashIcon className="h-3 w-3 mr-1" />
                          )}
                        </motion.div>
                        {url.isActive ? 'Activo' : 'Inactivo'}
                      </motion.button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      {formatDate(url.createdAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {editingUrl === url.id ? (
                          <motion.div 
                            className="flex gap-2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={handleSaveEdit}
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-900/30"
                              >
                                ✅ Guardar
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                ❌ Cancelar
                              </Button>
                            </motion.div>
                          </motion.div>
                        ) : (
                          <>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                onClick={() => handleCopyWithAnimation(getShortUrl(url))}
                                size="sm"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-900/30 relative overflow-hidden"
                              >
                                <motion.div
                                  animate={{ 
                                    rotate: clickedUrl === getShortUrl(url) ? [0, 360] : 0,
                                    scale: clickedUrl === getShortUrl(url) ? [1, 1.2, 1] : 1
                                  }}
                                  transition={{ duration: 0.6 }}
                                >
                                  <ClipboardDocumentIcon className="h-4 w-4" />
                                </motion.div>
                                <AnimatePresence>
                                  {copyMessage === getShortUrl(url) && (
                                    <motion.span 
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      className="ml-1 text-xs"
                                    >
                                      ✨ ¡Copiado!
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                onClick={() => handleStartEdit(url)}
                                size="sm"
                                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg shadow-yellow-900/30"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                onClick={() => onDeleteUrl(url.id)}
                                size="sm"
                                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-900/30"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Paginación con animaciones */}
      {pagination.totalPages > 1 && (
        <motion.div 
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </motion.div>
      )}

      {/* Información de resultados con estilo emocional */}
      <motion.div 
        className="text-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-medium">
          ✨ Mostrando {urls.length} de {pagination.totalCount} enlace{pagination.totalCount !== 1 ? 's' : ''} mágico{pagination.totalCount !== 1 ? 's' : ''}
        </span>
        {filters.search && (
          <span className="ml-2 text-yellow-400">
            para "{filters.search}" 🔍
          </span>
        )}
      </motion.div>
    </div>
  );
}