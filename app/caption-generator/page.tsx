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
import { SparklesIcon, ArrowUpTrayIcon, CheckCircleIcon, XMarkIcon, ArrowPathIcon, ArrowRightIcon, Bars3CenterLeftIcon, ChatBubbleLeftIcon, ClockIcon, InformationCircleIcon, FaceSmileIcon, LinkIcon, AtSymbolIcon } from '@heroicons/react/24/outline';
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
  const [twitterCaption, setTwitterCaption] = useState<string>('');
  const [twitterTweets, setTwitterTweets] = useState<string[]>([]);
  const [desiredWords, setDesiredWords] = useState<number>(500);
  const [youtubeChars, setYoutubeChars] = useState<number>(100);
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);
  const [includeLink, setIncludeLink] = useState<boolean>(false);
  const [includeMention, setIncludeMention] = useState<boolean>(false);
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(false);
  const [youtubeEnabled, setYoutubeEnabled] = useState<boolean>(true);
  const [mentionText, setMentionText] = useState<string>('');
  const [customLink, setCustomLink] = useState<string>('');
  const [twitterEnabled, setTwitterEnabled] = useState<boolean>(true);
  const [isThread, setIsThread] = useState<boolean>(false);
  const [tweetChars, setTweetChars] = useState<number>(240);
  const [threadCount, setThreadCount] = useState<number>(3);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const instagramRef = useRef<HTMLTextAreaElement | null>(null);
  const youtubeRef = useRef<HTMLTextAreaElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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
      const candidate = files[0];
      const MAX_BYTES = 200 * 1024 * 1024; // 200 MB
      if (candidate.size > MAX_BYTES) {
        setUploadError(t('fileTooLargeError'));
        return;
      }
      setUploadError(null);
      setFile(candidate);
      resetUploadState();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadError(null);
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
                  const options = {
                    includeEmojis,
                    link: includeLink ? customLink : undefined,
                    mention: includeMention ? mentionText : undefined,
                    includeHashtags,
                    instagramMax: desiredWords,
                    youtubeMax: youtubeChars,
                    xEnabled: twitterEnabled,
                    xIsThread: isThread,
                    xMaxChars: tweetChars,
                    xThreadCount: threadCount,
                    youtubeEnabled,
                  };

                  const capRes = await generateCaptions(id, options);
                  if (capRes.success) {
                    setInstagramCaption(capRes.data.instagramText ?? '');
                    setYoutubeCaption(capRes.data.youtubeText ?? '');
                    if (capRes.data.xText) {
                      if (Array.isArray(capRes.data.xText)) {
                        setTwitterTweets(capRes.data.xText);
                        setTwitterCaption(capRes.data.xText.join('\n\n'));
                      } else {
                        setTwitterCaption(capRes.data.xText);
                        setTwitterTweets([capRes.data.xText]);
                      }
                    }
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
        const code = (res as any).code;
        if (code === 'FILE_TOO_LARGE') {
          setUploadError(t('fileTooLargeError'));
          setStatus('');
          setIsProcessing(false);
          return;
        }
        if (code === 'VIDEO_TOO_LONG') {
          setUploadError(t('fileTooLongError'));
          setStatus('');
          setIsProcessing(false);
          return;
        }
        setStatus(res.message || t('statusError'));
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setStatus(t('statusError'));
      setIsProcessing(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(key);
    setTimeout(() => setCopyMessage(null), 2000);
  };

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    autoResize(instagramRef.current);
  }, [instagramCaption]);

  useEffect(() => {
    autoResize(youtubeRef.current);
  }, [youtubeCaption]);

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, []);

  // Scroll a la sección de inputs de captions cuando termine la generación
  useEffect(() => {
    if (!isProcessing && (instagramCaption || youtubeCaption || twitterTweets.length > 0)) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isProcessing]);

  return (
    <ProtectedRoute>
      {/* Encabezado y aviso fuera del card */}
      <InstagramAutomationWarning />
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
        title={t('title')}
        description={t('description')}
        imageSrc="/images/icons/caption-icon.png"
        imageAlt="Caption Generator"
      />

      <div className="mb-16 relative mx-2 sm:mx-4 md:mx-6 flex flex-col items-center overflow-visible">
        <div className="relative w-full max-w-5xl rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 flex flex-col items-center">
          <Link href="/caption-generator/history">
            <Button variant="neon" className="absolute top-4 right-4 rounded-full p-2 z-10">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </Button>
          </Link>
          <div className="w-full max-w-2xl relative z-10">
            <div className="p-4 sm:p-6 space-y-6 w-full max-w-2xl mx-auto">
                {/* Explicación del flujo */}
              <div className="flex items-start gap-2 mb-4 px-4 sm:px-6 w-full text-sm text-gray-400 flex-wrap">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
                <p className="flex-1 break-words whitespace-normal text-left">
                  {t('uploadExplanation')}
                </p>
                </div>
                {/* Diagrama de flujo */}
              <div className="flex items-start justify-between md:justify-center gap-1 sm:gap-2 md:gap-6 mb-6 w-full px-1">
                  {/* Paso Upload */}
                  <div className="flex flex-col items-center w-1/5">
                    <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-1 sm:p-2 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/upload-icon.png"
                        alt={t('stepUpload')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">{t('stepUpload')}</span>
                  </div>
                  <ArrowRightIcon className="self-center relative -mt-1 sm:-mt-2 md:-mt-4 h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-yellow-400 animate-pulse" />
                  {/* Paso Transcribe */}
                  <div className="flex flex-col items-center w-1/5">
                    <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-1 sm:p-2 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/transcribe-icon.png"
                        alt={t('stepTranscribe')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">{t('stepTranscribe')}</span>
                  </div>
                  <ArrowRightIcon className="self-center relative -mt-1 sm:-mt-2 md:-mt-4 h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-yellow-400 animate-pulse" />
                  {/* Paso Analyze captions */}
                  <div className="flex flex-col items-center w-1/5">
                    <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-1 sm:p-2 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/analyze-other-captions.png"
                        alt={t('stepAnalyze')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">{t('stepAnalyze')}</span>
                  </div>
                  <ArrowRightIcon className="self-center relative -mt-1 sm:-mt-2 md:-mt-4 h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-yellow-400 animate-pulse" />
                  {/* Paso Generate */}
                  <div className="flex flex-col items-center w-1/5">
                    <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-1 sm:p-2 md:p-3 relative">
                      <Image
                        src="/images/icons/captions/generate-caption-ai-icon.png"
                        alt={t('stepGenerate')}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">{t('stepGenerate')}</span>
                  </div>
                </div>
                {/* Área de subida con vista móvil */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
                <div className="w-full max-w-sm mx-auto">
                    <div
                    className={`relative w-full min-h-[180px] rounded-xl p-4 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
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
                        <p className="text-xs text-gray-400 mt-1">{t('uploadRequirements')}</p>
                        </>
                      )}
                      <input
                        type="file"
                      accept=".mov,.mkv,.mp4"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-400 text-center">{uploadError}</p>
                  )}
                </div>
              </div>
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
                {/* Controles adicionales */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4">
                  <Button
                  variant="neon"
                  size="sm"
                  className={`${includeEmojis ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                  onClick={() => setIncludeEmojis(prev => !prev)}>
                    <FaceSmileIcon className="h-4 w-4 mr-1" />
                    {t('includeEmojisButton')}
                  </Button>
                  <Button
                  variant="neon"
                  size="sm"
                  className={`${includeLink ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                  onClick={() => setIncludeLink(prev => !prev)}>
                    <LinkIcon className="h-4 w-4 mr-1" />
                    {t('includeLinkButton')}
                  </Button>
                  <Button
                  variant="neon"
                  size="sm"
                  className={`${includeMention ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                  onClick={() => setIncludeMention(prev => !prev)}>
                  <AtSymbolIcon className="h-4 w-4 mr-1" />
                  {t('includeMentionButton')}
                </Button>
                <Button
                  variant="neon"
                  size="sm"
                  className={`${includeHashtags ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                  onClick={() => setIncludeHashtags(prev => !prev)}>
                  <span className="font-semibold text-indigo-400 mr-1">#</span>
                  {t('includeHashtagsButton')}
                </Button>
              </div>
              {/* Toggles de redes sociales (YT Shorts y X) */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4">
                <Button
                  variant="neon"
                  size="sm"
                  className={`${youtubeEnabled ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                  onClick={() => setYoutubeEnabled(prev => !prev)}>
                  <SiYoutube className="h-4 w-4 mr-1 text-red-500" />
                  YT Shorts
                </Button>
                <Button
                  variant="neon"
                    size="sm"
                  className={`${twitterEnabled ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                  onClick={() => setTwitterEnabled(prev => !prev)}>
                    <span className="text-sky-500 font-bold text-sm mr-1">X</span>
                    {t('includeXButton')}
                  </Button>
                </div>
                {includeLink && (
                <div className="relative w-full mb-4">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <Input
                    type="url"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    placeholder={t('linkInputPlaceholder')}
                    className="pl-10 pr-3 py-1 w-full mb-4"
                  />
                </div>
              )}
              {includeMention && (
                <div className="relative w-full mb-4">
                  <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <Input
                    type="text"
                    value={mentionText}
                    onChange={(e) => setMentionText(e.target.value)}
                    placeholder={t('mentionInputPlaceholder')}
                    className="pl-10 pr-3 py-1 w-full mb-4"
                  />
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
              {youtubeEnabled && (
              <TextLengthSelector
                prefixIcon={<SiYoutube className="text-red-500 w-5 h-5" />}
                labelKey="lengthSliderLabelYouTube"
                countLabelKey="characters"
                min={15}
                max={100}
                step={5}
                value={youtubeChars}
                onChange={setYoutubeChars}
                  />
                )}
                {twitterEnabled && (
                <div className="space-y-4 mb-4 p-4 rounded-lg">
                    {/* Mode selector */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                      variant="neon"
                        size="sm"
                        className={`${!isThread ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                      onClick={() => setIsThread(false)}>
                      <span className="text-lg mr-1">💬</span>
                        {t('twitterModeTweet')}
                      </Button>
                      <Button
                      variant="neon"
                        size="sm"
                        className={`${isThread ? 'bg-[rgba(255,137,6,0.15)] opacity-100' : 'opacity-60'} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                      onClick={() => setIsThread(true)}>
                      <span className="text-lg mr-1">🧵</span>
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
                      <div className="space-y-2 w-full">
                        {/* Selector de número de tweets con slider */}
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <span>{t('threadCountLabel')}</span>
                          <span className="text-yellow-400 font-semibold">{threadCount}</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                        max={4}
                          step={1}
                          value={threadCount}
                          onChange={(e) => setThreadCount(Number(e.target.value))}
                        className="w-48 h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-violet-500"
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
                      </div>
                    )}
                  </div>
                )}

              {(instagramCaption || youtubeCaption) && (
                <div ref={resultsRef} className="space-y-6">
                  {instagramCaption && (
                    <div className="space-y-2 bg-[#120724] p-4 rounded-lg border border-indigo-900/30 text-white">
                      <div className="flex items-center gap-2">
                        <SiInstagram className="h-5 w-5 text-pink-500" />
                      <label className="block font-medium">{t('instagramCaptionLabel')}</label>
                      </div>
                      <textarea
                        ref={instagramRef}
                        value={instagramCaption}
                        onChange={(e) => {
                          setInstagramCaption(e.target.value);
                          autoResize(e.target);
                        }}
                        className="w-full bg-[#1c1033] p-2 rounded text-sm overflow-hidden resize-none focus:outline-none"
                        style={{ height: 'auto' }}
                      />
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{instagramCaption.length} / 2200</span>
                        <div className="flex items-center gap-2">
                          {copyMessage==='ig' && <span className="text-green-500">{t('copiedMessage')}</span>}
                          <Button size="sm" className="text-white" onClick={() => handleCopy('ig', instagramCaption)}>
                        {t('copyButton')}
                      </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {youtubeCaption && (
                    <div className="space-y-2 bg-[#120724] p-4 rounded-lg border border-indigo-900/30 text-white">
                      <div className="flex items-center gap-2">
                        <SiYoutube className="h-5 w-5 text-red-500" />
                      <label className="block font-medium">{t('youtubeCaptionLabel')}</label>
                      </div>
                      <textarea
                        ref={youtubeRef}
                        value={youtubeCaption}
                        onChange={(e) => {
                          setYoutubeCaption(e.target.value);
                          autoResize(e.target);
                        }}
                        className="w-full bg-[#1c1033] p-2 rounded text-sm overflow-hidden resize-none focus:outline-none"
                        style={{ height: 'auto' }}
                      />
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{youtubeCaption.length} / 100</span>
                        <div className="flex items-center gap-2">
                          {copyMessage==='yt' && <span className="text-green-500">{t('copiedMessage')}</span>}
                          <Button size="sm" className="text-white" onClick={() => handleCopy('yt', youtubeCaption)}>
                            {t('copyButton')}
                  </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {twitterTweets.length > 0 && (
                    <div className="space-y-2 bg-[#120724] p-4 rounded-lg border border-indigo-900/30 text-white">
                      <div className="flex items-center gap-2">
                         <svg className="h-5 w-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        <label className="block font-medium">X / Twitter</label>
                      </div>
                      <div className="space-y-4">
                        {twitterTweets.map((tw, idx) => (
                          <div key={idx} className="bg-[#050505] rounded-lg p-3 border border-gray-700 space-y-2">
                            <p className="text-sm whitespace-pre-wrap">{tw}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">{tw.length}/{tweetChars}</span>
                              <div className="flex items-center gap-2">
                                {copyMessage===`tw-${idx}` && <span className="text-green-500 text-xs">{t('copiedMessage')}</span>}
                                <Button size="sm" variant="ghost" onClick={() => handleCopy(`tw-${idx}`, tw)} className="text-xs text-white">
                          {t('copyButton')}
                        </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {isThread && (
                      <div className="flex justify-end mt-3">
                        {copyMessage==='thread-all' && <span className="text-green-500 text-xs mr-2">{t('copiedMessage')}</span>}
                        <Button size="sm" variant="outline" onClick={() => handleCopy('thread-all', twitterCaption)} className="text-xs border-indigo-600/50 hover:bg-indigo-600/30 text-white">
                          {t('copyAllButton') || 'Copiar Hilo Completo'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>
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