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
        <div className="relative w-full max-w-5xl rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 flex flex-col items-center">
          <div className="w-full max-w-2xl relative z-10">
            <div className="p-4 sm:p-6 space-y-6 w-full max-w-2xl mx-auto">
              <LandingWizard />
            </div>
          </div>
        </div>
        {/* Sombra radial principal más grande (oculta en móvil) */}
        <div className="hidden sm:block absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>

        {/* Radiales hacia afuera (bordes, ocultos en móvil) */}
        <div className="hidden sm:block absolute -inset-32 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
      </div>
    </ProtectedRoute>
  );
} 