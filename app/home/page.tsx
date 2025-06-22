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
        className={`relative aspect-square rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${
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
          className={`absolute inset-0 bg-black/30 transition-all duration-400 ease-out ${
            isHovered ? 'bg-black/15' : 'bg-black/30'
          }`} 
        />
        
        {/* Enhanced glow effect on hover */}
        <div 
          className={`absolute inset-0 transition-opacity duration-400 ease-out ${
            isHovered ? 'bg-gradient-to-br from-white/12 via-white/4 to-transparent opacity-100' : 'opacity-0'
          }`} 
        />
        
        {/* Optimized shimmer sweep effect */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            isHovered ? 'translate-x-full opacity-100' : '-translate-x-full opacity-0'
          }`}
          style={{
            background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
            willChange: 'transform, opacity'
          }}
        />
        
        {/* Content centrado para formato cuadrado */}
        <div className="relative h-full p-4 flex flex-col items-center justify-center text-white z-10 text-center">
          {/* Ícono centrado arriba */}
          <motion.div 
            className="w-12 h-12 mb-2"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            <div className="w-full h-full drop-shadow-lg">
              {icon}
            </div>
          </motion.div>
          
          {/* Título centrado */}
          <h3 className="text-base md:text-lg font-bold text-white drop-shadow-lg mb-2 leading-tight">{title}</h3>
          
          {/* Descripción más compacta */}
          <p className="text-xs text-white/80 drop-shadow-md leading-snug">{description}</p>
        </div>
        
        {/* Optimized floating particles - no blur filters */}
        <motion.div 
          className="absolute top-6 right-20 w-16 h-16 rounded-full bg-white/20 animate-move-circular z-0"
          animate={{
            scale: isHovered ? 1.8 : 1,
            opacity: isHovered ? 0.4 : 0.25,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div 
          className="absolute bottom-8 left-6 w-12 h-12 rounded-full bg-white/18 animate-move-vertical z-0"
          animate={{
            scale: isHovered ? 1.6 : 1,
            opacity: isHovered ? 0.35 : 0.22,
          }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div 
          className="absolute top-1/3 left-8 w-10 h-10 rounded-full bg-white/15 animate-move-horizontal z-0"
          animate={{
            scale: isHovered ? 1.5 : 1,
            opacity: isHovered ? 0.3 : 0.18,
          }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-8 w-8 h-8 rounded-full bg-white/12 animate-move-diagonal z-0"
          animate={{
            scale: isHovered ? 1.4 : 1,
            opacity: isHovered ? 0.25 : 0.15,
          }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          style={{ willChange: 'transform, opacity' }}
        />
        
        {/* Optimized magic particles - no blur filters */}
        <motion.div 
          className="absolute top-4 left-4 w-4 h-4 rounded-full bg-yellow-300/50 z-0"
          animate={{
            scale: isHovered ? 2.5 : 0,
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div 
          className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-pink-300/50 z-0"
          animate={{
            scale: isHovered ? 3 : 0,
            opacity: isHovered ? 0.5 : 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div 
          className="absolute top-2/3 left-12 w-5 h-5 rounded-full bg-blue-300/40 z-0"
          animate={{
            scale: isHovered ? 2.2 : 0,
            opacity: isHovered ? 0.4 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          style={{ willChange: 'transform, opacity' }}
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
            className="relative w-full max-w-5xl rounded-2xl border border-white/20 bg-black/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(139,92,246,0.25)] p-6 sm:p-8 lg:p-10 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-purple-500/5 before:via-pink-500/5 before:to-blue-500/5"
            variants={containerVariants}
          >
            {/* Layout de 2 columnas */}
            <div className="grid lg:grid-cols-[1fr,auto] gap-8 lg:gap-12 items-center">
              
              {/* Columna izquierda: Título y explicación */}
              <motion.div 
                className="text-center lg:text-left flex flex-col justify-center"
                variants={textVariants}
              >
                <motion.h2 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4"
                  variants={textVariants}
                >
                  Tu centro de control
                </motion.h2>
                
                <motion.p 
                  className="text-base md:text-lg text-gray-400 leading-relaxed mb-6 max-w-md"
                  variants={textVariants}
                >
                  Todas las herramientas que necesitas para hacer crecer tu presencia digital en un solo lugar.
                </motion.p>

                <motion.div 
                  className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full lg:mx-0 mx-auto"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 96, opacity: 1 }}
                  transition={{
                    duration: 1.5,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.5
                  }}
                  style={{ willChange: 'width' }}
                />
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