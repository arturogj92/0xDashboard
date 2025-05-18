'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileText } from 'lucide-react';
import LandingWizard from '@/components/landing/LandingWizard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function LandingPage() {
  const t = useTranslations('landing');
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