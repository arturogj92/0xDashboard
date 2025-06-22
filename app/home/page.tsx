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
        className={`relative h-48 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
          isHovered 
            ? 'shadow-[0_25px_50px_rgba(0,0,0,0.6),_0_0_30px_rgba(139,92,246,0.4)]' 
            : 'shadow-[0_10px_25px_rgba(0,0,0,0.3)]'
        }`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 ${gradient}`} />
        
        {/* Animated overlay with shimmer effect */}
        <div 
          className={`absolute inset-0 bg-black/30 transition-all duration-700 ease-out ${
            isHovered ? 'bg-black/15 backdrop-blur-sm' : 'bg-black/30'
          }`} 
        />
        
        {/* Enhanced glow effect on hover */}
        <div 
          className={`absolute inset-0 transition-all duration-700 ease-out ${
            isHovered ? 'bg-gradient-to-br from-white/15 via-white/5 to-transparent opacity-100' : 'opacity-0'
          }`} 
        />
        
        {/* Shimmer sweep effect */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-out ${
            isHovered ? 'translate-x-full' : '-translate-x-full'
          }`}
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          }}
        />
        
        {/* Content */}
        <div className="relative h-full p-6 flex flex-col text-white z-10">
          {/* Header: título izquierda, ícono derecha */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg flex-1">{title}</h3>
            <motion.div 
              className="w-10 h-10 ml-4 flex-shrink-0"
              animate={{
                scale: isHovered ? 1.5 : 1,
                rotate: isHovered ? 12 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.6
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-full h-full drop-shadow-lg"
              >
                {icon}
              </motion.div>
            </motion.div>
          </div>
          
          {/* Description - más espacio disponible */}
          <div className="flex-1 flex items-center">
            <p className="text-sm text-white/95 drop-shadow-md leading-relaxed">{description}</p>
          </div>
        </div>
        
        {/* Enhanced floating particles con mejor hover */}
        <motion.div 
          className="absolute top-6 right-20 w-16 h-16 rounded-full bg-white/20 animate-move-circular z-0"
          animate={{
            scale: isHovered ? 2.2 : 1,
            opacity: isHovered ? 0.45 : 0.25,
            filter: isHovered ? "blur(4px)" : "blur(0px)"
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-8 left-6 w-12 h-12 rounded-full bg-white/18 animate-move-vertical z-0"
          animate={{
            scale: isHovered ? 1.9 : 1,
            opacity: isHovered ? 0.4 : 0.22,
            filter: isHovered ? "blur(3px)" : "blur(0px)"
          }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        />
        <motion.div 
          className="absolute top-1/3 left-8 w-10 h-10 rounded-full bg-white/15 animate-move-horizontal z-0"
          animate={{
            scale: isHovered ? 1.7 : 1,
            opacity: isHovered ? 0.35 : 0.18,
            filter: isHovered ? "blur(2px)" : "blur(0px)"
          }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-8 w-8 h-8 rounded-full bg-white/12 animate-move-diagonal z-0"
          animate={{
            scale: isHovered ? 1.6 : 1,
            opacity: isHovered ? 0.3 : 0.15,
            filter: isHovered ? "blur(2px)" : "blur(0px)"
          }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        />
        
        {/* Additional magic particles con mejor animación */}
        <motion.div 
          className="absolute top-4 left-4 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-300/70 to-orange-300/70 z-0"
          animate={{
            scale: isHovered ? 3.5 : 0,
            opacity: isHovered ? 0.7 : 0,
            filter: isHovered ? "blur(2px)" : "blur(0px)"
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r from-pink-300/80 to-purple-300/80 z-0"
          animate={{
            scale: isHovered ? 4 : 0,
            opacity: isHovered ? 0.6 : 0,
            filter: isHovered ? "blur(2px)" : "blur(0px)"
          }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        />
        <motion.div 
          className="absolute top-2/3 left-12 w-5 h-5 rounded-full bg-gradient-to-r from-blue-300/60 to-cyan-300/60 z-0"
          animate={{
            scale: isHovered ? 2.8 : 0,
            opacity: isHovered ? 0.5 : 0,
            rotate: isHovered ? 360 : 0,
            filter: isHovered ? "blur(2px)" : "blur(0px)"
          }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
        
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
            className="relative w-full max-w-6xl rounded-2xl border border-white/20 bg-black/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(139,92,246,0.25)] p-6 sm:p-8 lg:p-10 flex flex-col items-center before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-purple-500/5 before:via-pink-500/5 before:to-blue-500/5"
            variants={containerVariants}
          >
            {/* Header */}
            <motion.div 
              className="text-center mb-16 w-full mt-8"
              variants={textVariants}
            >
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                variants={textVariants}
              >
                {/* @ts-expect-error permitir interpolación de variables en traducción */}
                {t('welcomeTitle', { name: user?.name || user?.username || 'Usuario' }) || `¡Hola, ${user?.name || user?.username || 'Usuario'}!`}
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-300 max-w-2xl mx-auto mb-8"
                variants={textVariants}
              >
                {t('welcomeDescription') || 'Bienvenido a tu centro de control. Desde aquí puedes acceder a todas las herramientas que necesitas para hacer crecer tu presencia digital.'}
              </motion.p>

              <motion.div 
                className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 96, opacity: 1 }}
                transition={{
                  duration: 1.5,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.7
                }}
                style={{ willChange: 'width' }}
              />
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 w-full"
              variants={gridVariants}
            >
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                  index={index}
                />
              ))}
            </motion.div>

          </motion.div>

          {/* Sombra radial principal más grande (oculta en móvil) */}
          <div className="hidden sm:block absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>

          {/* Radiales hacia afuera (bordes, ocultos en móvil) */}
          <div className="hidden sm:block absolute -inset-32 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
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