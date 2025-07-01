'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  index = 0
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  index?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Variantes de animación para las cards
  const cardVariants = {
    hidden: {
      opacity: 0,
      x: index % 2 === 0 ? -100 : 100,
      y: 50,
      scale: 0.8,
      rotate: index % 2 === 0 ? -10 : 10,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.2,
        duration: 0.8
      }
    },
    hover: {
      scale: 1.08,
      y: -20,
      rotate: 3,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      }
    }
  };

  return (
    <Link href={href}>
      <div 
        className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-white/10 bg-black/20 shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-200 ease-out min-h-[80px] sm:min-h-[95px] md:min-h-[110px] lg:min-h-[130px] xl:min-h-[160px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', height: '100%' }}
        >
        {/* Background gradient */}
        <div className={`absolute inset-0 ${gradient}`} />
        
        {/* Simple overlay */}
        <div className="absolute inset-0 bg-black/25" />
        
        {/* Epic shine effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none overflow-hidden"
        >
          <div
            className={`w-full h-full ${isHovered ? 'animate-shine' : ''}`}
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
              transform: 'translateX(-100%)'
            }}
          />
        </div>
        
        {/* Content centrado para formato cuadrado */}
        <div className="relative h-full p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 flex flex-col items-center justify-center text-white z-10 text-center">
          {/* Ícono centrado arriba */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-2">
            <div className="w-full h-full drop-shadow-lg">
              {icon}
            </div>
          </div>
          
          {/* Título centrado */}
          <h3 className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-semibold text-white drop-shadow-lg mb-0.5 sm:mb-1 lg:mb-1.5 leading-none">{title}</h3>
          
          {/* Descripción más compacta */}
          <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm text-white/80 drop-shadow-md leading-none px-0.5 sm:px-1">{description}</p>
        </div>
        
        {/* Static decorative elements */}
        <div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-white/10 z-0" />
        <div className="absolute bottom-8 left-6 w-4 h-4 rounded-full bg-white/8 z-0" />
        <div className="absolute top-1/3 left-4 w-2 h-2 rounded-full bg-purple-300/20 z-0" />
        
        </motion.div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const t = useTranslations('dashboard');

  // Variantes de animación para la página
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    }
  };


  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  const features = [
    {
      title: 'Automatizaciones',
      description: 'Respuestas automáticas inteligentes para Instagram',
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
      title: 'Captions',
      description: 'Genera las descripciones de tus videos con IA',
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
      title: 'URLs Cortas',
      description: 'Acorta enlaces y analiza clics en tiempo real',
      icon: <LinkIcon className="w-full h-full text-white" style={{ color: '#d08216' }} />,
      href: "/short-urls",
      gradient: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"
    },
    {
      title: 'Mi Landing',
      description: 'Crea tu página personal con diseño único',
      icon: <Settings className="w-full h-full text-white" style={{ color: '#d08216' }} />,
      href: "/landing",
      gradient: "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-start justify-center pt-2 sm:pt-3 md:pt-4 lg:pt-6">
        <motion.div 
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
        <div className="relative mx-2 sm:mx-4 md:mx-6 flex flex-col items-center overflow-visible mt-1 sm:mt-2 md:mt-3">
        <motion.div 
          variants={containerVariants}
        >
          <div className="relative w-[88vw] md:w-[80vw] lg:w-[72vw] xl:w-[68vw] max-w-[1000px] rounded-lg border border-white/20 bg-black/40 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-1.5 sm:p-2 md:p-2.5 lg:p-4 xl:p-5">
          <motion.div 
            variants={containerVariants}
          >
            {/* Layout de 2 columnas */}
            <div className="grid lg:grid-cols-1 xl:grid-cols-[1fr,auto] gap-3 sm:gap-4 lg:gap-6 xl:gap-8 items-center justify-items-center xl:justify-items-stretch">
              
              {/* Columna izquierda: Título y explicación con glow-up */}
              <div className="text-center xl:text-left flex flex-col justify-center items-center xl:items-start relative xl:pl-4 max-w-md">
              <motion.div 
                variants={textVariants}
              >
                {/* Elementos decorativos de fondo */}
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-full"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full"></div>
                

                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-1.5 sm:mb-2 lg:mb-3 leading-none">
                <motion.h2 
                  variants={textVariants}
                  style={{ display: 'inline' }}
                >
                  Todas tus herramientas{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    en un único lugar
                  </span>
                </motion.h2>
                </h2>
                
                <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-300 leading-snug mb-2 sm:mb-3 lg:mb-4 max-w-xs md:max-w-sm relative z-10">
                <motion.p 
                  variants={textVariants}
                  style={{ display: 'inline' }}
                >
                  Potencia tu presencia digital con nuestra suite completa de herramientas diseñadas para{' '}
                  <span className="text-purple-300 font-medium">creadores ambiciosos</span>.
                </motion.p>
                </p>

                {/* Stats decorativos */}
                <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4 justify-center xl:justify-start">
                <motion.div 
                  variants={textVariants}
                >
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">4+</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Herramientas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">∞</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Posibilidades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">24/7</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Disponible</div>
                  </div>
                </motion.div>
                </div>

                <div className="h-1 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 rounded-full mx-auto xl:mx-0 relative overflow-hidden w-32 xl:w-auto">
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 120, opacity: 1 }}
                  transition={{
                    duration: 1.5,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.7
                  }}
                  style={{ willChange: 'width', height: '100%' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </motion.div>
                </div>
              </motion.div>
              </div>

              {/* Columna derecha: Grid de funciones */}
              <div className="flex justify-center">
              <motion.div 
                variants={gridVariants}
              >
                <div className="grid grid-cols-2 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2.5 w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[400px] xl:max-w-[480px]">
                  {features.map((feature, index) => (
                    <FeatureCard
                      key={feature.title}
                      {...feature}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
              </div>

            </div>

          </motion.div>
          </div>

          {/* Removido: sombras radiales moradas */}
        </motion.div>
        </div>
      </motion.div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
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

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.2); }
        }

        @keyframes pulse-fast {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1.3); }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        /* Media query específica para MacBook 13" (1440x900) */
        @media (max-width: 1440px) and (max-height: 900px) {
          .text-lg { font-size: 1rem !important; }
          .text-xl { font-size: 1.125rem !important; }
          .text-2xl { font-size: 1.25rem !important; }
          .text-3xl { font-size: 1.5rem !important; }
          .text-4xl { font-size: 1.875rem !important; }
          .text-5xl { font-size: 2.25rem !important; }
          
          /* Reducir aún más los elementos decorativos */
          .w-32 { width: 5rem !important; }
          .h-32 { height: 5rem !important; }
          .w-24 { width: 4rem !important; }
          .h-24 { height: 4rem !important; }
        }

        /* Ajustes adicionales para pantallas pequeñas */
        @media (max-width: 1280px) {
          .min-h-screen {
            padding-top: 2rem;
            padding-bottom: 1rem;
          }
        }
        
        /* Ajuste de posición vertical para MacBook 13" */
        @media (max-width: 1440px) and (max-height: 900px) {
          .pt-2 { padding-top: 0.25rem !important; }
          .pt-3 { padding-top: 0.5rem !important; }
          .pt-4 { padding-top: 0.75rem !important; }
          .pt-6 { padding-top: 1rem !important; }
          .mt-1 { margin-top: 0.125rem !important; }
          .mt-2 { margin-top: 0.25rem !important; }
          .mt-3 { margin-top: 0.5rem !important; }
        }

      `}</style>
    </ProtectedRoute>
  );
}