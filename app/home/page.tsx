'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChatBubbleLeftRightIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { LinkIcon, Settings } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

// Componente para cada card con animación
function FeatureCard({ 
  title, 
  description, 
  icon, 
  href, 
  gradient,
  delay = 0
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  delay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href}>
      <div 
        className={`group relative h-48 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-700 ease-out hover:scale-105 hover:-translate-y-2 animate-slide-in-up`}
        style={{ animationDelay: `${delay}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 ${gradient}`} />
        
        {/* Animated overlay */}
        <div 
          className={`absolute inset-0 bg-black/30 transition-all duration-700 ease-out ${
            isHovered ? 'bg-black/50' : 'bg-black/30'
          }`} 
        />
        
        {/* Content */}
        <div className="relative h-full p-6 flex flex-col text-white z-10">
          {/* Header: título izquierda, ícono derecha */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg flex-1">{title}</h3>
            <div className={`w-10 h-10 ml-4 transform transition-all duration-700 ease-out flex-shrink-0 ${
              isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
            }`}>
              {icon}
            </div>
          </div>
          
          {/* Description - más espacio disponible */}
          <div className="flex-1 flex items-center">
            <p className="text-sm text-white/95 drop-shadow-md leading-relaxed">{description}</p>
          </div>
        </div>
        
        {/* Burbujas decorativas visibles por detrás */}
        <div className={`absolute top-6 right-20 w-16 h-16 rounded-full bg-white/20 animate-move-circular z-0 transition-all duration-700 ease-out ${
          isHovered ? 'scale-150 opacity-35' : 'scale-100 opacity-25'
        }`} />
        <div className={`absolute bottom-8 left-6 w-12 h-12 rounded-full bg-white/18 animate-move-vertical z-0 transition-all duration-700 ease-out ${
          isHovered ? 'scale-140 opacity-30' : 'scale-100 opacity-22'
        }`} />
        <div className={`absolute top-1/3 left-8 w-10 h-10 rounded-full bg-white/15 animate-move-horizontal z-0 transition-all duration-700 ease-out ${
          isHovered ? 'scale-130 opacity-25' : 'scale-100 opacity-18'
        }`} />
        <div className={`absolute bottom-1/3 right-8 w-8 h-8 rounded-full bg-white/12 animate-move-diagonal z-0 transition-all duration-700 ease-out ${
          isHovered ? 'scale-125 opacity-20' : 'scale-100 opacity-15'
        }`} />
        <div className={`absolute top-1/2 right-12 w-6 h-6 rounded-full bg-white/10 animate-pulse-slow z-0 transition-all duration-700 ease-out ${
          isHovered ? 'scale-120 opacity-18' : 'scale-100 opacity-12'
        }`} />
        
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const t = useTranslations('dashboard');

  const features = [
    {
      title: t('automations.title') || 'Automatizaciones',
      description: t('automations.description') || 'Gestiona tus reels e historias de Instagram con respuestas automáticas inteligentes.',
      icon: (
        <Image 
          src="/images/icons/automation-icon.png"
          alt="Automation Icon"
          fill
          className="object-contain"
        />
      ),
      href: "/automations",
      gradient: "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800"
    },
    {
      title: t('captionGenerator.title') || 'Generador de Captions',
      description: t('captionGenerator.description') || 'Crea captions atractivos para tus publicaciones con IA avanzada.',
      icon: (
        <Image 
          src="/images/icons/caption-generator-icon.png"
          alt="Caption Generator Icon"
          fill
          className="object-contain"
        />
      ),
      href: "/caption-generator", 
      gradient: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700"
    },
    {
      title: t('urlShortener.title') || 'URLs Cortas',
      description: t('urlShortener.description') || 'Acorta enlaces y rastrea clics con análisis detallados en tiempo real.',
      icon: <LinkIcon className="w-full h-full text-white" style={{ color: '#d08216' }} />,
      href: "/short-urls",
      gradient: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"
    },
    {
      title: t('landing.title') || 'Mi Landing',
      description: t('landing.description') || 'Personaliza tu página de aterrizaje con enlaces sociales y diseño único.',
      icon: <Settings className="w-full h-full text-white" style={{ color: '#d08216' }} />,
      href: "/landing",
      gradient: "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0e35] to-[#2d1b69] py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {/* @ts-expect-error permitir interpolación de variables en traducción */}
              {t('welcomeTitle', { name: user?.name || user?.username || 'Usuario' }) || `¡Hola, ${user?.name || user?.username || 'Usuario'}!`}
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              {t('welcomeDescription') || 'Bienvenido a tu centro de control. Desde aquí puedes acceder a todas las herramientas que necesitas para hacer crecer tu presencia digital.'}
            </p>

            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 150}
              />
            ))}
          </div>

          {/* Quick Stats or Additional CTA */}
          <div className="mt-20 text-center animate-fade-in-delayed">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('footerTitle') || '🚀 Todo en un solo lugar'}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('footerDescription') || 'Gestiona tus automatizaciones, crea contenido, acorta enlaces y personaliza tu presencia online desde una plataforma integrada.'}
              </p>
              <Button 
                variant="outline" 
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 transition-all duration-300"
                asChild
              >
                <Link href="/profile">
                  {t('viewProfile') || 'Ver mi perfil'}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 0.8s forwards;
          opacity: 0;
        }

        @keyframes move-circular {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(-60px, -40px) rotate(90deg) scale(1.8); }
          50% { transform: translate(-120px, 0) rotate(180deg) scale(0.5); }
          75% { transform: translate(-60px, 40px) rotate(270deg) scale(1.5); }
          100% { transform: translate(0, 0) rotate(360deg) scale(1); }
        }

        @keyframes move-vertical {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-50px) rotate(45deg) scale(1.6); }
          50% { transform: translateY(-100px) rotate(180deg) scale(0.3); }
          75% { transform: translateY(-50px) rotate(315deg) scale(1.4); }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }

        @keyframes move-horizontal {
          0% { transform: translateX(0) rotate(0deg) scale(1); }
          25% { transform: translateX(80px) rotate(90deg) scale(0.4); }
          50% { transform: translateX(160px) rotate(180deg) scale(2); }
          75% { transform: translateX(80px) rotate(270deg) scale(0.7); }
          100% { transform: translateX(0) rotate(360deg) scale(1); }
        }

        @keyframes move-diagonal {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          20% { transform: translate(50px, -30px) rotate(72deg) scale(1.7); }
          40% { transform: translate(100px, 20px) rotate(144deg) scale(0.6); }
          60% { transform: translate(70px, 60px) rotate(216deg) scale(1.3); }
          80% { transform: translate(20px, 40px) rotate(288deg) scale(0.8); }
          100% { transform: translate(0, 0) rotate(360deg) scale(1); }
        }

        @keyframes pulse-slow {
          0% { opacity: 0.12; transform: scale(0.5) rotate(0deg); }
          25% { opacity: 0.3; transform: scale(2.2) rotate(90deg); }
          50% { opacity: 0.15; transform: scale(0.3) rotate(180deg); }
          75% { opacity: 0.28; transform: scale(1.8) rotate(270deg); }
          100% { opacity: 0.12; transform: scale(0.5) rotate(360deg); }
        }

        .animate-move-circular {
          animation: move-circular 4s ease-in-out infinite;
        }

        .animate-move-vertical {
          animation: move-vertical 3s ease-in-out infinite 0.8s;
        }

        .animate-move-horizontal {
          animation: move-horizontal 3.5s ease-in-out infinite 1.2s;
        }

        .animate-move-diagonal {
          animation: move-diagonal 4.5s ease-in-out infinite 0.3s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2.5s ease-in-out infinite 1s;
        }

      `}</style>
    </ProtectedRoute>
  );
}