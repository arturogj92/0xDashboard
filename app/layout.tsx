import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {DM_Sans, Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Image from "next/image";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserNav } from "@/components/auth/UserNav";
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
    <html lang="es" className="dark">
      <body className={`inter.className ${dmSans.variable}`}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <nav className="bg-[#120724] shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <Image 
                        src="/images/logo.png" 
                        alt="0xReplyer Logo" 
                        width={32} 
                        height={32} 
                        className="mr-1 mb" 
                      />
                      <h1 className="text-xl font-bold bg-gradient-to-tr from-blue-300 to-purple-400 bg-clip-text text-transparent">{">"} Replyer</h1>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Link 
                      href="/" 
                      className="mr-4 inline-flex items-center px-4 py-1.5 text-sm font-medium text-white hover:text-purple-300 transition-colors bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full"
                    >
                      <Image 
                        src="/images/icons/automation-icon.png" 
                        alt="Automatizaciones" 
                        width={16} 
                        height={16} 
                        className="mr-1.5" 
                      />
                      Tus automatizaciones
                    </Link>
                    <UserNav />
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
          <SpeedInsights />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}