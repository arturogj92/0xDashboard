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
      <motion.div 
        className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer border border-white/10 bg-black/20 shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-200 ease-out"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
        <div className="relative h-full p-4 flex flex-col items-center justify-center text-white z-10 text-center">
          {/* Ícono centrado arriba */}
          <div className="w-12 h-12 mb-2">
            <div className="w-full h-full drop-shadow-lg">
              {icon}
            </div>
          </div>
          
          {/* Título centrado */}
          <h3 className="text-base md:text-lg font-bold text-white drop-shadow-lg mb-2 leading-tight">{title}</h3>
          
          {/* Descripción más compacta */}
          <p className="text-xs text-white/80 drop-shadow-md leading-snug">{description}</p>
        </div>
        
        {/* Static decorative elements */}
        <div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-white/10 z-0" />
        <div className="absolute bottom-8 left-6 w-4 h-4 rounded-full bg-white/8 z-0" />
        <div className="absolute top-1/3 left-4 w-2 h-2 rounded-full bg-purple-300/20 z-0" />
        
      </motion.div>
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
      <motion.div 
        className="min-h-screen py-8 bg-gradient-to-br from-slate-950/50 via-slate-900/30 to-slate-950/50"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mb-16 relative mx-2 sm:mx-4 md:mx-6 flex flex-col items-center overflow-visible"
          variants={containerVariants}
        >
          <motion.div 
            className="relative w-full max-w-5xl rounded-2xl border border-white/20 bg-black/40 shadow-[0_0_40px_rgba(139,92,246,0.25)] p-6 sm:p-8 lg:p-10 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-purple-500/5 before:via-pink-500/5 before:to-blue-500/5"
            variants={containerVariants}
          >
            {/* Layout de 2 columnas */}
            <div className="grid lg:grid-cols-[1fr,auto] gap-8 lg:gap-12 items-center">
              
              {/* Columna izquierda: Título y explicación con glow-up */}
              <motion.div 
                className="text-center lg:text-left flex flex-col justify-center relative lg:pl-10"
                variants={textVariants}
              >
                {/* Elementos decorativos de fondo */}
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full"></div>
                

                <motion.h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 leading-tight"
                  variants={textVariants}
                >
                  Todas tus herramientas{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    en un único lugar
                  </span>
                </motion.h2>
                
                <motion.p 
                  className="text-base md:text-lg text-gray-300 leading-relaxed mb-8 max-w-md relative z-10"
                  variants={textVariants}
                >
                  Potencia tu presencia digital con nuestra suite completa de herramientas diseñadas para{' '}
                  <span className="text-purple-300 font-medium">creadores ambiciosos</span>.
                </motion.p>

                {/* Stats decorativos */}
                <motion.div 
                  className="flex gap-6 mb-6 lg:justify-start justify-center"
                  variants={textVariants}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">4+</div>
                    <div className="text-xs text-gray-400">Herramientas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">∞</div>
                    <div className="text-xs text-gray-400">Posibilidades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">24/7</div>
                    <div className="text-xs text-gray-400">Disponible</div>
                  </div>
                </motion.div>

                <motion.div 
                  className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full lg:mx-0 mx-auto relative overflow-hidden"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 120, opacity: 1 }}
                  transition={{
                    duration: 1.5,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.7
                  }}
                  style={{ willChange: 'width' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </motion.div>
              </motion.div>

              {/* Columna derecha: Grid de funciones */}
              <motion.div 
                className="flex justify-center lg:justify-end"
                variants={gridVariants}
              >
                <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-sm lg:max-w-md">
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

          </motion.div>

          {/* Sombra radial principal más grande (oculta en móvil) */}
          <div className="hidden sm:block absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.3)_0%,_rgba(17,24,39,0)_80%)] pointer-events-none"></div>

          {/* Radiales hacia afuera (bordes, ocultos en móvil) */}
          <div className="hidden sm:block absolute -inset-32 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.25)_100%)] opacity-50 pointer-events-none"></div>
        </motion.div>
      </motion.div>

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

      `}</style>
    </ProtectedRoute>
  );
}