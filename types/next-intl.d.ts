// Declaraciones para next-intl v3
declare module 'next-intl/client' {
  import React from 'react';
  export interface NextIntlClientProviderProps {
    locale: string;
    messages: Record<string, unknown>;
    children: React.ReactNode;
    /** Zona horaria para el formateo de fechas */
    timeZone?: string;
    /** Valor de referencia para 'now' */
    now?: Date | number | string;
    /** Configuración de formatos personalizados */
    formats?: Record<string, unknown>;
  }
  export function NextIntlClientProvider(props: NextIntlClientProviderProps): JSX.Element;
}

declare module 'next-intl' {
  import React from 'react';
  export interface UseTranslations {
    (key: string): string;
    raw: (key: string) => unknown;
    rich?: (key: string, values: Record<string, unknown>) => React.ReactNode;
  }
  export function useTranslations(namespace?: string): UseTranslations;
  export * from 'next-intl/client';
} 