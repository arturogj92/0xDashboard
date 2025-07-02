import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {DM_Sans, Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Image from "next/image";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import RootLayoutServer from "@/components/layout/RootLayoutServer";
import Footer from './components/Footer';
import { cn } from "@/lib/utils";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { I18nProvider } from '@/contexts/I18nContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Creator0x',
  description: 'Panel de administración para gestionar respuestas automáticas de Instagram',
};

const dmSans = DM_Sans({
  subsets: ['latin'],   // o ['latin', 'latin-ext'] etc.
  weight: ['400'], // pesos que uses
  variable: '--font-dm-sans',  // para usarla como variable CSS
  display: 'swap',      // recomendación de Google
});

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  if (!googleClientId) {
    console.error("Error: La variable de entorno NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurada.");
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={cn(
          "bg-grid-background font-sans antialiased",
          inter.className,
          dmSans.variable
        )}
      >
        <div id="fb-root"></div>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              <I18nProvider>
              <RootLayoutServer>
                {children}
              </RootLayoutServer>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                  },
                }}
              />
              </I18nProvider>
              <SpeedInsights />
              <Analytics />
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <div>Error: La configuración de Google Login está incompleta. Contacta al administrador.</div>
        )}
      </body>
    </html>
  );
}