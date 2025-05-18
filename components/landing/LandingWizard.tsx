'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { User, Info, Globe } from 'lucide-react';
import Image from 'next/image';
import { LandingPreview } from './LandingPreview';

export default function LandingWizard() {
  const t = useTranslations('landing');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');
  const slugRegex = /^[a-z0-9-]{0,30}$/;

  const checkSlugAvailability = async (value: string) => {
    if (!value) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    try {
      // Endpoint de comprobación de disponibilidad (aún no implementado en backend)
      const res = await fetch(`/api/landings/slug-exists?slug=${value}`);
      const data = await res.json();
      setSlugStatus(data.available ? 'free' : 'taken');
    } catch (_) {
      // Si falla la llamada, asumimos que está libre para no bloquear al usuario
      setSlugStatus('free');
    }
  };

  const generateSlug = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30);

  // Actualizar slug automáticamente si el usuario aún no lo ha tocado
  useEffect(() => {
    if (!slug) {
      const suggested = generateSlug(name);
      if (suggested && slugRegex.test(suggested)) {
        setSlug(suggested);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Debounce para la comprobación
  useEffect(() => {
    const handler = setTimeout(() => {
      if (slugRegex.test(slug)) {
        checkSlugAvailability(slug);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [slug]);

  const handleSave = async () => {
    if (!name.trim() || !slug.trim() || slugStatus !== 'free') return;
    setSaving(true);
    try {
      const payload = { name, description: description.trim(), slug };
      await fetch('/api/landings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // TODO: replace with router push when editor exists
      alert('Landing creada, ahora redirigiríamos al editor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-[1fr_auto] md:gap-10 items-start">
      {/* Columna izquierda */}
      <div>
        <div className="flex items-start gap-2 mb-4 px-4 sm:px-6 w-full text-sm text-gray-400 flex-wrap">
          <Info className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
          <p className="flex-1 break-words whitespace-normal text-left">
            {t('introExplanation')}
          </p>
        </div>
        {/* Pasos visuales */}
        <div className="flex items-start justify-between md:justify-center gap-1 sm:gap-2 md:gap-6 mb-6 w-full px-1">
          {[
            t('stepConfigure'),
            t('stepLinks'),
            t('stepSections'),
            t('stepSocial'),
            t('stepStats')
          ].map((label, idx, arr) => (
            <React.Fragment key={`step-${idx}`}>
              <div className="flex flex-col items-center w-1/5">
                <div className="bg-[#1c1033] rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 p-1 sm:p-2 md:p-3 relative">
                  <Image src="/images/icons/landing-generator-flat.png" alt={label} fill className="object-contain" />
                </div>
                <span className="mt-1 text-[10px] sm:text-xs text-gray-200 font-medium text-center leading-tight w-full">{label}</span>
              </div>
              {idx < arr.length - 1 && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="self-center relative -mt-1 sm:-mt-2 md:-mt-4 h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-yellow-400 animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
            <User className="w-4 h-4 text-gray-400" /> {t('titleLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 50))}
            placeholder={t('namePlaceholder')}
            className="w-full bg-transparent text-white placeholder:text-muted-foreground hover:bg-[#1c1033] focus:bg-[#1c1033] rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 border-b border-gray-600"
          />
          <p className="text-xs text-muted-foreground mt-1">{t('nameHelper')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1 justify-between">
            <span className="flex items-center gap-1"><Info className="w-4 h-4 text-gray-400" /> {t('descriptionLabel')}</span>
            <span className="text-xs text-muted-foreground">{description.length}/50</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 50))}
            placeholder={t('descriptionPlaceholder')}
            className="w-full bg-transparent text-white placeholder:text-muted-foreground hover:bg-[#1c1033] focus:bg-[#1c1033] rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 border-b border-gray-600"
          />
          <p className="text-xs text-muted-foreground mt-1">{t('descriptionHelper')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
            <Globe className="w-4 h-4 text-gray-400" /> {t('slugLabel')}
          </label>
          <input
            type="text"
            value={slug}
            onChange={e => {
              const raw = e.target.value.toLowerCase();
              if (slugRegex.test(raw)) setSlug(raw);
            }}
            placeholder={t('slugPlaceholder')}
            className="w-full bg-transparent text-white placeholder:text-muted-foreground hover:bg-[#1c1033] focus:bg-[#1c1033] rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 border-b border-gray-600"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            {t('slugPreview')} <span className="font-mono text-white">{slug || t('slugPlaceholder')}.creator0x.com</span>
          </p>
          {slug && (
            <p className={`text-xs mt-1 ${slugStatus === 'taken' ? 'text-red-500' : 'text-green-500'}`}>
              {slugStatus === 'checking' && '...'}
              {slugStatus === 'free' && t('slugFree')}
              {slugStatus === 'taken' && t('slugTaken')}
            </p>
          )}
        </div>
        <div className="pt-4 text-right md:col-span-2">
          <button
            onClick={handleSave}
            disabled={!name.trim() || !slug.trim() || slugStatus !== 'free' || saving}
            className="px-5 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '...' : t('continue')}
          </button>
        </div>
      </div>

      {/* Columna derecha: preview (solo md+) */}
      <div className="hidden md:flex justify-center items-start">
        <LandingPreview name={name} description={description} />
      </div>
    </div>
  );
} 