'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getCaptionHistory } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';

export default function CaptionHistoryPage() {
  const t = useTranslations('captionGenerator');
  const [history, setHistory] = useState<{ id: number; instagramText: string; youtubeText: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [copyMessage, setCopyMessage] = useState<string>('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await getCaptionHistory();
        if (res.success) {
          setHistory(res.data);
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(t('copiedMessage'));
    setTimeout(() => setCopyMessage(''), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">{t('historyTitle')}</h1>
        {loading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && history.length === 0 && (
          <p>{t('noHistory')}</p>
        )}
        <div className="space-y-6">
          {history.map((item: any) => (
            <div key={item.id} className="bg-[#120724] p-4 rounded-lg border border-indigo-900/30 text-white">
              <p className="text-sm text-gray-400 mb-2">
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <div className="space-y-2">
                <h3 className="font-medium">{t('instagramCaptionLabel')}</h3>
                <pre className="bg-[#1c1033] p-2 rounded whitespace-pre-wrap text-sm">{item.instagramText}</pre>
                <Button
                  size="sm"
                  className="flex items-center px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-md shadow-indigo-900/30"
                  onClick={() => handleCopy(item.instagramText)}
                >
                  {t('copyButton')}
                </Button>
              </div>
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">{t('youtubeCaptionLabel')}</h3>
                <pre className="bg-[#1c1033] p-2 rounded whitespace-pre-wrap text-sm">{item.youtubeText}</pre>
                <Button
                  size="sm"
                  className="flex items-center px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-md shadow-indigo-900/30"
                  onClick={() => handleCopy(item.youtubeText)}
                >
                  {t('copyButton')}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {copyMessage && <p className="text-green-500">{copyMessage}</p>}
      </div>
    </ProtectedRoute>
  );
} 