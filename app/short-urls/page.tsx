'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageHeader } from '@/components/ui/PageHeader';
import { CreateShortUrlModal } from '@/components/shortUrls/CreateShortUrlModal';
import { ShortUrlsTable } from '@/components/shortUrls/ShortUrlsTable';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  LinkIcon, 
  PlusIcon,
  ChartBarIcon, 
  ClipboardDocumentIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  getShortUrls, 
  getShortUrlOverviewStats, 
  createShortUrl, 
  deleteShortUrl, 
  updateShortUrl,
  type ShortUrl,
  type ShortUrlStats,
  type CreateShortUrlData 
} from '@/lib/api';

export default function ShortUrlsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);
  const [stats, setStats] = useState<ShortUrlStats | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [filters, setFilters] = useState({
    search: '',
    isActive: null as boolean | null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadData();
  }, [filters, pagination.page]);

  useEffect(() => {
    // Carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [urlsResponse, statsResponse] = await Promise.all([
        getShortUrls({ ...filters, page: pagination.page, limit: pagination.limit }),
        getShortUrlOverviewStats()
      ]);
      
      if (urlsResponse.success) {
        setShortUrls(urlsResponse.data.urls);
        setPagination(urlsResponse.data.pagination);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUrl = async (data: CreateShortUrlData) => {
    try {
      const response = await createShortUrl(data);
      if (response.success) {
        setShowCreateModal(false);
        loadData();
      } else {
        console.error('Error creating URL:', response.message);
      }
    } catch (error) {
      console.error('Error creating URL:', error);
    }
  };

  const handleDeleteUrl = async (id: string) => {
    try {
      const response = await deleteShortUrl(id);
      if (response.success) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  const handleUpdateUrl = async (id: string, data: Partial<{ title: string; description: string; isActive: boolean }>) => {
    try {
      const response = await updateShortUrl(id, data);
      if (response.success) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  };

  const handleCopyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyMessage(url);
    setTimeout(() => setCopyMessage(null), 2000);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white">Cargando...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageHeader
        icon={
          <LinkIcon className="w-14 h-14" style={{ color: '#d08216' }} />
        }
        title="URL Shortener"
        description="Crea enlaces cortos memorables para tus redes sociales y rastrea su rendimiento"
      />

      <div className="mb-16 relative mx-2 sm:mx-4 md:mx-6 flex flex-col items-center overflow-visible">
        <div className="relative w-full max-w-6xl rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 flex flex-col items-center">
          
          {/* Explicación del valor para redes sociales */}
          <div className="w-full max-w-4xl mb-8">
            <div className="flex items-start gap-3 mb-6 px-4 sm:px-6 w-full text-sm text-gray-300 bg-[#120724] rounded-lg p-4 border border-indigo-900/30">
              <InformationCircleIcon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <ShareIcon className="h-5 w-5 text-blue-400" />
                  ¿Por qué URLs cortas en redes sociales?
                </h3>
                <p className="mb-3 leading-relaxed">
                  En redes sociales es <strong>difícil hacer click en enlaces largos</strong>. Las URLs cortas y personalizadas como 
                  <span className="bg-indigo-900/40 px-2 py-1 rounded text-indigo-300 mx-1 font-mono">usuario.creator0x.com/ofertas</span> 
                  son <strong>fáciles de recordar</strong> y transmiten confianza.
                </p>
                <p className="text-gray-400 text-xs">
                  💡 Tip: Usa slugs descriptivos como "ofertas", "curso-gratis", "descuento" para mayor memorabilidad
                </p>
              </div>
            </div>
          </div>

          {/* Diagrama de flujo */}
          <div className="w-full max-w-4xl relative z-10 mb-8">
            {/* Definiciones SVG para gradientes */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#d08216" />
                  <stop offset="100%" stopColor="#e09825" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex items-start justify-between md:justify-center gap-1 sm:gap-2 md:gap-6 mb-6 w-full px-1">
              {/* Paso 1: Create */}
              <div className="flex flex-col items-center w-1/4">
                <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-2 sm:p-3 md:p-4 relative">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="url(#goldGradient)">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="mt-2 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">Crear Enlace</span>
              </div>
              <ArrowRightIcon className="self-center relative -mt-1 sm:-mt-2 md:-mt-4 h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 animate-pulse" style={{ color: '#d08216' }} />
              
              {/* Paso 2: Share */}
              <div className="flex flex-col items-center w-1/4">
                <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-2 sm:p-3 md:p-4 relative">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="url(#goldGradient)">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <span className="mt-2 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">Compartir</span>
              </div>
              <ArrowRightIcon className="self-center relative -mt-1 sm:-mt-2 md:-mt-4 h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 animate-pulse" style={{ color: '#d08216' }} />
              
              {/* Paso 3: Track */}
              <div className="flex flex-col items-center w-1/4">
                <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-2 sm:p-3 md:p-4 relative">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="url(#goldGradient)">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                  </svg>
                </div>
                <span className="mt-2 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">Rastrear Clicks</span>
              </div>
              <ArrowRightIcon className="self-center relative -mt-1 sm:-mt-2 md:-mt-4 h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 animate-pulse" style={{ color: '#d08216' }} />
              
              {/* Paso 4: Analyze */}
              <div className="flex flex-col items-center w-1/4">
                <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-2 sm:p-3 md:p-4 relative">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="url(#goldGradient)">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                  </svg>
                </div>
                <span className="mt-2 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">Ver Analytics</span>
              </div>
            </div>
          </div>

          {/* Stats Cards - Mejoradas para responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mb-6 sm:mb-8 px-2 sm:px-0">
            <div className="bg-[#120724] border border-indigo-900/30 rounded-lg p-3 sm:p-4 hover:bg-[#1a0b2e] transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0">
                  <div className="text-xs font-medium text-gray-400 truncate">Total URLs</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{stats?.totalUrls || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#120724] border border-indigo-900/30 rounded-lg p-3 sm:p-4 hover:bg-[#1a0b2e] transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0">
                  <div className="text-xs font-medium text-gray-400 truncate">Total Clicks</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{stats?.totalClicks || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#120724] border border-indigo-900/30 rounded-lg p-3 sm:p-4 hover:bg-[#1a0b2e] transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0">
                  <div className="text-xs font-medium text-gray-400 truncate">Hoy</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{stats?.todayClicks || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#120724] border border-indigo-900/30 rounded-lg p-3 sm:p-4 hover:bg-[#1a0b2e] transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0">
                  <div className="text-xs font-medium text-gray-400 truncate">7 días</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{stats?.last7DaysClicks || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón crear URL - Responsivo */}
          <Button
            onClick={() => setShowCreateModal(true)}
            className="mb-6 sm:mb-8 mx-auto flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-md text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md shadow-indigo-900/30 hover:shadow-lg hover:shadow-indigo-900/40 transform hover:scale-[1.02]"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Crear enlace corto</span>
            <span className="sm:hidden">Nuevo enlace</span>
          </Button>

          {/* URLs Table - Responsivo */}
          <div className="w-full max-w-5xl px-2 sm:px-0">
            <ShortUrlsTable
              urls={shortUrls}
              pagination={pagination}
              filters={filters}
              onFiltersChange={setFilters}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              onCopyUrl={handleCopyToClipboard}
              onDeleteUrl={handleDeleteUrl}
              onUpdateUrl={handleUpdateUrl}
              onRefresh={loadData}
              copyMessage={copyMessage}
            />
          </div>
        </div>

        {/* Sombra radial principal más grande (oculta en móvil) */}
        <div className="hidden sm:block absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>

        {/* Radiales hacia afuera (bordes, ocultos en móvil) */}
        <div className="hidden sm:block absolute -inset-32 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
      </div>

      {/* Create URL Modal */}
      {showCreateModal && (
        <CreateShortUrlModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUrl}
        />
      )}
    </ProtectedRoute>
  );
}