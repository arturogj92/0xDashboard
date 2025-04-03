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
                <div className="flex justify-between h-12">
                  <div className="flex">
                    <Link href="/" className="flex-shrink-0 flex items-center">
                      <Image 
                        src="/images/logo.png" 
                        alt="0xReplyer Logo" 
                        width={26} 
                        height={26} 
                        className="mr-1" 
                      />
                      <h1 className="text-lg font-bold bg-gradient-to-tr from-blue-300 to-purple-400 bg-clip-text text-transparent">{">"} Replyer</h1>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/precios" 
                      className="flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-md shadow-indigo-900/30"
                    >
                      Contratar
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