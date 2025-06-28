'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRightIcon, 
  ChatBubbleLeftRightIcon, 
  LinkIcon,
  SparklesIcon,
  BoltIcon,
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  ChevronDownIcon,
  StarIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

// Custom hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(mobile);
    };
    
    checkMobile();
    
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
}

// Activity Ticker Component with multiple notifications
function ActivityTicker() {
  const isMobile = useIsMobile();
  const activities = [
    { id: 1, user: '@art0xdev', action: 'creó una automatización para historias', time: 12 },
    { id: 2, user: '@nutrifit.coach', action: 'activó auto-DM para comentarios', time: 89 },
    { id: 3, user: '@thefoodlab.es', action: 'personalizó su landing page', time: 156 },
    { id: 4, user: '@mindful.maria', action: 'activó respuestas automáticas', time: 234 },
    { id: 5, user: '@studio.creative', action: 'añadió 5 shortlinks nuevos', time: 342 },
    { id: 6, user: '@wellness.journey', action: 'generó su primer caption con IA', time: 478 },
    { id: 7, user: '@digital.nomad.bcn', action: 'creó 3 automatizaciones nuevas', time: 623 },
    { id: 8, user: '@eco.lifestyle', action: 'creó su link-in-bio personalizado', time: 812 },
    { id: 9, user: '@photo.stories', action: 'configuró DMs para nuevos seguidores', time: 1045 },
    { id: 10, user: '@coach.emprendedor', action: 'creó flujo de bienvenida', time: 1234 }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleActivities, setVisibleActivities] = useState<typeof activities>([]);
  
  // Inicializar con la primera actividad después de un pequeño delay
  useEffect(() => {
    const initTimeout = setTimeout(() => {
      setVisibleActivities([activities[0]]);
    }, 500);
    
    return () => clearTimeout(initTimeout);
  }, []);
  
  useEffect(() => {
    // Solo empezar a rotar después de que haya al menos una actividad visible
    if (visibleActivities.length === 0) return;
    
    // Rotar entre actividades cada 5 segundos
    const rotateInterval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % activities.length;
      setCurrentIndex(nextIndex);
      
      // Añadir nueva actividad y mantener máximo 2 visibles
      setVisibleActivities(prev => {
        const newActivities = [...prev, activities[nextIndex]];
        return newActivities.slice(-2); // Mantener solo las últimas 2
      });
    }, isMobile ? 8000 : 5000); // Slower updates on mobile
    
    return () => clearInterval(rotateInterval);
  }, [currentIndex, visibleActivities.length]);
  
  // Incrementar tiempo de todas las actividades
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setVisibleActivities(prev => 
        prev.map(activity => ({
          ...activity,
          time: activity.time + 1
        }))
      );
    }, isMobile ? 2000 : 1000); // Update every 2s on mobile
    
    return () => clearInterval(timeInterval);
  }, []);
  
  const formatTime = (secs: number) => {
    if (secs < 60) return `hace ${secs} segundos`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `hace ${mins} minuto${mins > 1 ? 's' : ''}`;
    const hours = Math.floor(mins / 60);
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  };
  
  return (
    <div className="relative h-[100px] max-w-3xl mx-auto overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        {visibleActivities.map((activity, i) => {
          const index = i;
          const isNewest = i === visibleActivities.length - 1;
          
          return (
            <motion.div
              key={activity.id}
              style={{
                position: 'absolute',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '9999px',
                padding: '10px 24px'
              } as React.CSSProperties}
              initial={isNewest ? { 
                opacity: 0, 
                y: 100,
                scale: 0.95
              } : false}
              animate={{ 
                opacity: index === visibleActivities.length - 1 ? 1 : 0.7,
                y: index * 45,
                scale: 1
              }}
              exit={{ 
                opacity: 0,
                y: -44,
                scale: 0.95
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut"
              }}
            >
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <motion.div 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === visibleActivities.length - 1 
                        ? '#4ade80' 
                        : '#6b7280'
                    }}
                    animate={index === visibleActivities.length - 1 ? {
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.6, 1]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-gray-300">
                    <span className="font-semibold text-white">{activity.user}</span> {activity.action}
                  </span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-400">{formatTime(activity.time)}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// 3D iPhone Carousel Component
function AppCarousel3D() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const images = [
    {
      src: '/images/landing/automations.png',
      title: 'Automatizaciones',
      description: 'Auto-DM instantáneo'
    },
    {
      src: '/images/landing/landing-configurator.png',
      title: 'Landing Builder',
      description: 'Páginas personalizadas'
    },
    {
      src: '/images/landing/url-shortener.png',
      title: 'URL Shortener',
      description: 'Enlaces inteligentes'
    },
    {
      src: '/images/landing/caption-generator (2).png',
      title: 'IA Captions',
      description: 'Contenido viral'
    }
  ];

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images.length]);

  // Handle hover - disabled on mobile devices
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.matchMedia('(max-width: 768px)').matches;

    // Only add hover effects on non-mobile devices
    if (!isMobile) {
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);

      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* iPhone Frame - Simplified 3D */}
      <motion.div
        {...{ className: "relative" } as any}
        style={{ 
          width: '300px', 
          height: '600px',
        }}
        animate={{
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
      >
        {/* iPhone shadow - Static and simple */}
        <div
          className="absolute inset-0 bg-black/30 rounded-[3rem] blur-2xl"
          style={{ 
            transform: 'translateY(20px)',
          }}
        />
        
        {/* iPhone body */}
        <div className="relative w-full h-full bg-black rounded-[3rem] shadow-2xl border-8 border-gray-800">
          {/* Screen container with overflow hidden */}
          <div className="absolute inset-4 rounded-[2rem] overflow-hidden bg-black">
            {/* All images preloaded and positioned */}
            <motion.div
              {...{ className: "relative w-full h-full" } as any}
              animate={{ x: -currentIndex * 100 + '%' }}
              transition={{ 
                type: "tween",
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
              <div className="absolute inset-0 flex">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-full h-full flex-shrink-0"
                  >
                    <Image
                      src={image.src}
                      alt={image.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* iPhone notch */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black rounded-full"></div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
        
        {/* App info floating card - Siempre visible */}
        <motion.div
          {...{ className: "absolute -right-16 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl p-4 min-w-48" } as any}
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: 1,
            x: 0,
            scale: 1
          }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h4 className="text-white font-semibold text-lg mb-1">
            {images[currentIndex].title}
          </h4>
          <p className="text-gray-400 text-sm">
            {images[currentIndex].description}
          </p>
          
          {/* Progress indicators */}
          <div className="flex gap-1 mt-3">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full ${
                  index === currentIndex 
                    ? 'bg-orange-400 w-6' 
                    : 'bg-white/20 w-2'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Floating elements around the phone - GLOWUP VERSION */}
      
      {/* Rocket Badge - Más moderno */}
      <motion.div
        {...{ className: "absolute -top-8 -left-8 group cursor-pointer" } as any}
        animate={{
          y: isHovered ? -15 : 0,
          x: isHovered ? -10 : 0,
          rotate: isHovered ? 12 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
          {/* Main badge - Redondito como el sparkle */}
          <div className="relative w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-0.5">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-white/10">
              <div className="text-white text-lg">🚀</div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Sparkle Orb - Más sofisticado */}
      <motion.div
        {...{ className: "absolute -bottom-8 -right-8 group cursor-pointer" } as any}
        animate={{
          y: isHovered ? 20 : 0,
          x: isHovered ? 15 : 0,
          rotate: isHovered ? -12 : 0,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <div className="relative">
          {/* Animated glow rings */}
          <motion.div 
            {...{ className: "absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-40" } as any}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Inner sparkle container */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full p-0.5">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-white/10">
              <div className="text-2xl">
                ✨
              </div>
            </div>
          </div>
          
          {/* Mini floating sparks */}
          <motion.div 
            {...{ className: "absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" } as any}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            {...{ className: "absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full" } as any}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.7 }}
          />
        </div>
      </motion.div>
      
    </div>
  );
}

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Componente de orbes parallax
function ParallaxOrbs() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcular opacidad basada en el scroll - desaparecen cuando se pasa el hero
  const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
  const opacity = Math.max(0, 1 - (scrollY / heroHeight));

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ opacity }}
    >
      {/* Orbe 1 - Naranja-Púrpura - Velocidad lenta */}
      <motion.div
        {...{ className: "absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-purple-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        style={{
          y: scrollY * 0.3,
        }}
      />
      
      {/* Orbe 2 - Verde-Azul - Velocidad media */}
      <motion.div
        {...{ className: "absolute top-3/4 right-1/3 w-24 h-24 bg-gradient-to-r from-green-400/15 to-blue-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        style={{
          y: scrollY * 0.5,
        }}
      />
      
      {/* Orbe 3 - Púrpura-Rosa - Velocidad rápida */}
      <motion.div
        {...{ className: "absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-purple-400/25 to-pink-500/25 rounded-full blur-lg" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        style={{
          y: scrollY * 0.7,
        }}
      />
      
      {/* Orbe 4 - Azul-Cyan - Velocidad muy lenta */}
      <motion.div
        {...{ className: "absolute top-1/3 left-1/6 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
        style={{
          y: scrollY * 0.2,
        }}
      />
      
      {/* Orbe 5 - Amarillo-Naranja - Velocidad media-rápida */}
      <motion.div
        {...{ className: "absolute bottom-1/4 left-1/3 w-28 h-28 bg-gradient-to-r from-yellow-400/15 to-orange-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, delay: 0.4, ease: "easeOut" }}
        style={{
          y: scrollY * 0.6,
        }}
      />
      
      {/* Orbe 6 - Rosa-Rojo - Velocidad máxima */}
      <motion.div
        {...{ className: "absolute top-1/3 right-1/6 w-12 h-12 bg-gradient-to-r from-pink-400/30 to-red-500/30 rounded-full blur-lg" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
        style={{
          y: scrollY * 0.8,
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // GSAP animations on scroll
    const ctx = gsap.context(() => {
      // Hero parallax - REMOVED for smooth background

      // Fade in animations
      gsap.utils.toArray('.fade-in-section').forEach((element: any) => {
        gsap.fromTo(element, 
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
              end: 'top 50%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Feature cards stagger animation
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 70%'
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);


  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Creator0x – Automatiza Instagram y gestiona tu contenido por €10/mes</title>
        <meta name="description" content="Auto-DM, link-in-bio, shortlinks y captions IA unidos en una sola plataforma. Empieza gratis con Creator0x." />
        <meta name="keywords" content="automatizar DMs Instagram, alternativa ManyChat barata, link in bio gratis, acortador URL propio, generador captions IA" />
      </head>

      <div className="min-h-screen bg-grid-background text-white overflow-x-hidden"
           style={{ backgroundColor: 'var(--background)' }}>
        
        {/* Global smooth gradient overlay - ultra diffused */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Ultra smooth fade from all edges */}
          <div className="absolute -top-32 -left-32 -right-32 -bottom-32">
            {/* Top fade - very extended */}
            <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-black/25 via-black/15 via-black/8 via-black/4 via-black/2 to-transparent" />
            
            {/* Side fades */}
            <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-black/20 via-black/10 to-transparent" />
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-black/20 via-black/10 to-transparent" />
            
            {/* Corner fades for smooth blending */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-black/15 via-black/5 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-black/15 via-black/5 to-transparent" />
          </div>
        </div>


        {/* Global color gradients - extends across entire page */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 -right-32 -bottom-32" 
               style={{ 
                 background: `linear-gradient(135deg, 
                   rgba(255, 137, 6, 0.08) 0%, 
                   rgba(255, 137, 6, 0.03) 25%,
                   transparent 45%, 
                   transparent 55%,
                   rgba(127, 90, 240, 0.03) 75%,
                   rgba(127, 90, 240, 0.08) 100%)`
               }} />
        </div>
        
        {/* Custom CSS for gradient animation and effects */}
        <style jsx global>{`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
          }
          .shadow-glow-green {
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.8);
          }
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-shift 3s ease infinite;
          }
          .perspective-1000 {
            perspective: 1000px;
          }
          
          /* Mobile Performance Optimizations */
          @media (max-width: 768px) {
            .drop-shadow-glow {
              filter: none;
            }
            .shadow-glow-green {
              box-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
            }
            .animate-gradient {
              animation: none;
              background-size: 100% 100%;
            }
            .animate-pulse {
              animation: none !important;
            }
            .backdrop-blur-2xl,
            .backdrop-blur-xl,
            .backdrop-blur-lg {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
            .mix-blend-screen,
            .mix-blend-multiply {
              mix-blend-mode: normal !important;
            }
          }
        `}</style>

        {/* Orbes parallax de fondo - Pantalla completa */}
        <ParallaxOrbs />
        
        {/* Hero Section */}
        <section className="hero-section relative min-h-screen flex items-center justify-center py-20">
          <div className="hero-bg absolute inset-0 z-0">
          </div>

          <div className="container mx-auto px-4 z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
              
              {/* Text Content - Izquierda */}
              <div className="text-center lg:text-left">
                <motion.h1
                  {...{ className: "text-3xl md:text-4xl lg:text-5xl font-bold font-manrope mb-6 leading-tight" } as any}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Automatiza tu Instagram y otras RR.SS y 
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">convierte seguidores en clientes</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  {...{ className: "inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8" } as any}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" 
                       style={{ backgroundColor: 'var(--secondary)' }} />
                  <span className="text-sm">🔥 +1,200 creadores ya automatizando</span>
                </motion.div>

                <motion.p
                  {...{ className: "text-lg md:text-xl text-gray-300 mb-10 max-w-2xl lg:max-w-none" } as any}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  La única plataforma que automatiza DMs de Instagram, crea tu landing y link-in-bio totalmente personalizada, 
                  acorta URLs con analytics y genera captions perfectos con IA.
                </motion.p>

                <motion.div
                  {...{ className: "flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" } as any}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      {...{ className: "inline-block relative group" } as any}
                    >
                      {/* Glow effect máximo */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                      
                      <Button size="lg" className="relative h-16 px-12 text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 transition-all duration-300 shadow-2xl">
                        Empieza GRATIS
                        <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-black border-2 hover:border-white/50 transition-all duration-300">
                      Ver precios
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* 3D iPhone Carousel - Derecha */}
              <div className="flex justify-center lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  {...{ className: "relative" } as any}
                  style={{ perspective: '1000px' }}
                >
                  <AppCarousel3D />
                </motion.div>
              </div>

            </div>
          </div>

        </section>

        {/* Social Proof Bar - Section 2 - GLOW UP VERSION */}
        <section className="relative py-20">
          {/* Epic background effects - Optimized for mobile */}
          {!isMobile ? (
            <div className="absolute -top-64 -bottom-96 left-0 right-0 pointer-events-none">
              {/* Animated gradient orbs - Even larger and more diffused */}
              <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-[150px] animate-pulse" />
              <div className="absolute top-1/2 right-1/4 w-[800px] h-[800px] bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Multiple gradient layers for ultra smooth fade */}
              <div className="absolute -bottom-32 left-0 right-0 h-96 bg-gradient-to-t from-transparent via-transparent to-orange-500/5 blur-[100px]" />
              <div className="absolute -bottom-48 left-0 right-0 h-[500px] bg-gradient-to-t from-transparent to-purple-500/5 blur-[120px]" />
            </div>
          ) : (
            /* Simple mobile background */
            <div className="absolute -top-32 -bottom-48 left-0 right-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-[50px]" />
            </div>
          )}
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              {...{ className: "max-w-7xl mx-auto" } as any}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Epic title with glow */}
              <div className="text-center mb-16">
                <motion.div
                  {...{ className: "inline-block relative" } as any}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Glow effect behind title */}
                  <div className="absolute inset-0 blur-2xl md:blur-3xl bg-gradient-to-r from-orange-400/20 to-purple-400/20 md:from-orange-400/40 md:to-purple-400/40 -z-10" />
                  
                  <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                    Mientras tú duermes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">ellos venden</span>
                  </h3>
                </motion.div>
                
                <motion.p 
                  {...{ className: "text-gray-200 text-xl max-w-3xl mx-auto" } as any}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Números reales de creadores que tomaron acción (y ahora viven de Instagram)
                </motion.p>
              </div>
              
              {/* Metrics Cards - ULTRA GLOW UP VERSION */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 stats-grid">
                {/* DMs Automatizados - ULTRA */}
                <motion.div
                  {...{ className: "relative group" } as any}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={isMobile ? { transform: 'translateZ(0)', willChange: 'transform, opacity' } : {}}
                >
                  {/* Reduced glow - simpler on mobile */}
                  <div className={`absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-pink-600/20 rounded-3xl ${isMobile ? 'blur-md' : 'blur-xl'}`} />
                  
                  <div className="relative h-full rounded-3xl border border-white/10 overflow-hidden">
                    {/* Background layer */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 ${isMobile ? '' : 'backdrop-blur-xl'} rounded-3xl`}></div>
                    
                    {/* Blobs layer - reduced on mobile */}
                    {!isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-red-400 to-orange-500 rounded-full blur-2xl opacity-25"></div>
                      </div>
                    )}
                    
                    {/* Single blob for mobile */}
                    {isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-2xl opacity-20"></div>
                      </div>
                    )}
                    
                    {/* Content layer - on top of everything */}
                    <div className="relative z-20 p-8 stats-card-content">
                      {/* Content blobs - removed on mobile */}
                      {!isMobile && (
                        <>
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-400/20 rounded-full blur-2xl"></div>
                          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-pink-400/20 rounded-full blur-xl"></div>
                        </>
                      )}
                      
                      <motion.div 
                        {...{ className: "text-5xl md:text-6xl font-black mb-3 relative z-10 flex items-baseline stats-number-wrapper" } as any}
                      >
                        <span
                          className="stats-number"
                          style={{
                            background: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: isMobile ? "drop-shadow(0 0 10px rgba(251, 146, 60, 0.3))" : "drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))"
                          }}
                        >
                          2.1M
                        </span>
                        <span className="text-orange-400 font-black ml-1 stats-number" style={{ filter: isMobile ? "drop-shadow(0 0 5px rgba(251, 146, 60, 0.5))" : "drop-shadow(0 0 10px rgba(251, 146, 60, 0.8))" }}>+</span>
                      </motion.div>
                      <div {...{ className: "text-lg font-semibold text-white mb-2 relative z-10 stats-title" } as any}>DMs enviados</div>
                      <div className="text-sm text-orange-300/80 relative z-10 stats-description">sin spam ni baneos</div>
                    </div>
                    
                    {/* Background Icon */}
                    <div className="absolute bottom-4 right-4 opacity-5">
                      <svg className="stats-icon" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>
                
                {/* Link Clicks - ULTRA */}
                <motion.div
                  {...{ className: "relative group" } as any}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  style={isMobile ? { transform: 'translateZ(0)', willChange: 'transform, opacity' } : {}}
                >
                  {/* Epic multi-layer glow effect - purple theme */}
                  <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-3xl ${isMobile ? 'blur-md' : 'blur-xl'}`} />
                  
                  <div className="relative h-full rounded-3xl border border-white/10 overflow-hidden">
                    {/* Background layer */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 ${isMobile ? '' : 'backdrop-blur-xl'} rounded-3xl`}></div>
                    {/* Blobs layer - enhanced for purple theme */}
                    {!isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-2xl opacity-25"></div>
                      </div>
                    )}
                    
                    {/* Single blob for mobile */}
                    {isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full blur-2xl opacity-20"></div>
                      </div>
                    )}
                    
                    {/* Content layer - on top of everything */}
                    <div className="relative z-20 p-8 stats-card-content">
                      {/* Content blobs - removed on mobile */}
                      {!isMobile && (
                        <>
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
                          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-violet-400/20 rounded-full blur-xl"></div>
                        </>
                      )}
                      
                      <motion.div 
                        {...{ className: "text-5xl md:text-6xl font-black mb-3 relative z-10 flex items-baseline stats-number-wrapper" } as any}
                      >
                        <span
                          className="stats-number"
                          style={{
                            background: "linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: isMobile ? "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))" : "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))"
                          }}
                        >
                          847K
                        </span>
                        <span className="text-purple-400 font-black ml-1 stats-number" style={{ filter: isMobile ? "drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))" : "drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))" }}>+</span>
                      </motion.div>
                      <div {...{ className: "text-lg font-semibold text-white mb-2 relative z-10 stats-title" } as any}>Clicks en bio</div>
                      <div className="text-sm text-purple-300/80 relative z-10 stats-description">32% conversión</div>
                    </div>
                    
                    {/* Background Icon */}
                    <div className="absolute bottom-4 right-4 opacity-5">
                      <svg className="stats-icon" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>
                
                {/* Tiempo Ahorrado - ULTRA */}
                <motion.div
                  {...{ className: "relative group" } as any}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  style={isMobile ? { transform: 'translateZ(0)', willChange: 'transform, opacity' } : {}}
                >
                  {/* Epic multi-layer glow effect - green theme */}
                  <div className={`absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl ${isMobile ? 'blur-md' : 'blur-xl'}`} />
                  
                  <div className="relative h-full rounded-3xl border border-white/10 overflow-hidden">
                    {/* Background layer */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 ${isMobile ? '' : 'backdrop-blur-xl'} rounded-3xl`}></div>
                    {/* Blobs layer - enhanced for green theme */}
                    {!isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-2xl opacity-25"></div>
                      </div>
                    )}
                    
                    {/* Single blob for mobile */}
                    {isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl opacity-20"></div>
                      </div>
                    )}
                    
                    {/* Content layer - on top of everything */}
                    <div className="relative z-20 p-8 stats-card-content">
                      {/* Content blobs - removed on mobile */}
                      {!isMobile && (
                        <>
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-400/20 rounded-full blur-2xl"></div>
                          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl"></div>
                        </>
                      )}
                      
                      <motion.div 
                        {...{ className: "text-5xl md:text-6xl font-black mb-3 relative z-10 flex items-baseline stats-number-wrapper" } as any}
                      >
                        <span
                          className="stats-number"
                          style={{
                            background: "linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: isMobile ? "drop-shadow(0 0 10px rgba(34, 197, 94, 0.3))" : "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))"
                          }}
                        >
                          18K
                        </span>
                        <span className="text-green-400 font-black ml-1 stats-number" style={{ filter: isMobile ? "drop-shadow(0 0 5px rgba(34, 197, 94, 0.5))" : "drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))" }}>+</span>
                      </motion.div>
                      <div {...{ className: "text-lg font-semibold text-white mb-2 relative z-10 stats-title" } as any}>Horas ahorradas</div>
                      <div className="text-sm text-green-300/80 relative z-10 stats-description">= 2 años de trabajo</div>
                    </div>
                    
                    {/* Background Icon */}
                    <div className="absolute bottom-4 right-4 opacity-5">
                      <svg className="stats-icon" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>
                
                {/* ROI Promedio - ULTRA */}
                <motion.div
                  {...{ className: "relative group" } as any}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  style={isMobile ? { transform: 'translateZ(0)', willChange: 'transform, opacity' } : {}}
                >
                  {/* Epic multi-layer glow effect - blue theme */}
                  <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl ${isMobile ? 'blur-md' : 'blur-xl'}`} />
                  
                  <div className="relative h-full rounded-3xl border border-white/10 overflow-hidden">
                    {/* Background layer */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 ${isMobile ? '' : 'backdrop-blur-xl'} rounded-3xl`}></div>
                    {/* Blobs layer - enhanced for blue theme */}
                    {!isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-25"></div>
                      </div>
                    )}
                    
                    {/* Single blob for mobile */}
                    {isMobile && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-2xl opacity-20"></div>
                      </div>
                    )}
                    
                    {/* Content layer - on top of everything */}
                    <div className="relative z-20 p-8 stats-card-content">
                      {/* Content blobs - removed on mobile */}
                      {!isMobile && (
                        <>
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
                          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl"></div>
                        </>
                      )}
                      
                      <motion.div 
                        {...{ className: "text-5xl md:text-6xl font-black mb-3 relative z-10 stats-number-wrapper stats-number" } as any}
                        style={{
                          background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: isMobile ? "drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))" : "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
                        }}
                      >
                        427%
                      </motion.div>
                      <div {...{ className: "text-lg font-semibold text-white mb-2 relative z-10 stats-title" } as any}>ROI promedio</div>
                      <div className="text-sm text-blue-300/80 relative z-10 stats-description">en 90 días</div>
                    </div>
                    
                    {/* Background Icon */}
                    <div className="absolute bottom-4 right-4 opacity-5">
                      <svg className="stats-icon" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3V21H21M7 14L11 10L15 14L20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Ticker de actividad en tiempo real */}
              <ActivityTicker />
              
              {/* Trust Indicators - MEGA GLOWUP EXTREMO */}
              <motion.div 
                {...{ className: "grid grid-cols-3 gap-4 md:gap-8 mt-20 max-w-5xl mx-auto" } as any}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {/* Instagram Compatible - MEGA EPIC CARD */}
                <motion.div 
                  {...{ className: "relative group" } as any}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                  style={isMobile ? { transform: 'translateZ(0)', willChange: 'transform, opacity' } : {}}
                  whileHover={isMobile ? {} : { 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.3, type: "spring" } 
                  }}
                >
                  {/* Multi-layer glow effect - reduced for mobile */}
                  {isMobile ? (
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-md opacity-20"></div>
                  ) : (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500" style={{ willChange: 'auto' }}></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-700" style={{ willChange: 'auto' }}></div>
                      <div className="absolute -inset-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-3xl opacity-5 group-hover:opacity-15 transition-opacity duration-900" style={{ willChange: 'auto' }}></div>
                    </>
                  )}
                  
                  <div className={`relative ${isMobile ? 'bg-gradient-to-br from-green-950/95 via-emerald-900/95 to-green-950/95' : 'bg-gradient-to-br from-green-950/80 via-emerald-900/80 to-green-950/80 backdrop-blur-2xl'} rounded-3xl p-4 md:p-8 border border-green-400/20 group-hover:border-green-300/40 transition-colors duration-500 overflow-hidden min-h-[280px] flex flex-col`} style={{ willChange: 'auto' }}>
                    {/* Animated background pattern - disabled on mobile */}
                    {!isMobile && (
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-green-400 rounded-full opacity-20 blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-400 rounded-full opacity-20 blur-xl"></div>
                      </div>
                    )}
                    
                    {/* Floating particles - disabled on mobile */}
                    {!isMobile && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full opacity-60 animate-ping"></div>
                        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-emerald-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-green-300 rounded-full opacity-60 animate-ping" style={{ animationDelay: '2s' }}></div>
                      </div>
                    )}
                    
                    {/* 3D Floating icon - simpler animation on mobile */}
                    <motion.div 
                      {...{ className: "relative w-20 h-20 mx-auto mb-6" } as any}
                      animate={isMobile ? {} : { 
                        rotateZ: [0, 5, -5, 0]
                      }}
                      transition={isMobile ? {} : { 
                        rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-2xl shadow-2xl shadow-green-500/50 flex items-center justify-center">
                        <CheckIcon className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-white ${isMobile ? '' : 'drop-shadow-lg'}`} />
                      </div>
                      {/* 3D shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl" style={{ transform: "translateY(4px)", opacity: 0.4 }}></div>
                    </motion.div>
                    
                    <div className="text-center flex-grow flex flex-col justify-center">
                      <h4 {...{ className: `${isMobile ? 'text-lg' : 'text-xl'} font-black text-white mb-2 tracking-tight` } as any}>100% Compatible</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-200/80 font-medium mb-4`}>Instagram API oficial</p>
                    </div>
                    
                    {/* Animated bar */}
                    <div className="mt-4 h-1 bg-green-900/50 rounded-full overflow-hidden">
                      <motion.div 
                        {...{ className: "h-full bg-gradient-to-r from-green-400 to-emerald-400" } as any}
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Reviews - MEGA EPIC CARD */}
                <motion.div 
                  {...{ className: "relative group" } as any}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                  style={isMobile ? { transform: 'translateZ(0)', willChange: 'transform, opacity' } : {}}
                  whileHover={isMobile ? {} : { 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.3, type: "spring" } 
                  }}
                >
                  {/* Multi-layer glow effect - reduced for mobile */}
                  {isMobile ? (
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur-md opacity-20"></div>
                  ) : (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500" style={{ willChange: 'auto' }}></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-700" style={{ willChange: 'auto' }}></div>
                      <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl blur-3xl opacity-5 group-hover:opacity-15 transition-opacity duration-900" style={{ willChange: 'auto' }}></div>
                    </>
                  )}
                  
                  <div className={`relative ${isMobile ? 'bg-gradient-to-br from-orange-950/95 via-yellow-900/95 to-orange-950/95' : 'bg-gradient-to-br from-orange-950/80 via-yellow-900/80 to-orange-950/80 backdrop-blur-2xl'} rounded-3xl p-4 md:p-8 border border-yellow-400/20 group-hover:border-yellow-300/40 transition-colors duration-500 overflow-hidden min-h-[280px] flex flex-col`} style={{ willChange: 'auto' }}>
                    {/* Animated background pattern - disabled on mobile */}
                    {!isMobile && (
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400 rounded-full opacity-20 blur-xl"></div>
                      </div>
                    )}
                    
                    {/* Floating particles - disabled on mobile */}
                    {!isMobile && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-60 animate-ping"></div>
                        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-yellow-300 rounded-full opacity-60 animate-ping" style={{ animationDelay: '2s' }}></div>
                      </div>
                    )}
                    
                    {/* 3D Floating icon - simpler animation on mobile */}
                    <motion.div 
                      {...{ className: "relative w-20 h-20 mx-auto mb-6" } as any}
                      animate={isMobile ? {} : { 
                        rotateZ: [0, -5, 5, 0]
                      }}
                      transition={isMobile ? {} : { 
                        rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 rounded-2xl shadow-2xl shadow-yellow-500/50 flex items-center justify-center">
                        <StarIcon className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-white ${isMobile ? '' : 'drop-shadow-lg'}`} />
                      </div>
                      {/* 3D shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-yellow-700 rounded-2xl" style={{ transform: "translateY(4px)", opacity: 0.4 }}></div>
                    </motion.div>
                    
                    <div className="text-center flex-grow flex flex-col justify-center">
                      <h4 {...{ className: `${isMobile ? 'text-lg' : 'text-xl'} font-black text-white mb-2 tracking-tight` } as any}>4.9/5 Estrellas</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-yellow-200/80 font-medium`}>+1,200 creadores felices</p>
                      
                      {/* 3D Stars animation */}
                      <div className="flex justify-center gap-1 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: 0.5 + i * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                          whileHover={isMobile ? {} : { 
                            scale: 1.3,
                            rotate: 360,
                            transition: { duration: 0.3 }
                          }}
                        >
                          <StarIcon className={`h-5 w-5 text-yellow-400 fill-yellow-400 ${isMobile ? '' : 'drop-shadow-glow'}`} />
                        </motion.div>
                      ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Uptime - MEGA EPIC CARD */}
                <motion.div 
                  {...{ className: "relative group" } as any}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                  style={isMobile ? { transform: 'translateZ(0)', willChange: 'transform, opacity' } : {}}
                  whileHover={isMobile ? {} : { 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.3, type: "spring" } 
                  }}
                >
                  {/* Multi-layer glow effect - reduced for mobile */}
                  {isMobile ? (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-md opacity-20"></div>
                  ) : (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500" style={{ willChange: 'auto' }}></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-700" style={{ willChange: 'auto' }}></div>
                      <div className="absolute -inset-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-5 group-hover:opacity-15 transition-opacity duration-900" style={{ willChange: 'auto' }}></div>
                    </>
                  )}
                  
                  <div className={`relative ${isMobile ? 'bg-gradient-to-br from-blue-950/95 via-cyan-900/95 to-blue-950/95' : 'bg-gradient-to-br from-blue-950/80 via-cyan-900/80 to-blue-950/80 backdrop-blur-2xl'} rounded-3xl p-4 md:p-8 border border-blue-400/20 group-hover:border-blue-300/40 transition-colors duration-500 overflow-hidden min-h-[280px] flex flex-col`} style={{ willChange: 'auto' }}>
                    {/* Animated background pattern - disabled on mobile */}
                    {!isMobile && (
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-400 rounded-full opacity-20 blur-xl"></div>
                      </div>
                    )}
                    
                    {/* Electric particles - disabled on mobile */}
                    {!isMobile && (
                      <div className="absolute inset-0 overflow-hidden">
                        <motion.div 
                          {...{ className: "absolute top-1/4 left-1/3 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60" } as any}
                          animate={{ 
                            x: [-50, 200],
                            y: [0, 50, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <motion.div 
                          {...{ className: "absolute bottom-1/3 right-1/4 w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" } as any}
                          animate={{ 
                            x: [50, -200],
                            y: [0, -30, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                        />
                      </div>
                    )}
                    
                    {/* 3D Floating icon with electricity - simpler animation on mobile */}
                    <motion.div 
                      {...{ className: "relative w-20 h-20 mx-auto mb-6" } as any}
                      animate={isMobile ? {} : { 
                        rotateZ: [0, 5, -5, 0]
                      }}
                      transition={isMobile ? {} : { 
                        rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 flex items-center justify-center">
                        <BoltIcon className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-white ${isMobile ? '' : 'drop-shadow-lg'}`} />
                      </div>
                      {/* 3D shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl" style={{ transform: "translateY(4px)", opacity: 0.4 }}></div>
                      
                      {/* Electric effect - disabled on mobile */}
                      {!isMobile && (
                        <motion.div
                          {...{ className: "absolute -inset-2" } as any}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <BoltIcon className="h-24 w-24 text-blue-300 opacity-20 blur-sm" />
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <div className="text-center flex-grow flex flex-col justify-center">
                      <h4 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black text-white mb-2 tracking-tight`}>99.9% Uptime</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-200/80 font-medium`}>Siempre funcionando</p>
                      
                      {/* Live indicator with pulse rings - simpler on mobile */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="relative">
                          {!isMobile && (
                            <>
                              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            </>
                          )}
                          <div className={`relative w-3 h-3 bg-green-400 rounded-full ${isMobile ? '' : 'shadow-glow-green'}`}></div>
                        </div>
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-400 font-bold uppercase tracking-wide whitespace-nowrap`}>LIVE NOW</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* Problem/Solution Section - EPIC DESIGN */}
        <section className="relative py-32 overflow-hidden">
          {/* Fondo épico con gradientes y efectos */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradient mesh background - ultra difuminado con transición suave */}
            <div className="absolute -top-[600px] left-0 right-0 h-[1200px]">
              {/* Blobs que se extienden mucho más arriba para evitar líneas duras */}
              <div className={`absolute -top-[200px] left-1/4 w-[1000px] h-[1000px] bg-red-400/50 rounded-full ${isMobile ? 'blur-[150px]' : 'blur-[300px]'} opacity-[0.02]`} style={{ willChange: 'auto' }}></div>
              <div className={`absolute -top-[200px] right-1/4 w-[1000px] h-[1000px] bg-orange-400/50 rounded-full ${isMobile ? 'blur-[150px]' : 'blur-[300px]'} opacity-[0.02]`} style={{ willChange: 'auto' }}></div>
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-pink-400/50 rounded-full ${isMobile ? 'blur-[150px]' : 'blur-[350px]'} opacity-[0.015]`} style={{ willChange: 'auto' }}></div>
              
              {/* Capa de transición suave adicional */}
              <div className="absolute -top-[400px] left-0 right-0 h-[600px] bg-gradient-to-b from-transparent via-transparent to-black/[0.01]"></div>
            </div>
            
            {/* Blobs adicionales más sutiles */}
            <div className="absolute inset-0">
              <div className={`absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-pink-500 rounded-full ${isMobile ? 'blur-xl opacity-5' : 'blur-[180px] opacity-5 animate-pulse'}`} style={{ animationDelay: '4s', willChange: 'auto' }}></div>
              <div className={`absolute top-1/2 right-0 w-[500px] h-[500px] bg-red-400 rounded-full ${isMobile ? 'blur-xl opacity-4' : 'blur-[160px] opacity-4 animate-pulse'}`} style={{ animationDelay: '2s', willChange: 'auto' }}></div>
            </div>
            
            {/* Grid pattern overlay con fade muy suave */}
            <div className="absolute inset-0 opacity-5"
                 style={{
                   backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                   backgroundSize: '50px 50px',
                   maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1), transparent 70%)',
                   WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1), transparent 70%)'
                 }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              {...{ className: "max-w-6xl mx-auto" } as any}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              {/* Título épico con animación */}
              <motion.div 
                {...{ className: "text-center mb-20" } as any}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  {...{ className: "text-5xl md:text-7xl font-black mb-6 leading-tight" } as any}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  El 93% de creadores <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">fracasa</span>
                  <br />
                  <span className="text-3xl md:text-5xl text-gray-400">por hacer TODO manual</span>
                </motion.h2>
                
                <motion.p 
                  {...{ className: "text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto" } as any}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Mientras respondes DMs, tu competencia cierra 5 ventas automáticas
                </motion.p>
              </motion.div>

              {/* Split screen comparison - PROFESIONAL Y ÉPICO */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 relative items-stretch max-w-5xl mx-auto">
                {/* Línea divisoria ELÉCTRICA animada */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] hidden lg:block">
                  <motion.div 
                    {...{ className: "h-full bg-gradient-to-b from-transparent via-white/60 to-transparent" } as any}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                </div>

                {/* Lado izquierdo - El problema */}
                <motion.div 
                  {...{ className: "relative group flex flex-col" } as any}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Multi-layer glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur-md opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-700"></div>
                  
                  {/* Efecto de fuego animado */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <motion.div
                      {...{ className: "absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-red-600/20 via-orange-500/10 to-transparent" } as any}
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-gray-950 via-red-950/90 to-gray-950 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-red-500/40 overflow-hidden h-full flex flex-col">
                    {/* Header con efecto de llamas */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                      <motion.div 
                        {...{ className: "relative w-14 h-14" } as any}
                        animate={{ 
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg shadow-red-500/50"></div>
                        <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <XMarkIcon className={`h-7 w-7 text-white ${isMobile ? '' : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                        </div>
                      </motion.div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 ${isMobile ? '' : 'drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}>Sin</h3>
                          <Image src="/images/logo.png" alt="Creator0x" width={140} height={40} className="h-8 w-auto" />
                        </div>
                        <p className="text-xs text-red-400/80 font-medium uppercase tracking-wider">El camino al fracaso</p>
                      </div>
                    </div>

                    {/* Pain points con animaciones BRUTALES */}
                    <div className="space-y-3 flex-1 flex flex-col items-center">
                      <div className="w-full max-w-xs space-y-3 ml-4">
                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">Respondes 200 veces</p>
                            <p className="text-red-300/70 text-xs md:text-sm font-medium">la misma pregunta</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CursorArrowRaysIcon className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">El link genérico</p>
                            <p className="text-red-300/70 text-xs md:text-sm font-medium">de tu bio roba tráfico</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">Enlaces interminables</p>
                            <p className="text-red-300/70 text-xs md:text-sm font-medium">que parecen phishing</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">Horas buscando</p>
                            <p className="text-red-300/70 text-xs md:text-sm font-medium">el caption perfecto</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Separador visual */}
                    <div className="mt-6 mb-6 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-red-500/20"></div>
                      </div>
                    </div>
                    
                    {/* Resultado final */}
                    <motion.div 
                      {...{ className: "px-4" } as any}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          {...{ className: "w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0" } as any}
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        </motion.div>
                        <div className="text-left flex-1">
                          <p className="text-xs text-red-400/60 font-medium uppercase tracking-wider mb-1">El resultado</p>
                          <p className="text-lg md:text-xl font-black text-white">
                            Trabajas más, ganas menos
                          </p>
                          <p className="text-xs md:text-sm text-red-300/50 mt-1">Y tu competencia te supera cada día</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Lado derecho - La solución */}
                <motion.div 
                  {...{ className: "relative group flex flex-col" } as any}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Multi-layer glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-md opacity-25 group-hover:opacity-35 transition duration-500"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-25 transition duration-700"></div>
                  
                  {/* Efecto de aurora boreal */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <motion.div
                      {...{ className: "absolute -top-10 left-0 right-0 h-40 bg-gradient-to-b from-green-400/20 via-emerald-300/10 to-transparent" } as any}
                      animate={{ 
                        y: [0, 10, 0],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    {/* Partículas de éxito */}
                    <motion.div
                      {...{ className: "absolute inset-0" } as any}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          {...{ className: "absolute w-1 h-1 bg-green-400 rounded-full" } as any}
                          style={{ 
                            left: `${20 + i * 15}%`,
                            top: `${10 + i * 10}%`
                          }}
                          animate={{ 
                            y: [-20, -40, -20],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-gray-950 via-green-950/90 to-gray-950 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-green-500/40 overflow-hidden h-full flex flex-col">
                    {/* Header con efecto celestial */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                      <motion.div 
                        {...{ className: "relative w-14 h-14" } as any}
                        animate={{ 
                          rotate: [0, -5, 5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/50"></div>
                        <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <CheckIcon className={`h-7 w-7 text-white ${isMobile ? '' : 'drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`} />
                        </div>
                        {/* Sparkle effect */}
                        <motion.div
                          {...{ className: "absolute -top-1 -right-1 w-3 h-3" } as any}
                          animate={{ 
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <SparklesIcon className="w-3 h-3 text-yellow-400" />
                        </motion.div>
                      </motion.div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 ${isMobile ? '' : 'drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]'}`}>Con</h3>
                          <Image src="/images/logo.png" alt="Creator0x" width={140} height={40} className="h-8 w-auto" />
                        </div>
                        <p className="text-xs text-green-400/80 font-medium uppercase tracking-wider">Tu camino al éxito</p>
                      </div>
                    </div>

                    {/* Benefits con animaciones */}
                    <div className="space-y-3 flex-1 flex flex-col items-center">
                      <div className="w-full max-w-xs space-y-3 ml-4">
                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">DMs 100% automáticos</p>
                            <p className="text-green-300/70 text-xs md:text-sm font-medium">Vendes mientras duermes</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">+427% más conversiones</p>
                            <p className="text-green-300/70 text-xs md:text-sm font-medium">Respuesta en &lt;3 segundos</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">Links que nunca fallan</p>
                            <p className="text-green-300/70 text-xs md:text-sm font-medium">Con tu propio dominio pro</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          {...{ className: "flex items-center gap-4" } as any}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-base md:text-lg">Captions virales en 10s</p>
                            <p className="text-green-300/70 text-xs md:text-sm font-medium">IA entrenada con +10M posts</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Separador visual */}
                    <div className="mt-6 mb-6 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-green-500/20"></div>
                      </div>
                    </div>
                    
                    {/* Resultado final */}
                    <motion.div 
                      {...{ className: "px-4" } as any}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          {...{ className: "w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0" } as any}
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </motion.div>
                        <div className="text-left flex-1">
                          <p className="text-xs text-green-400/60 font-medium uppercase tracking-wider mb-1">El resultado</p>
                          <p className="text-lg md:text-xl font-black text-white">
                            Trabajas menos, ganas más
                          </p>
                          <p className="text-xs md:text-sm text-green-300/50 mt-1">Y tienes tiempo para lo que realmente importa</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* CTA ÉPICO con urgencia máxima */}
              <motion.div 
                {...{ className: "text-center mt-20" } as any}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.p 
                  {...{ className: "text-3xl md:text-4xl font-black mb-8" } as any}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">¿Qué prefieres?</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">¿Seguir perdiendo o empezar a ganar?</span>
                </motion.p>
                
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    {...{ className: "inline-block relative group" } as any}
                  >
                    {/* Glow effect máximo */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                    
                    <Button size="lg" className="relative h-16 px-12 text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 transition-all duration-300 shadow-2xl">
                      Automatiza AHORA (gratis)
                      <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.p 
                  {...{ className: "text-sm font-medium mt-6 flex items-center justify-center gap-2" } as any}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BoltIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    1247 creadores empezaron esta semana
                  </span>
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-12">
        
        </footer>
      </div>
    </>
  );
}