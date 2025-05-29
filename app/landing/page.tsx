'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileText } from 'lucide-react';
import LandingWizard from '@/components/landing/LandingWizard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const t = useTranslations('landing');
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLanding = async () => {
      if (!user?.id) return;
      
      try {
        // Verificar si el usuario tiene una landing creada
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/landings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.landings && data.landings.length > 0) {
            // Si tiene una landing, redirigir al editor
            const firstLanding = data.landings[0];
            router.push(`/editor/${firstLanding.id}`);
          } else {
            // No tiene landings, mostrar el wizard
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking user landing:', error);
        setLoading(false);
      }
    };

    checkUserLanding();
  }, [user, router]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white">Cargando...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageHeader
        icon={<FileText className="w-8 h-8" />}
        title={t('configuratorTitle')}
        description={t('configuratorDescription')}
        imageSrc="/images/icons/landing-generator-icon.png"
        imageAlt="Landing illustration"
      />
      <div className="mb-16 relative mx-2 sm:mx-4 md:mx-6 flex flex-col items-center overflow-visible">
        <div className="relative w-full max-w-5xl rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl pt-8 pb-3 px-3 sm:pt-10 sm:pb-4 sm:px-4 flex flex-col items-center justify-center">
          <div className="relative z-10 w-full max-w-3xl mx-auto">
            <LandingWizard />
          </div>
        </div>
        {/* Fondo radial principal visible en todas las resoluciones */}
        <div className="block absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>

        {/* Radiales de borde visibles en todas las resoluciones */}
        <div className="block absolute -inset-32 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
      </div>
    </ProtectedRoute>
  );
} 