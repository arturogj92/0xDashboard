// Declaraciones para next-intl v3
declare module 'next-intl/client' {
  import React from 'react';
  export function NextIntlClientProvider(props: {
    locale: string;
    messages: Record<string, unknown>;
    children: React.ReactNode;
  }): JSX.Element;
}

declare module 'next-intl' {
  export * from 'next-intl/client';
} 