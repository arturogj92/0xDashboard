'use client';
import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

// Tipos compatibles con nuestros locales soportados
export type SupportedLocale = 'es' | 'en';

interface LocaleContextType {
  locale: SupportedLocale;
  setLocale: (newLocale: SupportedLocale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Inicializamos con 'en' por defecto, luego localStorage, luego idioma del navegador, y finalmente preferencia del usuario
  let initialLocale: SupportedLocale = 'en';
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as SupportedLocale | null;
    if (stored === 'es' || stored === 'en') {
      initialLocale = stored;
    } else if (navigator.language) {
      const nav = navigator.language.split('-')[0];
      if (nav === 'es' || nav === 'en') {
        initialLocale = nav as SupportedLocale;
      }
    }
  }
  if (user?.locale === 'en' || user?.locale === 'es') {
    initialLocale = user.locale as SupportedLocale;
  }

  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);

  // Efecto para simular carga y evitar parpadeo de idioma
  useEffect(() => {
    // Pequeño timeout para permitir hidratación
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    // TODO: Llamar a la API para guardar la preferencia en backend cuando esté disponible
  };

  const messages = useMemo(() => {
    switch (locale) {
      case 'en':
        return enMessages as Record<string, unknown>;
      default:
        return esMessages as Record<string, unknown>;
    }
  }, [locale]);

  // Obtener la zona horaria del navegador
  const timeZone = useMemo(() => {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    // Fallback en caso de que no esté disponible
    return 'UTC';
  }, []);

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen bg-[#0a0416]">
            {/* Puedes añadir un spinner aquí si quieres */}
          </div>
        ) : (
          children
        )}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale debe usarse dentro de un I18nProvider');
  }
  return context;
}; 