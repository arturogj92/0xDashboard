'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableColumnHeader } from '@/components/ui/SortableColumnHeader';
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
  FireIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { type ShortUrl, getUserSlug } from '@/lib/api';

// Column configuration type
interface ColumnConfig {
  id: string;
  label: string;
  minWidth?: string;
  isActionColumn?: boolean;
}

// Default column order - Note: labels will be translated in component
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'url', label: 'shortUrl', minWidth: 'min-w-[200px]' },
  { id: 'destination', label: 'destination', minWidth: 'min-w-[180px]' },
  { id: 'clicks', label: 'clicks', minWidth: 'min-w-[120px]' },
  { id: 'status', label: 'status', minWidth: 'min-w-[100px]' },
  { id: 'actions', label: 'actions', isActionColumn: true, minWidth: 'min-w-[120px]' },
  { id: 'created', label: 'created', minWidth: 'min-w-[130px]' }
];

// localStorage key for column order
const COLUMN_ORDER_STORAGE_KEY = 'shortUrls_columnOrder';

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
  onStatsClick?: (url: ShortUrl) => void;
  copyMessage: string | null;
  isSearching?: boolean;
  userCustomDomain?: string | null;
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
  onStatsClick,
  copyMessage,
  isSearching = false,
  userCustomDomain
}: ShortUrlsTableProps) {
  const t = useTranslations('shortUrls');
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ originalUrl: string; slug: string }>({ originalUrl: '', slug: '' });
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [clickedUrl, setClickedUrl] = useState<string | null>(null);
  const [deleteConfirmUrl, setDeleteConfirmUrl] = useState<string | null>(null);
  
  // Local state for URLs to avoid reloads on status toggle
  const [localUrls, setLocalUrls] = useState<ShortUrl[]>(urls);
  
  // Column drag states
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  
  // Local sorting state
  const [localSortBy, setLocalSortBy] = useState<string | null>(null);
  const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // DnD Kit sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // Load column order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder) && parsedOrder.length === DEFAULT_COLUMNS.length) {
          setColumns(parsedOrder);
        }
      } catch (error) {
        console.warn('Failed to parse saved column order:', error);
      }
    }
  }, []);

  // Sync local URLs with prop changes
  useEffect(() => {
    setLocalUrls(urls);
  }, [urls]);

  // Load user slug for URL generation
  useEffect(() => {
    const loadUserSlug = async () => {
      try {
        const response = await getUserSlug();
        if (response.success && response.data.slug) {
          setUserSlug(response.data.slug);
        }
      } catch (error) {
        console.error('Error loading user slug:', error);
      }
    };

    loadUserSlug();
  }, []);

  // Sort URLs locally
  const sortedUrls = useMemo(() => {
    if (!localSortBy) return localUrls;

    return [...localUrls].sort((a, b) => {
      let aValue = a[localSortBy as keyof ShortUrl];
      let bValue = b[localSortBy as keyof ShortUrl];

      // Handle different data types
      if (localSortBy === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (localSortBy === 'isActive') {
        // Convert boolean to number for sorting
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if ((aValue ?? '') < (bValue ?? '')) return localSortOrder === 'asc' ? -1 : 1;
      if ((aValue ?? '') > (bValue ?? '')) return localSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [localUrls, localSortBy, localSortOrder]);

  // Save column order to localStorage
  const saveColumnOrder = (newColumns: ColumnConfig[]) => {
    localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(newColumns));
  };

  // Handle column drag end with dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = arrayMove(columns, oldIndex, newIndex);
        setColumns(newColumns);
        saveColumnOrder(newColumns);
      }
    }
  };

  // Reset columns to default order
  const resetColumnOrder = () => {
    setColumns(DEFAULT_COLUMNS);
    localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY);
  };

  // Handle column sorting locally
  const handleColumnSort = (columnId: string) => {
    let sortField = columnId;
    
    // Map column IDs to actual sortable fields
    switch (columnId) {
      case 'url':
        sortField = 'slug';
        break;
      case 'destination':
        sortField = 'originalUrl';
        break;
      case 'clicks':
        sortField = 'clickCount';
        break;
      case 'status':
        sortField = 'isActive';
        break;
      case 'created':
        sortField = 'createdAt';
        break;
      default:
        return; // No sorting for actions column
    }

    // Toggle sort order if clicking the same column
    const newSortOrder = localSortBy === sortField && localSortOrder === 'desc' ? 'asc' : 'desc';
    setLocalSortBy(sortField);
    setLocalSortOrder(newSortOrder);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmUrl(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmUrl) {
      onDeleteUrl(deleteConfirmUrl);
      setDeleteConfirmUrl(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmUrl(null);
  };

  // Render cell content based on column type
  const renderCellContent = (column: ColumnConfig, url: ShortUrl) => {
    switch (column.id) {
      case 'url':
        return (
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
            <div className="min-w-0 flex-1 relative">
              {editingUrl === url.id ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <input
                    type="text"
                    value={editData.slug}
                    onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                    className="w-full bg-[#1c1033] border border-indigo-500 rounded px-2 py-1 text-sm text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder={t('table.placeholders.editSlug')}
                    autoFocus
                  />
                </motion.div>
              ) : (
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button 
                      className="text-sm font-medium text-white hover:text-indigo-300 transition-colors cursor-pointer text-left w-full truncate"
                      onClick={() => handleCopyWithAnimation(getShortUrl(url, userCustomDomain || undefined))}
                    >
                      {getShortUrl(url, userCustomDomain || undefined)}
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {copyMessage === getShortUrl(url, userCustomDomain || undefined) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                        style={{ 
                          position: 'absolute',
                          top: '-32px',
                          left: '0',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                          zIndex: 10
                        }}
                      >
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          style={{ marginRight: '4px' }}
                        >
                          ✨
                        </motion.div>
                        <span className="text-sm font-medium">{t('messages.linkCopied')}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        );

      case 'destination':
        return (
          <div>
            {editingUrl === url.id ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                <input
                  type="text"
                  value={editData.originalUrl}
                  onChange={(e) => setEditData({ ...editData, originalUrl: e.target.value })}
                  className="w-full bg-[#1c1033] border border-indigo-500 rounded px-2 py-1 text-sm text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder={t('table.placeholders.editDestination')}
                />
              </motion.div>
            ) : (
              <div className="text-sm text-gray-300 truncate max-w-xs group-hover:text-white transition-colors">
                {url.originalUrl}
              </div>
            )}
          </div>
        );

      case 'clicks':
        return (
          <motion.div 
            style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '2rem' }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {getClicksIcon(url.clickCount)}
            </motion.div>
            <span className={`text-sm font-bold ${getClicksColor(url.clickCount)} leading-none`}>
              {url.clickCount.toLocaleString()}
            </span>
          </motion.div>
        );

      case 'status':
        return (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => handleToggleStatus(url.id, url.isActive)}
              className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 w-24 justify-center whitespace-nowrap ${
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
            {url.isActive ? t('table.status.active') : t('table.status.inactive')}
            </button>
          </motion.div>
        );

      case 'actions':
        return (
          <div className="flex items-center justify-end gap-2">
            {editingUrl === url.id ? (
              <motion.div 
                style={{ display: 'flex', gap: '8px' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSaveEdit}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-900/30"
                  >
                    {t('table.buttons.save')}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleCancelEdit}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {t('table.buttons.cancel')}
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {/* Botón de estadísticas */}
                {onStatsClick && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => onStatsClick(url)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-900/30"
                      title={t('table.buttons.viewStats')}
                    >
                      <ChartPieIcon className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
                
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
                    onClick={() => handleDeleteClick(url.id)}
                    size="sm"
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-900/30"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        );

      case 'created':
        return (
          <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            {formatDate(url.createdAt)}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  // Prevent form submission on Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
      return false;
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Update local state immediately for instant feedback
    setLocalUrls(prevUrls => 
      prevUrls.map(url => 
        url.id === id 
          ? { ...url, isActive: !currentStatus }
          : url
      )
    );

    // Send API call in the background without reloading
    try {
      await onUpdateUrl(id, { isActive: !currentStatus });
    } catch (error) {
      // If API call fails, revert the local state
      setLocalUrls(prevUrls => 
        prevUrls.map(url => 
          url.id === id 
            ? { ...url, isActive: currentStatus }
            : url
        )
      );
      console.error('Failed to update URL status:', error);
    }
  };

  const handleStartEdit = (url: ShortUrl) => {
    setEditingUrl(url.id);
    setEditData({
      originalUrl: url.originalUrl || '',
      slug: url.slug || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingUrl) {
      onUpdateUrl(editingUrl, editData);
      setEditingUrl(null);
      setEditData({ originalUrl: '', slug: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingUrl(null);
    setEditData({ originalUrl: '', slug: '' });
  };

  const handleCopyWithAnimation = (url: string) => {
    console.log('Copy clicked:', url);
    console.log('Current copyMessage:', copyMessage);
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

  const getShortUrl = (url: ShortUrl, userCustomDomain?: string) => {
    // If URL has a pre-generated short URL, use it
    if (url.shortUrl) {
      return url.shortUrl;
    }
    
    // If user has an active custom domain, use it instead of subdomain
    if (userCustomDomain) {
      return `${userCustomDomain}/${url.slug}`;
    }
    
    // Fallback to default subdomain format
    return `${userSlug || 'user'}.creator0x.com/${url.slug}`;
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


  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda con animaciones */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <motion.div 
            style={{ position: 'relative' }}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {isSearching ? (
              <motion.div
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '20px', width: '20px', color: '#818cf8' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div className="h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full" />
              </motion.div>
            ) : (
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            )}
            <Input
              type="text"
              placeholder={t('table.search.placeholder')}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  return false;
                }
              }}
              className="pl-10 bg-[#1c1033] border-gray-700 text-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-3">
          <Button
            onClick={resetColumnOrder}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
          >
            {t('table.buttons.resetColumns')}
          </Button>
          </div>
        </motion.div>
        </div>
      </motion.div>


      {/* Tabla responsive con animaciones */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl shadow-2xl min-h-[600px] overflow-hidden relative" data-table-container>
        {/* Animación de flecha para indicar scroll horizontal (solo una vez, solo si hay URLs) */}
        {urls.length > 0 && (
          <motion.div 
            style={{
              position: 'absolute',
              top: '50%',
              right: '32px',
              transform: 'translateY(-50%)',
              zIndex: 20,
              pointerEvents: 'none'
            }}
            initial={{ opacity: 0, x: -15 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              x: [-15, 5, 20, 35]
            }}
            transition={{ 
              duration: 2.5,
              delay: 1,
              ease: "easeInOut"
            }}
          >
            <div className="flex items-center">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ 
                  duration: 0.6,
                  repeat: 3,
                  ease: "easeInOut"
                }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                <svg className="w-6 h-6 text-indigo-400 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
        {/* Gradiente de fade en el borde derecho */}
        <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-[#120724] via-[#120724]/60 to-transparent pointer-events-none z-10"></div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full divide-y divide-indigo-900/30">
              <SortableContext 
                items={columns.map(col => col.id)} 
                strategy={horizontalListSortingStrategy}
              >
                <thead className="bg-gradient-to-r from-[#1c1033] to-[#2c1b4d] sticky top-0 z-10 shadow-lg shadow-[#120724]/50 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-indigo-500/0 after:via-indigo-500/50 after:to-indigo-500/0">
                  <tr>
                    {columns.map((column) => (
                      <SortableColumnHeader
                        key={column.id}
                        id={column.id}
                        isActionColumn={column.isActionColumn}
                        minWidth={column.minWidth}
                        onSort={handleColumnSort}
                        sortBy={localSortBy || undefined}
                        sortOrder={localSortOrder}
                      >
                        {t(`table.headers.${column.label}`)}
                      </SortableColumnHeader>
                    ))}
                  </tr>
                </thead>
              </SortableContext>
            <tbody className="divide-y divide-indigo-900/30">
              <AnimatePresence>
                {sortedUrls.length > 0 ? (
                  sortedUrls.map((url, index) => (
                    <motion.tr 
                      key={url.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {columns.map((column) => (
                        <td 
                          key={column.id}
                          className={`px-6 py-4 whitespace-nowrap hover:bg-gradient-to-r hover:from-[#1c1033]/50 hover:to-[#2c1b4d]/50 transition-all duration-300 group ${
                            column.isActionColumn ? 'text-right text-sm font-medium' : ''
                          } ${
                            column.minWidth || ''
                          }`}
                          onMouseEnter={() => setHoveredUrl(url.id)}
                          onMouseLeave={() => setHoveredUrl(null)}
                        >
                          {renderCellContent(column, url)}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <td colSpan={columns.length} className="px-6 py-12 text-center bg-gradient-to-r from-[#120724] to-[#1c1033]">
                      <div className="flex flex-col items-center justify-center space-y-4">
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
                          {filters.search ? (
                            <span className="text-4xl">🔍</span>
                          ) : (
                            <LinkIcon className="h-12 w-12 text-indigo-400 mx-auto" />
                          )}
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="text-center">
                          <h3 className="text-lg font-bold text-white mb-2 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                            {filters.search ? t('table.emptyState.search.title') : t('table.emptyState.noLinks.title')}
                          </h3>
                          
                          <p className="text-gray-300 mb-4 text-sm">
                            {filters.search 
                              ? t('table.emptyState.search.description') 
                              : t('table.emptyState.noLinks.description')
                            }
                          </p>
                          
                          {filters.search && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              <Button 
                                onClick={() => handleSearchChange('')}
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-900/30 transform transition-all duration-200 hover:scale-105"
                              >
                                <SparklesIcon className="h-4 w-4 mr-2" />
                                {t('table.buttons.clearSearch')}
                              </Button>
                            </motion.div>
                          )}
                          </div>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </DndContext>
        </div>
        </div>
      </motion.div>

      {/* Paginación con animaciones */}
      {pagination.totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-center mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
          </div>
        </motion.div>
      )}

      {/* Información de resultados con estilo emocional */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center text-sm text-gray-400">
        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-medium">
          {(() => {
            try {
              const text = t('table.pagination.info');
              console.log('Translation result:', text);
              console.log('Is text a translation key?', text.includes('shortUrls.table.pagination.info'));
              
              // If text contains the key, return a fallback
              if (text.includes('shortUrls.table.pagination.info')) {
                const count = sortedUrls.length;
                const total = pagination.totalCount || 0;
                const plural = total !== 1 ? 's' : '';
                return `✨ Showing ${count} of ${total} magical link${plural}`;
              }
              
              return text
                .replace('{count}', sortedUrls.length.toString())
                .replace('{total}', (pagination.totalCount || 0).toString())
                .replace('{plural}', (pagination.totalCount || 0) !== 1 ? 's' : '')
                .replace('{pluralMagic}', (pagination.totalCount || 0) !== 1 ? 's' : '');
            } catch (error) {
              console.error('Translation error:', error);
              const count = sortedUrls.length;
              const total = pagination.totalCount || 0;
              const plural = total !== 1 ? 's' : '';
              return `✨ Showing ${count} of ${total} magical link${plural}`;
            }
          })()}
        </span>
        {filters.search && (
          <span className="ml-2 text-yellow-400">
            {(() => {
              const searchInfo = t('table.pagination.searchInfo');
              console.log('Search info translation:', searchInfo);
              
              // Fallback if translation fails
              if (searchInfo.includes('shortUrls.table.pagination.searchInfo')) {
                return `for "${filters.search}" 🔍`;
              }
              
              return searchInfo.replace('{search}', filters.search);
            })()}
          </span>
        )}
        </div>
      </motion.div>

      {/* Modal de confirmación de borrado */}
      <AnimatePresence>
        {deleteConfirmUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTap={handleCancelDelete}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onTap={(e: any) => e.stopPropagation()}
              style={{
                backgroundColor: '#120724',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                maxWidth: '28rem',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <TrashIcon className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t('table.deleteModal.title')}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t('table.deleteModal.subtitle')}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                {t('table.deleteModal.description')}
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleCancelDelete}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {t('table.deleteModal.cancel')}
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  {t('table.deleteModal.confirm')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}