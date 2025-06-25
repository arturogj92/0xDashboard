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
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

// Activity Ticker Component with multiple notifications
function ActivityTicker() {
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
  const [visibleActivities, setVisibleActivities] = useState([]);
  
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
    }, 5000);
    
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
    }, 1000);
    
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
    <div className="relative h-[88px] max-w-3xl mx-auto overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        {visibleActivities.map((activity, i) => {
          const index = i;
          const isNewest = i === visibleActivities.length - 1;
          
          return (
            <motion.div
              key={activity.id}
              className="absolute w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-full py-3 px-6"
              initial={isNewest ? { 
                opacity: 0, 
                y: 88,
                scale: 0.95
              } : false}
              animate={{ 
                opacity: index === visibleActivities.length - 1 ? 1 : 0.7,
                y: index * 44,
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
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${
                      index === visibleActivities.length - 1 
                        ? 'bg-green-400' 
                        : 'bg-gray-500'
                    }`}
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
  const containerRef = useRef(null);
  
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

  // Handle hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* iPhone Frame - Simplified 3D */}
      <motion.div
        className="relative"
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
              className="relative w-full h-full"
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
          className="absolute -right-16 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl p-4 min-w-48"
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
        className="absolute -top-8 -left-8 group cursor-pointer"
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
        className="absolute -bottom-8 -right-8 group cursor-pointer"
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
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-40"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Inner sparkle container */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full p-0.5">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-white/10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                ✨
              </motion.div>
            </div>
          </div>
          
          {/* Mini floating sparks */}
          <motion.div 
            className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full"
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
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-purple-500/20 rounded-full blur-xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        style={{
          y: scrollY * 0.3,
        }}
      />
      
      {/* Orbe 2 - Verde-Azul - Velocidad media */}
      <motion.div
        className="absolute top-3/4 right-1/3 w-24 h-24 bg-gradient-to-r from-green-400/15 to-blue-500/15 rounded-full blur-xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        style={{
          y: scrollY * 0.5,
        }}
      />
      
      {/* Orbe 3 - Púrpura-Rosa - Velocidad rápida */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-purple-400/25 to-pink-500/25 rounded-full blur-lg"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        style={{
          y: scrollY * 0.7,
        }}
      />
      
      {/* Orbe 4 - Azul-Cyan - Velocidad muy lenta */}
      <motion.div
        className="absolute top-1/3 left-1/6 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
        style={{
          y: scrollY * 0.2,
        }}
      />
      
      {/* Orbe 5 - Amarillo-Naranja - Velocidad media-rápida */}
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-gradient-to-r from-yellow-400/15 to-orange-500/15 rounded-full blur-xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, delay: 0.4, ease: "easeOut" }}
        style={{
          y: scrollY * 0.6,
        }}
      />
      
      {/* Orbe 6 - Rosa-Rojo - Velocidad máxima */}
      <motion.div
        className="absolute top-1/3 right-1/6 w-12 h-12 bg-gradient-to-r from-pink-400/30 to-red-500/30 rounded-full blur-lg"
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
                  className="text-3xl md:text-4xl lg:text-5xl font-bold font-manrope mb-6 leading-tight"
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
                  className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" 
                       style={{ backgroundColor: 'var(--secondary)' }} />
                  <span className="text-sm">🔥 +1,200 creadores ya automatizando</span>
                </motion.div>

                <motion.p
                  className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl lg:max-w-none"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  La única plataforma que automatiza DMs de Instagram, crea tu landing y link-in-bio totalmente personalizada, 
                  acorta URLs con analytics y genera captions perfectos con IA.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Link href="/register">
                    <Button size="lg" className="h-12 px-8 text-lg font-semibold group">
                      Empieza GRATIS
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
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
                  className="relative"
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
          {/* Epic background effects - Ultra smooth transition */}
          <div className="absolute -top-64 -bottom-96 left-0 right-0 pointer-events-none">
            {/* Animated gradient orbs - Even larger and more diffused */}
            <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-[150px] animate-pulse" />
            <div className="absolute top-1/2 right-1/4 w-[800px] h-[800px] bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Multiple gradient layers for ultra smooth fade */}
            <div className="absolute -bottom-32 left-0 right-0 h-96 bg-gradient-to-t from-transparent via-transparent to-orange-500/5 blur-[100px]" />
            <div className="absolute -bottom-48 left-0 right-0 h-[500px] bg-gradient-to-t from-transparent to-purple-500/5 blur-[120px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Epic title with glow */}
              <div className="text-center mb-16">
                <motion.div
                  className="inline-block relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Glow effect behind title */}
                  <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-orange-400/40 to-purple-400/40 -z-10" />
                  
                  <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                    Mientras tú duermes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 animate-gradient">ellos venden</span>
                  </h3>
                </motion.div>
                
                <motion.p 
                  className="text-gray-200 text-xl max-w-3xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Números reales de creadores que tomaron acción (y ahora viven de Instagram)
                </motion.p>
              </div>
              
              {/* Metrics Cards - ULTRA GLOW UP VERSION */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {/* DMs Automatizados - ULTRA */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Reduced glow */}
                  {/* Simple static glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-pink-600/20 rounded-3xl blur-xl" />
                  
                  <div className="relative h-full rounded-3xl border border-white/10 overflow-hidden">
                    {/* Background layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl"></div>
                    
                    {/* Blobs layer - on top of background */}
                    <div className="absolute inset-0 z-10">
                      <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl opacity-30"></div>
                      <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-red-400 to-orange-500 rounded-full blur-2xl opacity-25"></div>
                    </div>
                    
                    {/* Content layer - on top of everything */}
                    <div className="relative z-20 p-8">
                      {/* Blobs DENTRO del contenido */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-400/20 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-pink-400/20 rounded-full blur-xl"></div>
                      
                      <motion.div 
                        className="text-5xl md:text-6xl font-black mb-3 relative z-10"
                        style={{
                          background: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))"
                        }}
                      >
                        2.1M+
                      </motion.div>
                      <div className="text-lg font-semibold text-white mb-2 relative z-10">DMs enviados</div>
                      <div className="text-sm text-orange-300/80 relative z-10">sin spam ni baneos</div>
                    </div>
                    
                    {/* Floating badge */}
                    <motion.div 
                      className="absolute -top-3 -right-3 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-xl shadow-2xl shadow-orange-500/50"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      🔥
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Link Clicks - ULTRA */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* Simple static glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl" />
                  
                  <div className="relative h-full bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden">
                    {/* Animated background pattern with blobs */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent animate-gradient" />
                    </div>
                    
                    {/* Background blobs */}
                    <div className="absolute -top-6 -left-8 w-44 h-44 bg-purple-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-4 right-4 w-36 h-36 bg-blue-500/25 rounded-full blur-2xl" />
                    <div className="absolute top-1/3 right-1/2 w-24 h-24 bg-purple-400/20 rounded-full blur-xl" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <motion.div 
                        className="text-5xl md:text-6xl font-black mb-3"
                        style={{
                          background: "linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))"
                        }}
                      >
                        847K+
                      </motion.div>
                      <div className="text-lg font-semibold text-white mb-2">Clicks en bio</div>
                      <div className="text-sm text-purple-300/80">32% conversión</div>
                    </div>
                    
                    {/* Floating badge */}
                    <motion.div 
                      className="absolute -top-3 -right-3 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-xl shadow-2xl shadow-purple-500/50"
                      animate={{ 
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    >
                      💎
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Tiempo Ahorrado - ULTRA */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {/* Reduced glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl" />
                  
                  <div className="relative h-full bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden">
                    {/* Animated background pattern with blobs */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent animate-gradient" />
                    </div>
                    
                    {/* Background blobs */}
                    <div className="absolute -top-4 right-2 w-36 h-36 bg-green-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-2 -left-4 w-40 h-40 bg-emerald-500/25 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-green-400/20 rounded-full blur-xl" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <motion.div 
                        className="text-5xl md:text-6xl font-black mb-3"
                        style={{
                          background: "linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))"
                        }}
                      >
                        18K+
                      </motion.div>
                      <div className="text-lg font-semibold text-white mb-2">Horas ahorradas</div>
                      <div className="text-sm text-green-300/80">= 2 años de trabajo</div>
                    </div>
                    
                    {/* Floating badge */}
                    <motion.div 
                      className="absolute -top-3 -right-3 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-xl shadow-2xl shadow-green-500/50"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    >
                      ⏰
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* ROI Promedio - ULTRA */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {/* Reduced glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl" />
                  
                  <div className="relative h-full bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden">
                    {/* Animated background pattern with blobs */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent animate-gradient" />
                    </div>
                    
                    {/* Background blobs */}
                    <div className="absolute top-2 -right-6 w-38 h-38 bg-blue-500/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-4 left-4 w-34 h-34 bg-cyan-500/25 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-1/4 w-22 h-22 bg-blue-400/20 rounded-full blur-xl" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <motion.div 
                        className="text-5xl md:text-6xl font-black mb-3"
                        style={{
                          background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
                        }}
                      >
                        427%
                      </motion.div>
                      <div className="text-lg font-semibold text-white mb-2">ROI promedio</div>
                      <div className="text-sm text-blue-300/80">en 90 días</div>
                    </div>
                    
                    {/* Floating badge */}
                    <motion.div 
                      className="absolute -top-3 -right-3 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-xl shadow-2xl shadow-blue-500/50"
                      animate={{ 
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                    >
                      📈
                    </motion.div>
                  </div>
                </motion.div>
              </div>
              
              {/* Ticker de actividad en tiempo real */}
              <ActivityTicker />
              
              {/* Trust Indicators - MEGA GLOWUP EXTREMO */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {/* Instagram Compatible - MEGA EPIC CARD */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.3, type: "spring" } 
                  }}
                >
                  {/* Multi-layer glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition duration-900"></div>
                  
                  <div className="relative bg-gradient-to-br from-green-950/80 via-emerald-900/80 to-green-950/80 backdrop-blur-2xl rounded-3xl p-8 border border-green-400/20 group-hover:border-green-300/40 transition-all duration-500 overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 w-40 h-40 bg-green-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full opacity-60 animate-ping"></div>
                      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-emerald-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-green-300 rounded-full opacity-60 animate-ping" style={{ animationDelay: '2s' }}></div>
                    </div>
                    
                    {/* 3D Floating icon */}
                    <motion.div 
                      className="relative w-20 h-20 mx-auto mb-6"
                      animate={{ 
                        rotateZ: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-2xl shadow-2xl shadow-green-500/50 flex items-center justify-center">
                        <CheckIcon className="h-10 w-10 text-white drop-shadow-lg" />
                      </div>
                      {/* 3D shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl" style={{ transform: "translateZ(-10px) translateY(4px)", opacity: 0.4 }}></div>
                    </motion.div>
                    
                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">100% Compatible</h4>
                    <p className="text-sm text-green-200/80 font-medium">Instagram API oficial</p>
                    
                    {/* Animated bar */}
                    <div className="mt-4 h-1 bg-green-900/50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Reviews - MEGA EPIC CARD */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.3, type: "spring" } 
                  }}
                >
                  {/* Multi-layer glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition duration-900"></div>
                  
                  <div className="relative bg-gradient-to-br from-orange-950/80 via-yellow-900/80 to-orange-950/80 backdrop-blur-2xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-300/40 transition-all duration-500 overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-60 animate-ping"></div>
                      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-yellow-300 rounded-full opacity-60 animate-ping" style={{ animationDelay: '2s' }}></div>
                    </div>
                    
                    {/* 3D Floating icon */}
                    <motion.div 
                      className="relative w-20 h-20 mx-auto mb-6"
                      animate={{ 
                        rotateZ: [0, -5, 5, 0]
                      }}
                      transition={{ 
                        rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 rounded-2xl shadow-2xl shadow-yellow-500/50 flex items-center justify-center">
                        <StarIcon className="h-10 w-10 text-white drop-shadow-lg" />
                      </div>
                      {/* 3D shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-yellow-700 rounded-2xl" style={{ transform: "translateZ(-10px) translateY(4px)", opacity: 0.4 }}></div>
                    </motion.div>
                    
                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">4.9/5 Estrellas</h4>
                    <p className="text-sm text-yellow-200/80 font-medium">+1,200 creadores felices</p>
                    
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
                          whileHover={{ 
                            scale: 1.3,
                            rotate: 360,
                            transition: { duration: 0.3 }
                          }}
                        >
                          <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400 drop-shadow-glow" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Uptime - MEGA EPIC CARD */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.3, type: "spring" } 
                  }}
                >
                  {/* Multi-layer glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition duration-900"></div>
                  
                  <div className="relative bg-gradient-to-br from-blue-950/80 via-cyan-900/80 to-blue-950/80 backdrop-blur-2xl rounded-3xl p-8 border border-blue-400/20 group-hover:border-blue-300/40 transition-all duration-500 overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 w-40 h-40 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    {/* Electric particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div 
                        className="absolute top-1/4 left-1/3 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60"
                        animate={{ 
                          x: [-50, 200],
                          y: [0, 50, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div 
                        className="absolute bottom-1/3 right-1/4 w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                        animate={{ 
                          x: [50, -200],
                          y: [0, -30, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      />
                    </div>
                    
                    {/* 3D Floating icon with electricity */}
                    <motion.div 
                      className="relative w-20 h-20 mx-auto mb-6"
                      animate={{ 
                        rotateZ: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 flex items-center justify-center">
                        <BoltIcon className="h-10 w-10 text-white drop-shadow-lg" />
                      </div>
                      {/* 3D shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl" style={{ transform: "translateZ(-10px) translateY(4px)", opacity: 0.4 }}></div>
                      
                      {/* Electric effect */}
                      <motion.div
                        className="absolute -inset-2"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <BoltIcon className="h-24 w-24 text-blue-300 opacity-20 blur-sm" />
                      </motion.div>
                    </motion.div>
                    
                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">99.9% Uptime</h4>
                    <p className="text-sm text-blue-200/80 font-medium">Siempre funcionando</p>
                    
                    {/* Live indicator with pulse rings */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        <div className="relative w-3 h-3 bg-green-400 rounded-full shadow-glow-green"></div>
                      </div>
                      <span className="text-sm text-green-400 font-bold uppercase tracking-wide">LIVE NOW</span>
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
              <div className="absolute -top-[200px] left-1/4 w-[1000px] h-[1000px] bg-red-400/50 rounded-full filter blur-[300px] opacity-[0.02]"></div>
              <div className="absolute -top-[200px] right-1/4 w-[1000px] h-[1000px] bg-orange-400/50 rounded-full filter blur-[300px] opacity-[0.02]"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-pink-400/50 rounded-full filter blur-[350px] opacity-[0.015]"></div>
              
              {/* Capa de transición suave adicional */}
              <div className="absolute -top-[400px] left-0 right-0 h-[600px] bg-gradient-to-b from-transparent via-transparent to-black/[0.01]"></div>
            </div>
            
            {/* Blobs adicionales más sutiles */}
            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-pink-500 rounded-full filter blur-[180px] opacity-5 animate-pulse" style={{ animationDelay: '4s' }}></div>
              <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-red-400 rounded-full filter blur-[160px] opacity-4 animate-pulse" style={{ animationDelay: '2s' }}></div>
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
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Título épico con animación */}
              <motion.div 
                className="text-center mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  className="text-5xl md:text-7xl font-black mb-6 leading-tight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  El 93% de creadores <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">fracasa</span>
                  <br />
                  <span className="text-3xl md:text-5xl text-gray-400">por hacer TODO manual</span>
                </motion.h2>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Mientras respondes DMs, tu competencia cierra 5 ventas automáticas
                </motion.p>
              </motion.div>

              {/* Split screen comparison - BRUTAL */}
              <div className="grid lg:grid-cols-2 gap-8 relative">
                {/* Línea divisoria animada */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block">
                  <motion.div 
                    className="h-full bg-gradient-to-b from-transparent via-red-500 to-transparent"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                </div>

                {/* Lado izquierdo - El problema (Oscuro) */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-red-500/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <XMarkIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-red-400">Sin Creator0x</h3>
                    </div>

                    {/* Pain points con animaciones */}
                    <div className="space-y-6">
                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">4-6 horas diarias respondiendo DMs</p>
                          <p className="text-gray-400 text-sm">= €3,000/mes en tiempo perdido</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">67% de ventas perdidas</p>
                          <p className="text-gray-400 text-sm">Por no responder en menos de 30 segundos</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">Enlaces rotos cada semana</p>
                          <p className="text-gray-400 text-sm">"Link in bio no funciona" x100</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">2h creando 1 caption</p>
                          <p className="text-gray-400 text-sm">Que ni siquiera viraliza</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Resultado final */}
                    <motion.div 
                      className="mt-8 p-4 bg-red-500/10 rounded-2xl border border-red-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-center text-red-400 font-bold">
                        Resultado: Burnout + €0 en el banco
                      </p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Lado derecho - La solución (Brillante) */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <CheckIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-400">Con Creator0x</h3>
                    </div>

                    {/* Benefits con animaciones */}
                    <div className="space-y-6">
                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">DMs 100% automáticos</p>
                          <p className="text-gray-300 text-sm">Vendes mientras duermes 💤</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">+427% más conversiones</p>
                          <p className="text-gray-300 text-sm">Respuesta en menos de 3 segundos</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">Links que nunca fallan</p>
                          <p className="text-gray-300 text-sm">Con tu propio dominio pro</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                        <div>
                          <p className="text-white font-semibold">Captions virales en 10s</p>
                          <p className="text-gray-300 text-sm">IA entrenada con +10M posts</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Resultado final */}
                    <motion.div 
                      className="mt-8 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/40"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-center text-green-400 font-bold">
                        Resultado: 6 cifras + Vida libre 🚀
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* CTA con urgencia */}
              <motion.div 
                className="text-center mt-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                  ¿Qué prefieres? ¿Seguir perdiendo o empezar a ganar?
                </p>
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-xl font-bold group">
                    Automatiza AHORA (gratis)
                    <ArrowRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-400 mt-4">
                  ⚡ 1,247 creadores empezaron esta semana
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Demo Section - Inspired by Linktr.ee */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left side - Mock phone showing Creator0x in action */}
                <motion.div 
                  className="flex justify-center lg:justify-start"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="relative">
                    {/* Phone mockup */}
                    <div className="relative w-80 h-[600px] rounded-3xl border-8 border-gray-800 bg-black shadow-2xl overflow-hidden">
                      {/* Phone screen */}
                      <div className="w-full h-full rounded-2xl bg-gradient-to-b from-purple-900 via-gray-900 to-black p-6 flex flex-col items-center">
                        
                        {/* Profile section */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-green-400 mb-4 shadow-lg"></div>
                        <h3 className="text-white font-bold text-lg mb-2">@miusuario</h3>
                        <p className="text-gray-300 text-sm text-center mb-6">Creador de contenido 🎨<br/>Todo mi contenido aquí ⬇️</p>
                        
                        {/* Links stack */}
                        <div className="w-full space-y-3">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center text-white font-semibold">
                            🎥 Mis últimos videos
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center text-white font-semibold">
                            📱 Sígueme en Instagram
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center text-white font-semibold">
                            🛍️ Mi tienda online
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center text-white font-semibold">
                            💌 Contacto para colaboraciones
                          </div>
                        </div>
                        
                        {/* Social icons */}
                        <div className="flex gap-4 mt-6">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                </motion.div>

                {/* Right side - Features */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 font-manrope">
                    Todo tu imperio digital en un solo enlace
                  </h2>
                  <p className="text-lg text-gray-300 mb-8">
                    Olvídate de perder seguidores por enlaces rotos. Una página que nunca duerme, 
                    siempre lista para convertir cada visita en una venta. El 73% de nuestros usuarios 
                    duplica sus conversiones en el primer mes.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        ✨
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Diseño personalizable</h3>
                        <p className="text-gray-400 text-sm">Elige entre múltiples temas y colores</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        📊
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Analytics incluidos</h3>
                        <p className="text-gray-400 text-sm">Ve qué enlaces reciben más clicks</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                        🔗
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">URLs cortas incluidas</h3>
                        <p className="text-gray-400 text-sm">Crea enlaces memorables para redes sociales</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </section>

        {/* How it Works - Feature Explanations */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-manrope">
                3 herramientas que están revolucionando Instagram
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Mientras otros creadores pierden horas respondiendo DMs, tú generas ingresos automáticamente
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-20">
              
              {/* Feature 1: Auto-DM */}
              <motion.div 
                className="grid lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div>
                  <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    🤖 Auto-DM
                  </div>
                  <h3 className="text-3xl font-bold mb-4">De comentario a venta en 3 segundos</h3>
                  <p className="text-gray-300 mb-6 text-lg">
                    <strong>El 67% de los compradores abandona si no recibe respuesta inmediata.</strong> 
                    Creator0x detecta cada comentario y envía tu mensaje personalizado al instante. 
                    Resultado: +427% más leads cualificados sin mover un dedo.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>⚡ Respuesta en &lt;3 segundos (velocidad de venta)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>🎯 IA detecta intención de compra automáticamente</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>📊 Tracking completo: comentario → venta</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/20">
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">Comentario en tu reel:</div>
                        <div className="text-white">"¡Me encanta! ¿Dónde puedo comprarlo?"</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRightIcon className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="bg-purple-500/20 rounded-lg p-4">
                        <div className="text-sm text-purple-300 mb-2">DM automático enviado:</div>
                        <div className="text-white">"¡Hola! Te envío el enlace de mi tienda: mitienda.com 🛍️"</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature 2: Short URLs */}
              <motion.div 
                className="grid lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div>
                  <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    ✂️ URLs Cortas
                  </div>
                  <h3 className="text-3xl font-bold mb-4">El link que SÍ recuerdan (y hacen clic)</h3>
                  <p className="text-gray-300 mb-6 text-lg">
                    <strong>Los links largos pierden 84% más clics que los cortos.</strong> 
                    Crea URLs que tu audiencia recuerda de memoria: "miusuario.creator0x.com/oferta". 
                    Perfectos para stories que desaparecen pero las ventas que se quedan.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>🔥 URLs que se recuerdan (tipo: tuusuario.com/curso)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>⚡ Analytics en vivo: ve cada clic al instante</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>🏆 Tu propio dominio = +340% credibilidad</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-2xl p-6 border border-orange-500/20">
                    <div className="space-y-4">
                      <div className="bg-red-500/20 rounded-lg p-4">
                        <div className="text-xs text-red-300 mb-1">URL original (larga):</div>
                        <div className="text-xs text-gray-300 break-all">https://mitienda.com/productos/curso-fotografia-profesional-para-instagram-2024?utm_source=instagram</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRightIcon className="h-6 w-6 text-orange-400" />
                      </div>
                      <div className="bg-orange-500/20 rounded-lg p-4">
                        <div className="text-xs text-orange-300 mb-1">URL corta (memorable):</div>
                        <div className="text-lg text-white font-mono">miusuario.creator0x.com/curso</div>
                        <div className="text-xs text-gray-300 mt-2">✨ Fácil de recordar para tus stories</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature 3: AI Captions */}
              <motion.div 
                className="grid lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="lg:order-2">
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    🤖 IA Captions
                  </div>
                  <h3 className="text-3xl font-bold mb-4">El caption que hace viral tu contenido</h3>
                  <p className="text-gray-300 mb-6 text-lg">
                    <strong>El 92% del engagement depende del primer renglón.</strong> 
                    Nuestra IA analiza +10 millones de posts virales para crear el caption perfecto que 
                    genere comentarios, saves y shares. En 10 segundos tienes lo que otros tardan 2 horas.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>🧠 IA entrenada con +10M posts virales</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>#️⃣ Hashtags que SÍ funcionan (no los típicos)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>🎯 Adaptado a IG, TikTok, YouTube automáticamente</span>
                    </div>
                  </div>
                </div>
                <div className="lg:order-1 relative">
                  <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 border border-blue-500/20">
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">📹 Video subido</div>
                        <div className="bg-gray-700 rounded h-20 flex items-center justify-center text-gray-400">
                          Video de receta de pasta
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-blue-400">✨ IA procesando...</div>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-4">
                        <div className="text-sm text-blue-300 mb-2">📝 Caption generado:</div>
                        <div className="text-sm text-white">
                          "¡La pasta perfecta en 15 minutos! 🍝✨ Ingredientes simples, sabor increíble. ¿Cuál es tu salsa favorita? 
                          #PastaCasera #RecetasFáciles #Cocina"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-manrope">
              El problema de los creadores
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { icon: '💬', title: 'Respondes 200 veces', desc: 'la misma pregunta' },
                { icon: '👆', title: 'El link genérico', desc: 'de tu bio roba tráfico' },
                { icon: '🔗', title: 'Enlaces interminables', desc: 'que parecen phishing' },
                { icon: '📝', title: 'Horas buscando', desc: 'el caption perfecto' }
              ].map((problem, index) => (
                <motion.div
                  key={index}
                  className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-center hover:border-purple-400/50 transition-all duration-300"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-4xl mb-4">{problem.icon}</div>
                  <h3 className="font-semibold mb-2">{problem.title}</h3>
                  <p className="text-sm text-gray-400">{problem.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 fade-in-section bg-gradient-to-b from-transparent via-purple-500/10 to-transparent">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-manrope">
              La solución todo-en-uno
            </h2>
            <p className="text-xl text-center text-gray-300 mb-16 max-w-3xl mx-auto">
              Creator0x concentra las cuatro herramientas esenciales eliminando configuraciones absurdas y facturas acumuladas.
            </p>

            <div className="features-grid grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: <ChatBubbleLeftRightIcon className="h-8 w-8" />,
                  title: 'Auto-DM',
                  desc: 'Responde con enlaces o cupones en segundos',
                  color: 'from-[#FF2EB3] to-[#FF6B9D]'
                },
                {
                  icon: <LinkIcon className="h-8 w-8" />,
                  title: 'Link-in-Bio',
                  desc: 'Mini-landing con tu branding',
                  color: 'from-[#B6FF00] to-[#7FFF00]'
                },
                {
                  icon: <BoltIcon className="h-8 w-8" />,
                  title: 'Shortlinks',
                  desc: 'Enlaces de tu dominio con analítica',
                  color: 'from-[#00D4FF] to-[#0099FF]'
                },
                {
                  icon: <SparklesIcon className="h-8 w-8" />,
                  title: 'Caption AI',
                  desc: 'Captions y hashtags automáticos (BETA)',
                  color: 'from-[#FFD700] to-[#FFA500]'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-card group relative backdrop-blur-sm border rounded-3xl p-8 hover:border-white/20 transition-all duration-300"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 font-manrope">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-manrope">
              Ahorra tiempo y dinero
            </h2>

            <div className="max-w-5xl mx-auto">
              <div className="backdrop-blur-sm border rounded-3xl p-8 md:p-12"
                   style={{ 
                     backgroundColor: 'var(--card)',
                     borderColor: 'var(--border)'
                   }}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--primary)' }}>Sin Creator0x</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span>ManyChat</span>
                        <span className="text-gray-400">€15/mes</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span>Linktree PRO</span>
                        <span className="text-gray-400">€6/mes</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span>Bitly</span>
                        <span className="text-gray-400">€29/mes</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span>Caption AI Tool</span>
                        <span className="text-gray-400">€20/mes</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 text-xl font-semibold">
                        <span>Total</span>
                        <span className="text-red-400">€70/mes</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--secondary)' }}>Con Creator0x</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 py-3">
                        <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                        <span>Auto-DM ilimitados</span>
                      </div>
                      <div className="flex items-center gap-3 py-3">
                        <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                        <span>Link-in-bio personalizable</span>
                      </div>
                      <div className="flex items-center gap-3 py-3">
                        <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                        <span>Shortlinks con analítica</span>
                      </div>
                      <div className="flex items-center gap-3 py-3">
                        <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                        <span>Caption AI incluido</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 text-xl font-semibold">
                        <span>Todo incluido</span>
                        <span className="text-[#B6FF00]">€10/mes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-3 rounded-full px-6 py-3"
                       style={{ backgroundColor: 'rgba(44, 182, 125, 0.1)' }}>
                    <span className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>Ahorras €60/mes</span>
                    <span className="text-gray-400">(€720/año)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-manrope">
              Empieza gratis, escala cuando quieras
            </h2>
            <p className="text-xl text-center text-gray-300 mb-16 max-w-3xl mx-auto">
              Sin permanencia, sin sorpresas. Cancela cuando quieras.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <motion.div
                className="backdrop-blur-sm border rounded-3xl p-8 hover:border-white/20 transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <h3 className="text-2xl font-semibold mb-4">Free</h3>
                <div className="text-4xl font-bold mb-6">€0<span className="text-lg font-normal text-gray-400">/siempre</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                    <span className="text-sm">3 automatizaciones activas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                    <span className="text-sm">1 landing page</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                    <span className="text-sm">5 URLs cortas/mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                    <span className="text-sm">3 captions IA/mes</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full">
                    Crear cuenta gratis
                  </Button>
                </Link>
              </motion.div>

              {/* Starter Plan */}
              <motion.div
                className="relative bg-gradient-to-b from-purple-500/10 to-transparent backdrop-blur-sm border-2 rounded-3xl p-8"
                style={{ 
                  borderColor: 'var(--primary)',
                  backgroundColor: 'var(--card)'
                }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-semibold"
                     style={{ backgroundColor: 'var(--primary)' }}>
                  MÁS POPULAR
                </div>
                <h3 className="text-2xl font-semibold mb-4">Starter</h3>
                <div className="text-4xl font-bold mb-6">€10<span className="text-lg font-normal text-gray-400">/mes</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">Auto-DM ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">5 landings personalizables</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">Shortlinks ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">50 captions AI/mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">Analítica avanzada</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full">
                    Empezar ahora
                  </Button>
                </Link>
              </motion.div>

              {/* Growth Plan */}
              <motion.div
                className="backdrop-blur-sm border rounded-3xl p-8 hover:border-white/20 transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <h3 className="text-2xl font-semibold mb-4">Growth</h3>
                <div className="text-4xl font-bold mb-6">€25<span className="text-lg font-normal text-gray-400">/mes</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">Todo de Starter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">Landings ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">Captions AI ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">API access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-[#B6FF00] mt-0.5" />
                    <span className="text-sm">Soporte prioritario</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full">
                    Contactar ventas
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section - Inspired by Linktr.ee social proof */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-manrope">
                Mientras lees esto, +1,200 creadores están generando ventas automáticas
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                <strong>No es casualidad que los top influencers usen Creator0x.</strong> Resultados reales, medibles, automáticos.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>€180K+</div>
                <div className="text-sm text-gray-400">Generados este mes</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--secondary)' }}>8.2K+</div>
                <div className="text-sm text-gray-400">Clientes conseguidos</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--accent)' }}>4.2s</div>
                <div className="text-sm text-gray-400">Tiempo promedio de respuesta</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2 text-yellow-400">240%</div>
                <div className="text-sm text-gray-400">Aumento promedio en ventas</div>
              </motion.div>
            </div>

            {/* Testimonials Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <motion.div
                className="backdrop-blur-sm border rounded-2xl p-6 text-center"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                  🎨
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  "En 3 semanas pasé de €800/mes a €4,200/mes. Creator0x convierte mientras duermo. Literal."
                </p>
                <div className="font-semibold text-white">@sofia_fitness</div>
                <div className="text-xs text-gray-400">+€15K generados en 6 meses</div>
              </motion.div>

              <motion.div
                className="backdrop-blur-sm border rounded-2xl p-6 text-center"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-2xl">
                  📈
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  "12 clientes nuevos en una semana. Antes tardaba meses. Creator0x es trampa legal."
                </p>
                <div className="font-semibold text-white">@carlosnutricion</div>
                <div className="text-xs text-gray-400">De 0 a €8K/mes en 4 meses</div>
              </motion.div>

              <motion.div
                className="backdrop-blur-sm border rounded-2xl p-6 text-center"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  "No puedo creer que esto sea legal. Mi primer cliente llegó a las 2 horas de configurarlo."
                </p>
                <div className="font-semibold text-white">@anacoach</div>
                <div className="text-xs text-gray-400">€21K en su primer trimestre</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-manrope">
              Preguntas frecuentes
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: '¿Me pueden banear por usar auto-DM?',
                  a: 'No. Creator0x cumple con las políticas de Meta y usa límites seguros. Nunca hemos tenido un caso de baneo.'
                },
                {
                  q: '¿Puedo cancelar cuando quiera?',
                  a: 'Sí, sin permanencia ni penalizaciones. Cancela desde tu dashboard con un click.'
                },
                {
                  q: '¿Necesito tarjeta para el plan Free?',
                  a: 'No, el plan Free es 100% gratuito sin necesidad de tarjeta de crédito.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="backdrop-blur-sm border rounded-2xl overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between"
                    onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                  >
                    <span className="font-semibold">{faq.q}</span>
                    <ChevronDownIcon 
                      className={`h-5 w-5 transition-transform duration-300 ${
                        activeFAQ === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence>
                    {activeFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-4"
                      >
                        <p className="text-gray-400">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="max-w-3xl mx-auto"
              whileInView={{ scale: [0.95, 1] }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-manrope">
                Última oportunidad: ¿Seguirás perdiendo dinero cada día?
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                <strong>Cada minuto que no automatizas = dinero que se escapa.</strong> Únete a los +1,200 creadores que YA están ganando mientras duermen.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-12 px-10 text-lg font-semibold group">
                  SÍ, quiero GANAR mientras duermo 🚀
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Image
                    src="/images/logo.png"
                    alt="Creator0x"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="text-lg font-semibold">Creator0x</span>
                </div>
                <p className="text-sm text-gray-400">
                  La suite todo-en-uno para creadores digitales.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Producto</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/features" className="hover:text-white transition-colors">Características</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
                  <li><Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Recursos</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/docs" className="hover:text-white transition-colors">Documentación</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">Soporte</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                  <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
              <p>&copy; 2025 Creator0x. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}