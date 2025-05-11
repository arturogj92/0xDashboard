'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getCaptionHistory } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { SiInstagram, SiYoutube } from 'react-icons/si';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { PageHeader } from '@/components/ui/PageHeader';

// Helper para extraer tweets de X/Twitter
const getTwitterTweets = (xText?: string | string[]): string[] => {
  if (!xText) return [];
  if (Array.isArray(xText)) return xText;
  try {
    const parsed = JSON.parse(xText);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
    // No es JSON válido, tratar como texto único
  }
  return [xText];
};

// Helper para detectar si es un hilo (más de un tweet)
const detectIsThread = (xText?: string | string[]): boolean => {
  return getTwitterTweets(xText).length > 1;
};

export default function CaptionHistoryPage() {
  const t = useTranslations('captionGenerator');
  const [history, setHistory] = useState<{ 
    id: number; 
    instagramText: string; 
    youtubeText: string; 
    xText?: string | string[];
    createdAt: string 
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  // Estado y cálculo para paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await getCaptionHistory();
        if (res.success) {
          // Ordenar por fecha de creación, de más reciente a más antiguo
          const sortedHistory = [...res.data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setHistory(sortedHistory);
        } else {
          setError(res.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(key);
    setTimeout(() => setCopyMessage(null), 2000);
  };
  
  // Ahora `renderTwitterContent` usa la función semántica `parseXText`
  const renderTwitterContent = (item: any) => {
    const twitterTweets = getTwitterTweets(item.xText);
    if (twitterTweets.length === 0) return null;
    const isThread = detectIsThread(item.xText);

    return (
      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
          <h3 className="font-medium">X / Twitter</h3>
        </div>
        <div className="space-y-4">
          {twitterTweets.map((tw, idx) => (
            <div key={idx} className="bg-[#050505] rounded-lg p-3 border border-gray-700 space-y-2">
              <p className="text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">{tw}</p>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-white"
                  onClick={() => handleCopy(`tweet-${item.id}-${idx}`, tw)}
                >
                  {copyMessage === `tweet-${item.id}-${idx}` ? t('copiedMessage') : t('copyButton')}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {isThread && (
          <div className="flex justify-end mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(`thread-${item.id}`, twitterTweets.join('\n\n'))}
              className="text-xs border-indigo-600/50 hover:bg-indigo-600/30 text-white"
            >
              {copyMessage === `thread-${item.id}` ? t('copiedMessage') : t('copyAllButton')}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Skeleton para mostrar durante la carga
  const HistorySkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#120724] p-4 rounded-lg border border-indigo-900/30 text-white space-y-6 mb-6">
          <Skeleton className="h-4 w-48 mb-4" />
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-24 w-full rounded" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-12 w-full rounded" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-16 w-full rounded" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <ProtectedRoute>
      <PageHeader
        icon={
          <div className="relative w-14 h-14">
            <Image 
              src="/images/icons/caption-generator-icon.png"
              alt="Caption Generator Icon"
              fill
              className="object-contain"
            />
          </div>
        }
        title={t('historyTitle')}
        description={t('historyDescription')}
        imageSrc="/images/icons/caption-icon.png"
        imageAlt="Caption History"
      />
      
      <div className="mb-16 relative mx-2 sm:mx-4 md:mx-6 flex flex-col items-center overflow-x-hidden">
        <div className="relative w-full max-w-5xl rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 flex flex-col items-center">
          <Link href="/caption-generator">
            <Button variant="ghost" className="absolute top-4 left-4 text-gray-400 hover:text-white">
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              {t('backButton')}
            </Button>
          </Link>
          
          <div className="w-full max-w-2xl relative z-10 mt-10">
            {loading ? (
              <HistorySkeleton />
            ) : error ? (
              <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-[#120724] p-8 rounded-lg border border-indigo-900/30 text-center">
                <ClockIcon className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
                <p className="text-gray-300">{t('noHistory')}</p>
                <Link href="/caption-generator">
                  <Button className="mt-4">{t('createFirstCaption')}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedHistory.map((item: any) => (
                  <div key={item.id} className="bg-[#120724] p-4 sm:p-6 rounded-lg border border-indigo-900/30 text-white">
                    <p className="text-sm text-gray-400 mb-4">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    
                    {item.instagramText && (
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2">
                          <SiInstagram className="h-5 w-5 text-pink-500" />
                          <h3 className="font-medium">{t('instagramCaptionLabel')}</h3>
                        </div>
                        <div className="bg-[#1c1033] p-3 rounded whitespace-pre-wrap text-sm max-h-[300px] overflow-y-auto">
                          {item.instagramText}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>{item.instagramText.length} / 2200</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(`ig-${item.id}`, item.instagramText)}
                            className="text-white"
                          >
                            {copyMessage === `ig-${item.id}` ? t('copiedMessage') : t('copyButton')}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {item.youtubeText && (
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2">
                          <SiYoutube className="h-5 w-5 text-red-500" />
                          <h3 className="font-medium">{t('youtubeCaptionLabel')}</h3>
                        </div>
                        <div className="bg-[#1c1033] p-3 rounded whitespace-pre-wrap text-sm max-h-[150px] overflow-y-auto">
                          {item.youtubeText}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>{item.youtubeText.length} / 100</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(`yt-${item.id}`, item.youtubeText)}
                            className="text-white"
                          >
                            {copyMessage === `yt-${item.id}` ? t('copiedMessage') : t('copyButton')}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {renderTwitterContent(item)}
                  </div>
                ))}
                {/* Controles de paginación */}
                <div className="flex justify-between items-center mt-4">
                  <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    {t('previousPage')}
                  </Button>
                  <span className="text-xs text-gray-400">{`${t('page')} ${currentPage} ${t('of')} ${totalPages}`}</span>
                  <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                    {t('nextPage')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sombra radial principal más grande (oculta en móvil) */}
        <div className="hidden sm:block absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>

        {/* Radiales hacia afuera (bordes, ocultos en móvil) */}
        <div className="hidden sm:block absolute -inset-32 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
      </div>
    </ProtectedRoute>
  );
} 