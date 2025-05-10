'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { uploadMedia, getMediaStatus, generateCaptions } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { InstagramAutomationWarning } from '@/components/auth/InstagramAutomationWarning';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { SparklesIcon, ArrowUpTrayIcon, CheckCircleIcon, XMarkIcon, ArrowPathIcon, ArrowRightIcon, Bars3CenterLeftIcon, ClockIcon, InformationCircleIcon, FaceSmileIcon, LinkIcon } from '@heroicons/react/24/outline';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import TextLengthSelector from '@/components/caption/TextLengthSelector';
import { SiInstagram, SiTiktok, SiYoutube } from 'react-icons/si';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function CaptionGeneratorPage() {
  const t = useTranslations('captionGenerator');
  const [file, setFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [instagramCaption, setInstagramCaption] = useState<string>('');
  const [youtubeCaption, setYoutubeCaption] = useState<string>('');
  const [desiredWords, setDesiredWords] = useState<number>(150);
  const [youtubeChars, setYoutubeChars] = useState<number>(50);
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(false);
  const [includeLink, setIncludeLink] = useState<boolean>(false);
  const [customLink, setCustomLink] = useState<string>('');
  const [twitterEnabled, setTwitterEnabled] = useState<boolean>(false);
  const [isThread, setIsThread] = useState<boolean>(false);
  const [tweetChars, setTweetChars] = useState<number>(240);
  const [threadCount, setThreadCount] = useState<number>(3);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string>('');
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetUploadState = () => {
    setMediaId(null);
    setStatus('');
    setTranscript('');
    setInstagramCaption('');
    setYoutubeCaption('');
  };

  const handleClear = () => {
    setFile(null);
    resetUploadState();
  };

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      resetUploadState();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus(t('uploading'));
    try {
      const res = await uploadMedia(file);
      if (res.success) {
        const id = res.data.mediaId;
        setMediaId(id);
        setStatus(t('statusUploading'));
        // Iniciar polling de estado
        pollInterval.current = setInterval(async () => {
          const stat = await getMediaStatus(id);
          if (stat.success) {
            const st = stat.data.status;
            // map status to translation key, capitalizing first letter
            const key = 'status' + st.charAt(0).toUpperCase() + st.slice(1);
            setStatus(t(key));
            if (st === 'transcribed' || st === 'error' || st === 'captioned') {
              if (pollInterval.current) {
                clearInterval(pollInterval.current);
                pollInterval.current = null;
              }
              if (st === 'transcribed') {
                // Llamar automáticamente a generación de captions
                setStatus(t('generatingCaption'));
                try {
                  const capRes = await generateCaptions(id);
                  if (capRes.success) {
                    setInstagramCaption(capRes.data.instagramText);
                    setYoutubeCaption(capRes.data.youtubeText);
                    setStatus('');
                  } else {
                    setStatus(capRes.message || t('statusError'));
                  }
                } catch (err) {
                  console.error(err);
                  setStatus(t('statusError'));
                } finally {
                  setIsProcessing(false);
                }
              } else {
                // error o captioned
                setIsProcessing(false);
              }
            }
          } else {
            if (pollInterval.current) {
              clearInterval(pollInterval.current);
              pollInterval.current = null;
            }
            setStatus(stat.message || t('statusError'));
            setIsProcessing(false);
          }
        }, 1000);
      } else {
        setStatus(res.message || t('statusError'));
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setStatus(t('statusError'));
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(t('copiedMessage'));
    setTimeout(() => setCopyMessage(''), 2000);
  };

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, []);

  return (
    <ProtectedRoute>
      {/* Encabezado y aviso fuera del card */}
      <InstagramAutomationWarning />
      <PageHeader
        icon={<FileText className="w-10 h-10" />}
        title={t('title')}
        description={t('description')}
        imageSrc="/images/icons/caption-icon.png"
        imageAlt="Caption Generator"
      />

      <div className="mb-16 relative mx-4 md:mx-6 flex flex-col items-center">
        <div className="absolute -inset-12 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.35)_0%,_rgba(168,85,247,0.3)_40%,_rgba(17,24,39,0)_100%)] opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute -inset-12 bg-[radial-gradient(circle_at_top_right,_rgba(255,94,0,0.3)_0%,_rgba(99,102,241,0.25)_40%,_rgba(17,24,39,0)_100%)] opacity-40 blur-3xl pointer-events-none"></div>
        <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 flex flex-col items-center">
          <Link href="/caption-generator/history">
            <Button variant="outline" className="absolute top-4 right-4 rounded-full p-2 hover:bg-indigo-600/50 border-indigo-600/50 z-10">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </Button>
          </Link>
          <div className="w-full max-w-2xl relative z-10">
            <div className="flex items-center justify-center">
              <div className="flex-1 p-4 space-y-6 max-w-2xl mx-auto">
                {/* Explicación del flujo */}
                <div className="flex items-start gap-2 mb-4 px-2 text-sm text-gray-400">
                  <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <p className="flex-1">{t('uploadExplanation')}</p>
                </div>
                {/* Diagrama de flujo */}
                <div className="flex items-start justify-center gap-2 sm:gap-4 md:gap-6 mb-6">
                  {/* Paso Upload */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#1c1033] rounded-xl w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-2 sm:p-3 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/upload-icon.png"
                        alt={t('stepUpload')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-xs sm:text-sm text-gray-200 font-medium text-center leading-tight max-w-[5rem]">{t('stepUpload')}</span>
                  </div>
                  <ArrowRightIcon className="self-center relative -mt-2 sm:-mt-3 md:-mt-4 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 text-yellow-400 animate-pulse" />
                  {/* Paso Transcribe */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#1c1033] rounded-xl w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-2 sm:p-3 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/transcribe-icon.png"
                        alt={t('stepTranscribe')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-xs sm:text-sm text-gray-200 font-medium text-center leading-tight max-w-[5rem]">{t('stepTranscribe')}</span>
                  </div>
                  <ArrowRightIcon className="self-center relative -mt-2 sm:-mt-3 md:-mt-4 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 text-yellow-400 animate-pulse" />
                  {/* Paso Analyze captions */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#1c1033] rounded-xl w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-2 sm:p-3 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/analyze-other-captions.png"
                        alt={t('stepAnalyze')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-xs sm:text-sm text-gray-200 font-medium text-center leading-tight max-w-[5rem]">{t('stepAnalyze')}</span>
                  </div>
                  <ArrowRightIcon className="self-center relative -mt-2 sm:-mt-3 md:-mt-4 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 text-yellow-400 animate-pulse" />
                  {/* Paso Generate */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#1c1033] rounded-xl w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-2 sm:p-3 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/generate-caption-ai-icon.png"
                        alt={t('stepGenerate')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-xs sm:text-sm text-gray-200 font-medium text-center leading-tight max-w-[5rem]">{t('stepGenerate')}</span>
                  </div>
                </div>
                {/* Área de subida con vista móvil */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-6 mb-6">
                  <div className="flex-1">
                    <div
                      className={`relative w-full min-h-[180px] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                        ${file
                          ? 'border-2 border-green-400 bg-green-900/40'
                          : 'border-2 border-dashed border-indigo-600/40 bg-[#1c1033]/40 hover:bg-[#1c1033]/60 hover:border-indigo-400'
                        }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFiles(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {file ? (
                        <>
                          <CheckCircleIcon className="h-12 w-12 text-green-400 mb-3" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleClear(); }}
                            className="absolute top-2 right-2 bg-[#1c1033] p-2 rounded-full hover:bg-gray-700 z-10"
                          >
                            <XMarkIcon className="h-5 w-5 text-red-400" />
                          </button>
                          <p className="text-lg font-semibold text-white truncate max-w-full mb-1">
                            {t('uploadDone')}
                          </p>
                          <p className="text-sm text-gray-300">{file.name}</p>
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="h-10 w-10 text-indigo-400 mb-3" />
                          <p className="font-medium text-gray-300">{t('uploadLabel')}</p>
                          <p className="text-xs text-gray-500 mt-1">{t('uploadButton')}</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                {/* Controles adicionales */}
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      includeEmojis
                        ? 'border-violet-500 bg-violet-600 text-white hover:bg-violet-700'
                        : 'border-violet-500 text-violet-400 hover:bg-violet-500/20'
                    }
                    onClick={() => setIncludeEmojis(prev => !prev)}
                  >
                    <FaceSmileIcon className="h-4 w-4 mr-1" />
                    {t('includeEmojisButton')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      includeLink
                        ? 'border-violet-500 bg-violet-600 text-white hover:bg-violet-700'
                        : 'border-violet-500 text-violet-400 hover:bg-violet-500/20'
                    }
                    onClick={() => setIncludeLink(prev => !prev)}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    {t('includeLinkButton')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      twitterEnabled
                        ? 'border-violet-500 bg-violet-600 text-white hover:bg-violet-700'
                        : 'border-violet-500 text-violet-400 hover:bg-violet-500/20'
                    }
                    onClick={() => setTwitterEnabled(prev => !prev)}
                  >
                    <span className="text-sky-500 font-bold text-sm mr-1">X</span>
                    {t('includeXButton')}
                  </Button>
                </div>
                {includeLink && (
                  <Input
                    type="url"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    placeholder={t('linkInputPlaceholder')}
                    className="w-full mb-4"
                  />
                )}
                {twitterEnabled && (
                  <div className="space-y-4 mb-4 border border-indigo-700/40 p-4 rounded-lg">
                    {/* Mode selector */}
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          !isThread
                            ? 'border-violet-500 bg-violet-600 text-white hover:bg-violet-700'
                            : 'border-violet-500 text-violet-400 hover:bg-violet-500/20'
                        }
                        onClick={() => setIsThread(false)}
                      >
                        {t('twitterModeTweet')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          isThread
                            ? 'border-violet-500 bg-violet-600 text-white hover:bg-violet-700'
                            : 'border-violet-500 text-violet-400 hover:bg-violet-500/20'
                        }
                        onClick={() => setIsThread(true)}
                      >
                        {t('twitterModeThread')}
                      </Button>
                    </div>
                    {!isThread ? (
                      <TextLengthSelector
                        prefixIcon={<span className="text-sky-500 font-bold w-5 h-5">X</span>}
                        labelKey="twitterCharLabel"
                        min={20}
                        max={280}
                        step={10}
                        value={tweetChars}
                        onChange={setTweetChars}
                      />
                    ) : (
                      <motion.div layout className="space-y-2 w-full">
                        {/* Selector de número de tweets con slider */}
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <span>{t('threadCountLabel')}</span>
                          <span className="text-yellow-400 font-semibold">{threadCount}</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={10}
                          step={1}
                          value={threadCount}
                          onChange={(e) => setThreadCount(Number(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-violet-500"
                        />
                        <p className="text-xs text-gray-400">{t('threadPreviewTitle')}</p>
                        <div className="space-y-2">
                          <AnimatePresence initial={false}>
                            {Array.from({ length: threadCount }).map((_, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="bg-[#1c1033] p-2 rounded text-gray-500 text-sm"
                              >
                                {`Tweet ${idx + 1}/${threadCount}...`}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                {/* Selector longitud para Instagram/TikTok y otras RRSS */}
                <TextLengthSelector
                  prefixIcon={
                    <div className="flex items-center space-x-1">
                      <SiInstagram className="text-pink-500 w-5 h-5" />
                      <SiTiktok className="text-white w-5 h-5" />
                    </div>
                  }
                  labelKey="lengthSliderLabelIg"
                  value={desiredWords}
                  onChange={setDesiredWords}
                />
                {/* Selector longitud para YouTube Shorts */}
                <TextLengthSelector
                  prefixIcon={<SiYoutube className="text-red-500 w-5 h-5" />}
                  labelKey="lengthSliderLabelYouTube"
                  countLabelKey="characters"
                  min={5}
                  max={100}
                  step={5}
                  value={youtubeChars}
                  onChange={setYoutubeChars}
                />

                {file && (
                  <Button
                    onClick={handleUpload}
                    disabled={isProcessing}
                    className="mx-auto flex items-center px-6 py-3 border border-transparent rounded-md text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md shadow-indigo-900/30 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <ArrowPathIcon className="h-6 w-6 mr-2 animate-spin text-white" />
                        {status}
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        {t('generateCaptionButton')}
                      </>
                    )}
                  </Button>
                )}

                {(instagramCaption || youtubeCaption) && (
                  <div className="space-y-6">
                    {instagramCaption && (
                      <div className="space-y-1 bg-[#120724] p-4 rounded-lg border border-indigo-900/30 text-white">
                        <label className="block font-medium">{t('instagramCaptionLabel')}</label>
                        <pre className="bg-[#1c1033] p-2 rounded whitespace-pre-wrap text-sm">{instagramCaption}</pre>
                        <Button size="sm" onClick={() => handleCopy(instagramCaption)}>
                          {t('copyButton')}
                        </Button>
                      </div>
                    )}
                    {youtubeCaption && (
                      <div className="space-y-1 bg-[#120724] p-4 rounded-lg border border-indigo-900/30 text-white">
                        <label className="block font-medium">{t('youtubeCaptionLabel')}</label>
                        <pre className="bg-[#1c1033] p-2 rounded whitespace-pre-wrap text-sm">{youtubeCaption}</pre>
                        <Button size="sm" onClick={() => handleCopy(youtubeCaption)}>
                          {t('copyButton')}
                        </Button>
                      </div>
                    )}
                    {copyMessage && <p className="text-green-500 text-sm">{copyMessage}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 