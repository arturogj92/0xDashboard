import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {DM_Sans, Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Image from "next/image";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import RootLayoutInner from "@/components/layout/RootLayoutInner";
import Footer from './components/Footer';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '0xReplyer Dashboard',
  description: 'Panel de administración para gestionar respuestas automáticas de Instagram',
};

const dmSans = DM_Sans({
  subsets: ['latin'],   // o ['latin', 'latin-ext'] etc.
  weight: ['400'], // pesos que uses
  variable: '--font-dm-sans',  // para usarla como variable CSS
  display: 'swap',      // recomendación de Google
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-[#080213] font-sans antialiased",
          inter.className,
          dmSans.variable
        )}
      >
        <div id="fb-root"></div>
        <AuthProvider>
          <RootLayoutInner>
            {children}
          </RootLayoutInner>
          <SpeedInsights />
          <Analytics />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}