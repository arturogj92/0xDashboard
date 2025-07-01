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
import { Settings } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 because we have a clone at position 0
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Create array with clones for infinite scroll
  const extendedImages = [
    images[images.length - 1], // Clone of last image at the beginning
    ...images,
    images[0] // Clone of first image at the end
  ];

  // Handle infinite loop
  useEffect(() => {
    if (!isTransitioning) return;

    if (currentIndex === 0) {
      // We're at the clone of the last image, jump to the real last image
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(images.length); // Jump to the real last image
        setTimeout(() => setIsTransitioning(true), 50);
      }, 300);
      return () => clearTimeout(timer);
    } else if (currentIndex === extendedImages.length - 1) {
      // We're at the clone of the first image, jump to the real first image
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1); // Jump to the real first image
        setTimeout(() => setIsTransitioning(true), 50);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, images.length, extendedImages.length, isTransitioning]);

  // Navigation functions
  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsPaused(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev - 1);
    setIsPaused(true);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1); // +1 because of the clone at the beginning
    setIsPaused(true);
  };

  // Auto-rotate images
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        goToNext();
      }, 4500);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  // Resume auto-rotation after user interaction
  useEffect(() => {
    if (isPaused) {
      const timeout = setTimeout(() => {
        setIsPaused(false);
      }, 8000);
      
      return () => clearTimeout(timeout);
    }
  }, [isPaused, currentIndex]);


  return (
    <>
      <style jsx>{`
        @media (min-width: 1200px) and (max-width: 1350px) {
          .iphone-carousel-wrapper {
            margin-top: 0 !important;
          }
        }
      `}</style>
      <div className="relative iphone-carousel-wrapper">
        {/* iPhone Frame - Simplified 3D */}
        <motion.div
          {...{ className: "relative w-[280px] h-[560px] xl:w-[340px] xl:h-[680px] 2xl:w-[380px] 2xl:h-[760px]" } as any}
        >
        {/* iPhone shadow - Static and simple */}
        <div
          className="absolute inset-0 bg-black/30 rounded-[3rem] blur-2xl"
          style={{ 
            transform: 'translateY(20px)',
          }}
        />
        
        {/* iPhone body */}
        <div className="relative w-full h-full bg-black rounded-[3rem] xl:rounded-[3.5rem] 2xl:rounded-[4rem] shadow-2xl border-8 xl:border-10 2xl:border-12 border-gray-800">
          {/* Screen container with overflow hidden */}
          <div className="absolute inset-4 xl:inset-5 2xl:inset-6 rounded-[2rem] xl:rounded-[2.5rem] 2xl:rounded-[3rem] overflow-hidden bg-black group">
            {/* Touch/Click area for swipe */}
            <div 
              className="absolute inset-0 z-20"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                      goToPrevious();
                    } else {
                      goToNext();
                    }
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  }
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const deltaX = moveEvent.touches[0].clientX - startX;
                  if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                      goToPrevious();
                    } else {
                      goToNext();
                    }
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                  }
                };
                const handleTouchEnd = () => {
                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
              }}
            />
            
            {/* Images container */}
            <div
              className="flex h-full"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isTransitioning ? 'transform 300ms ease-in-out' : 'none'
              }}
            >
              {/* All images including clones */}
              {extendedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full h-full flex-shrink-0"
                >
                  <Image
                    src={image.src}
                    alt={image.title}
                    fill
                    className="object-cover"
                    priority={index === 1}
                    loading={index === 1 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ))}
            </div>
            
            {/* Navigation arrows - visible on hover */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 xl:left-6 2xl:left-8 top-1/2 -translate-y-1/2 w-8 h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 xl:right-6 2xl:right-8 top-1/2 -translate-y-1/2 w-8 h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
          </div>
          
          
          {/* Home indicator */}
          <div className="absolute bottom-2 xl:bottom-3 2xl:bottom-4 left-1/2 -translate-x-1/2 w-32 xl:w-40 2xl:w-48 h-1 xl:h-1.5 2xl:h-2 bg-white/30 rounded-full"></div>
        </div>
        
        {/* App info floating card - Siempre visible */}
        <motion.div
          {...{ className: "absolute -right-16 xl:-right-20 2xl:-right-24 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl xl:rounded-2xl p-4 xl:p-6 2xl:p-8 min-w-48 xl:min-w-64 2xl:min-w-80" } as any}
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: 1,
            x: 0,
            scale: 1
          }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h4 className="text-white font-semibold text-lg xl:text-xl 2xl:text-2xl mb-1 xl:mb-2">
            {images[(currentIndex - 1 + images.length) % images.length].title}
          </h4>
          <p className="text-gray-400 text-sm xl:text-base 2xl:text-lg">
            {images[(currentIndex - 1 + images.length) % images.length].description}
          </p>
          
          {/* Progress indicators - Clickable */}
          <div className="flex gap-1 xl:gap-1.5 2xl:gap-2 mt-3 xl:mt-4 2xl:mt-5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 xl:h-1.5 2xl:h-2 rounded-full transition-all ${
                  index === (currentIndex - 1 + images.length) % images.length 
                    ? 'bg-orange-400 w-6 xl:w-8 2xl:w-10' 
                    : 'bg-white/20 w-2 xl:w-3 2xl:w-4 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Floating elements around the phone - GLOWUP VERSION */}
      
      {/* Rocket Badge - Más moderno */}
      <motion.div
        {...{ className: "absolute -top-8 -left-8" } as any}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-md opacity-60"></div>
          
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
        {...{ className: "absolute -bottom-8 -right-8" } as any}
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
    </>
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

  // Sin cambio de opacidad - siempre visibles
  return (
    <div 
      className="absolute top-0 left-0 w-full h-[400vh] pointer-events-none z-0 overflow-hidden"
    >
      {/* Orbes del inicio - visibles inmediatamente con posiciones absolutas */}
      
      {/* Orbe Hero 1 - Arriba izquierda */}
      <motion.div
        {...{ className: "absolute w-32 h-32 bg-gradient-to-r from-purple-400/25 to-blue-500/25 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 1.5, ease: "easeOut" }}
        style={{
          top: '100px',
          left: '10%',
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Orbe Hero 2 - Arriba derecha */}
      <motion.div
        {...{ className: "absolute w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.6, delay: 1.8, ease: "easeOut" }}
        style={{
          top: '200px',
          right: '15%',
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      />
      
      {/* Orbe Hero 3 - Centro alto */}
      <motion.div
        {...{ className: "absolute w-28 h-28 bg-gradient-to-r from-green-400/20 to-teal-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, delay: 1.6, ease: "easeOut" }}
        style={{
          top: '150px',
          left: '45%',
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />
      
      {/* Orbe Hero 4 - Medio izquierda */}
      <motion.div
        {...{ className: "absolute w-20 h-20 bg-gradient-to-r from-amber-400/25 to-yellow-500/25 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.7, delay: 2.0, ease: "easeOut" }}
        style={{
          top: '350px',
          left: '25%',
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Orbe Hero 5 - Medio derecha */}
      <motion.div
        {...{ className: "absolute w-16 h-16 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.8, delay: 2.2, ease: "easeOut" }}
        style={{
          top: '400px',
          right: '30%',
          transform: `translateY(${scrollY * 0.35}px)`,
        }}
      />
      
      {/* Orbe 1 - Parte superior */}
      <motion.div
        {...{ className: "absolute top-[10%] left-[20%] w-32 h-32 bg-gradient-to-r from-orange-400/20 to-purple-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.0, delay: 1.2, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Orbe 2 - Parte superior derecha */}
      <motion.div
        {...{ className: "absolute top-[25%] right-[15%] w-24 h-24 bg-gradient-to-r from-green-400/15 to-blue-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, delay: 1.5, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Orbe 3 - Parte media */}
      <motion.div
        {...{ className: "absolute top-[40%] right-[25%] w-16 h-16 bg-gradient-to-r from-purple-400/25 to-pink-500/25 rounded-full blur-lg" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, delay: 1.8, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.7}px)`,
        }}
      />
      
      {/* Orbe 4 - Parte media izquierda */}
      <motion.div
        {...{ className: "absolute top-[35%] left-[10%] w-20 h-20 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 1.1, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />
      
      {/* Orbe 5 - Parte media-baja */}
      <motion.div
        {...{ className: "absolute top-[55%] left-[30%] w-28 h-28 bg-gradient-to-r from-yellow-400/15 to-orange-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.3, delay: 1.4, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.6}px)`,
        }}
      />
      
      {/* Orbe 6 - Parte media derecha */}
      <motion.div
        {...{ className: "absolute top-[50%] right-[20%] w-12 h-12 bg-gradient-to-r from-pink-400/30 to-red-500/30 rounded-full blur-lg" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.9, delay: 1.7, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.8}px)`,
        }}
      />
      
      {/* Orbes adicionales para cubrir más área */}
      
      {/* Orbe 7 - Parte baja */}
      <motion.div
        {...{ className: "absolute top-[70%] left-[40%] w-36 h-36 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.1, delay: 1.3, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      />
      
      {/* Orbe 8 - Parte baja derecha */}
      <motion.div
        {...{ className: "absolute top-[65%] right-[10%] w-20 h-20 bg-gradient-to-r from-teal-400/20 to-green-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, delay: 1.6, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Orbe 9 - Parte muy baja */}
      <motion.div
        {...{ className: "absolute top-[80%] left-[15%] w-24 h-24 bg-gradient-to-r from-rose-400/20 to-pink-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, delay: 1.9, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Orbe 10 - Parte final */}
      <motion.div
        {...{ className: "absolute top-[90%] right-[30%] w-32 h-32 bg-gradient-to-r from-amber-400/15 to-orange-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.0, delay: 1.5, ease: "easeOut" }}
        style={{
          transform: `translateY(${scrollY * 0.6}px)`,
        }}
      />
      
      {/* Orbes adicionales para cubrir hasta el final de la página */}
      
      {/* Orbe 11 - Sección Features */}
      <motion.div
        {...{ className: "absolute w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.3, delay: 1.2, ease: "easeOut" }}
        style={{
          top: '110%',
          left: '20%',
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Orbe 12 - Sección Features derecha */}
      <motion.div
        {...{ className: "absolute w-28 h-28 bg-gradient-to-r from-green-400/15 to-emerald-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.1, delay: 1.4, ease: "easeOut" }}
        style={{
          top: '120%',
          right: '25%',
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      />
      
      {/* Orbe 13 - Mitad inferior */}
      <motion.div
        {...{ className: "absolute w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 1.6, ease: "easeOut" }}
        style={{
          top: '140%',
          left: '50%',
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />
      
      {/* Orbe 14 - Zona baja izquierda */}
      <motion.div
        {...{ className: "absolute w-24 h-24 bg-gradient-to-r from-orange-400/25 to-red-500/25 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, delay: 1.8, ease: "easeOut" }}
        style={{
          top: '160%',
          left: '15%',
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Orbe 15 - Zona baja derecha */}
      <motion.div
        {...{ className: "absolute w-36 h-36 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, delay: 2.0, ease: "easeOut" }}
        style={{
          top: '180%',
          right: '20%',
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Orbe 16 - Zona muy baja */}
      <motion.div
        {...{ className: "absolute w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.0, delay: 1.5, ease: "easeOut" }}
        style={{
          top: '200%',
          left: '40%',
          transform: `translateY(${scrollY * 0.6}px)`,
        }}
      />
      
      {/* Orbe 17 - Casi al final */}
      <motion.div
        {...{ className: "absolute w-28 h-28 bg-gradient-to-r from-teal-400/20 to-green-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.3, delay: 1.7, ease: "easeOut" }}
        style={{
          top: '220%',
          right: '35%',
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      />
      
      {/* Orbe 18 - Zona inferior extrema */}
      <motion.div
        {...{ className: "absolute w-32 h-32 bg-gradient-to-r from-pink-400/15 to-rose-500/15 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 1.9, ease: "easeOut" }}
        style={{
          top: '240%',
          left: '25%',
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />
      
      {/* Orbe 19 - Zona final */}
      <motion.div
        {...{ className: "absolute w-40 h-40 bg-gradient-to-r from-purple-400/10 to-violet-500/10 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, delay: 1.6, ease: "easeOut" }}
        style={{
          top: '260%',
          right: '15%',
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Orbe 20 - Último orbe */}
      <motion.div
        {...{ className: "absolute w-24 h-24 bg-gradient-to-r from-orange-400/20 to-yellow-500/20 rounded-full blur-xl" } as any}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.0, delay: 2.0, ease: "easeOut" }}
        style={{
          top: '280%',
          left: '60%',
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // Optimización para el carousel durante el scroll
  useEffect(() => {
    if (!isMobile) { // Solo en desktop
      let scrollTimeout: NodeJS.Timeout;
      
      const handleScroll = () => {
        document.body.classList.add('is-scrolling');
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          document.body.classList.remove('is-scrolling');
        }, 150);
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [isMobile]);

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

      // Feature cards stagger animation - DISABLED FOR PERFORMANCE
      /*
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
      */
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

      <div className="bg-grid-background text-white overflow-x-hidden"
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
          
          /* Carousel scroll optimization */
          .carousel-container {
            will-change: auto;
          }
          
          body.is-scrolling .carousel-container {
            pointer-events: none !important;
          }
          
          body.is-scrolling .carousel-container * {
            pointer-events: none !important;
            transition: none !important;
            animation-play-state: paused !important;
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
            . {
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
        <section className="hero-section relative flex items-start justify-center pt-4 md:pt-6 xl:pt-8 2xl:pt-10 pb-20 md:pb-24 xl:pb-32 2xl:pb-40">
          <div className="hero-bg absolute inset-0 z-0">
          </div>

          <div className="container mx-auto px-4 xl:px-8 2xl:px-16 z-10">
            <div className="grid lg:grid-cols-2 gap-8 xl:gap-16 2xl:gap-32 items-start max-w-6xl xl:max-w-7xl 2xl:max-w-[110rem] mx-auto">
              
              {/* Text Content - Izquierda */}
              <div className="text-center lg:text-left pt-8 md:pt-12 lg:pt-16">
                <motion.h1
                  {...{ className: "text-3xl md:text-4xl lg:text-5xl xl:text-7xl 2xl:text-8xl font-bold font-manrope mb-6 xl:mb-10 2xl:mb-14 leading-tight" } as any}
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
                  {...{ className: "inline-flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 xl:px-8 xl:py-4 2xl:px-10 2xl:py-5 mb-8 xl:mb-12 2xl:mb-14" } as any}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-2 h-2 xl:w-3 xl:h-3 rounded-full " 
                       style={{ backgroundColor: 'var(--secondary)' }} />
                  <span className="text-sm xl:text-lg 2xl:text-xl">🔥 +1,200 creadores ya automatizando</span>
                </motion.div>

                <motion.p
                  {...{ className: "text-lg md:text-xl xl:text-3xl 2xl:text-4xl text-gray-300 mb-10 xl:mb-16 2xl:mb-20 max-w-2xl lg:max-w-none" } as any}
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
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 "></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                      
                      <Button size="lg" className="relative h-12 md:h-14 xl:h-16 2xl:h-20 px-6 md:px-10 xl:px-14 2xl:px-18 text-base md:text-lg xl:text-xl 2xl:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 transition-all duration-300 shadow-2xl">
                        Empieza GRATIS
                        <ArrowRightIcon className="ml-2 md:ml-3 xl:ml-4 h-4 md:h-5 xl:h-6 2xl:h-7 w-4 md:w-5 xl:w-6 2xl:w-7 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="h-12 md:h-14 xl:h-16 2xl:h-20 px-6 md:px-10 xl:px-14 2xl:px-18 text-base md:text-lg xl:text-xl 2xl:text-2xl font-black border-2 hover:border-white/50 transition-all duration-300">
                      Ver precios
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* 3D iPhone Carousel - Derecha */}
              <div className="flex justify-center lg:justify-end mt-8 lg:mt-0 lg:pt-16">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  {...{ className: "relative carousel-container xl:scale-100 2xl:scale-110" } as any}
                  style={{ perspective: '1000px' }}
                >
                  <AppCarousel3D />
                </motion.div>
              </div>

            </div>
          </div>

        </section>

        {/* Social Proof Bar - Section 2 - GLOW UP VERSION */}
        <section className="relative py-12 md:py-16">
          {/* Epic background effects - Optimized for mobile */}
          {!isMobile ? (
            <div className="absolute -top-64 -bottom-96 left-0 right-0 pointer-events-none">
              {/* Animated gradient orbs - Even larger and more diffused */}
              <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-[150px] " />
              <div className="absolute top-1/2 right-1/4 w-[800px] h-[800px] bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-[150px] " style={{ animationDelay: '1s' }} />
              
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
                  <div className="absolute inset-0 blur-2xl md:blur-xl bg-gradient-to-r from-orange-400/20 to-purple-400/20 md:from-orange-400/40 md:to-purple-400/40 -z-10" />
                  
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
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-xl opacity-30"></div>
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
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full blur-xl opacity-30"></div>
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
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-xl opacity-30"></div>
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
                        <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-xl opacity-30"></div>
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
                      <div className="absolute -inset-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-xl opacity-5 group-hover:opacity-15 transition-opacity duration-900" style={{ willChange: 'auto' }}></div>
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
                        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full opacity-60 "></div>
                        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-emerald-400 rounded-full opacity-60 " style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-green-300 rounded-full opacity-60 " style={{ animationDelay: '2s' }}></div>
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
                      <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl blur-xl opacity-5 group-hover:opacity-15 transition-opacity duration-900" style={{ willChange: 'auto' }}></div>
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
                        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-60 "></div>
                        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-60 " style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-yellow-300 rounded-full opacity-60 " style={{ animationDelay: '2s' }}></div>
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
                      <div className="absolute -inset-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-xl opacity-5 group-hover:opacity-15 transition-opacity duration-900" style={{ willChange: 'auto' }}></div>
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
                              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full "></div>
                              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full " style={{ animationDelay: '0.5s' }}></div>
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

        {/* Features Section - Las 4 herramientas principales */}
        <section className="relative py-32 overflow-hidden">
          {/* Fondo con gradient mesh sutil */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-[200px]"></div>
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-[200px]"></div>
            
            {/* Orbes flotantes para la sección Features */}
            <motion.div
              {...{ className: "absolute top-20 left-[10%] w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl" } as any}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.0, delay: 0.5, ease: "easeOut" }}
            />
            
            <motion.div
              {...{ className: "absolute top-40 right-[15%] w-24 h-24 bg-gradient-to-r from-orange-400/15 to-red-500/15 rounded-full blur-xl" } as any}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.2, delay: 0.7, ease: "easeOut" }}
            />
            
            <motion.div
              {...{ className: "absolute bottom-32 left-[25%] w-36 h-36 bg-gradient-to-r from-green-400/15 to-emerald-500/15 rounded-full blur-xl" } as any}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.4, delay: 0.9, ease: "easeOut" }}
            />
            
            <motion.div
              {...{ className: "absolute bottom-20 right-[30%] w-28 h-28 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-xl" } as any}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.1, delay: 1.1, ease: "easeOut" }}
            />
            
            <motion.div
              {...{ className: "absolute top-[50%] left-[50%] w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-lg" } as any}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, delay: 1.3, ease: "easeOut" }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              {...{ className: "max-w-7xl mx-auto" } as any}
            >
              {/* Header de la sección */}
              <motion.div 
                {...{ className: "text-center mb-20" } as any}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ 
                  once: true,
                  amount: 0.3 
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut"
                }}
              >
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 leading-tight">
                  4 herramientas que <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">multiplican tus ventas</span>
                </h2>
                <p className="text-xl sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Todo integrado, todo automático, todo en una plataforma
                </p>
              </motion.div>

              {/* Grid de features 2x2 */}
              <div className="grid grid-cols-2 gap-4 sm:gap-4 md:gap-6 max-w-3xl mx-auto features-grid">
                
                {/* Feature 1: DM Automation */}
                <motion.div
                  {...{ className: "relative group feature-card" } as any}
                >
                  <div className="group relative aspect-square rounded-[2.5rem] overflow-hidden   bg-gradient-to-br from-black via-purple-950 to-black shadow-2xl  ring-4 ring-purple-500/40  border border-purple-400/20">
                    {/* Epic glow effect */}
                    <div className="absolute inset-0 opacity-0 ">
                      <div className="absolute inset-[-20px] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 blur-xl opacity-60 " />
                    </div>
                    
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 " />
                    
                    {/* Decorative circles with animation */}
                    <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-purple-500/30  " />
                    <div className="absolute bottom-12 left-6 w-10 h-10 rounded-full bg-purple-800/40  " />
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-yellow-400/50 " />
                    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-yellow-400/40  animation-delay-200" />
                    
                    {/* Content */}
                    <div className="relative h-full p-4 sm:p-6 flex flex-col items-center text-white z-10 overflow-hidden">
                      {/* Background Icon with blur */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40  z-0">
                        <div className="relative">
                          <div className="absolute inset-0 blur-xl">
                            <BoltIcon className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-300" />
                          </div>
                          <BoltIcon className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)] relative z-10 " />
                        </div>
                      </div>
                      
                      {/* Title and description */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center z-10 px-4">
                        <h3 className="text-lg sm:text-xl font-black mb-2 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,1)] filter brightness-110 tracking-tight">AUTOMATIZACIONES</h3>
                        <p className="text-sm sm:text-base text-white leading-relaxed font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          Respuestas automáticas inteligentes para Instagram
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 2: Captions */}
                <motion.div
                  {...{ className: "relative group feature-card" } as any}
                >
                  <div className="group relative aspect-square rounded-[2.5rem] overflow-hidden   bg-gradient-to-br from-black via-teal-950 to-black shadow-2xl  ring-4 ring-teal-500/40  border border-teal-400/20">
                    {/* Epic glow effect */}
                    <div className="absolute inset-0 opacity-0 ">
                      <div className="absolute inset-[-20px] bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 blur-xl opacity-60 " />
                    </div>
                    
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 " />
                    
                    {/* Decorative circles with animation */}
                    <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-teal-500/30  " />
                    <div className="absolute bottom-12 left-6 w-10 h-10 rounded-full bg-teal-800/40  " />
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-yellow-400/50 " />
                    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-yellow-400/40  animation-delay-200" />
                    
                    {/* Content */}
                    <div className="relative h-full p-4 sm:p-6 flex flex-col items-center text-white z-10 overflow-hidden">
                      {/* Background Icon with blur */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40  z-0">
                        <div className="relative">
                          <div className="absolute inset-0 blur-xl">
                            <DocumentTextIcon className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-300" />
                          </div>
                          <DocumentTextIcon className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)] relative z-10 " />
                        </div>
                      </div>
                      
                      {/* Title and description */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center z-10 px-4">
                        <h3 className="text-lg sm:text-xl font-black mb-2 bg-gradient-to-r from-white via-teal-200 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,1)] filter brightness-110 tracking-tight">AI CAPTIONS</h3>
                        <p className="text-sm sm:text-base text-white leading-relaxed font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          Genera las descripciones de tus videos con IA
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 3: URL Shortener */}
                <motion.div
                  {...{ className: "relative group feature-card" } as any}
                >
                  <div className="group relative aspect-square rounded-[2.5rem] overflow-hidden   bg-gradient-to-br from-black via-red-950 to-black shadow-2xl  ring-4 ring-orange-500/40  border border-orange-400/20">
                    {/* Epic glow effect */}
                    <div className="absolute inset-0 opacity-0 ">
                      <div className="absolute inset-[-20px] bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 blur-xl opacity-60 " />
                    </div>
                    
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 " />
                    
                    {/* Decorative circles with animation */}
                    <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-orange-500/30  " />
                    <div className="absolute bottom-12 left-6 w-10 h-10 rounded-full bg-red-800/40  " />
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-yellow-400/50 " />
                    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-yellow-400/40  animation-delay-200" />
                    
                    {/* Content */}
                    <div className="relative h-full p-4 sm:p-6 flex flex-col items-center text-white z-10 overflow-hidden">
                      {/* Background Icon with blur */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40  z-0">
                        <div className="relative">
                          <div className="absolute inset-0 blur-xl">
                            <LinkIcon className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-300" />
                          </div>
                          <LinkIcon className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)] relative z-10 " />
                        </div>
                      </div>
                      
                      {/* Title and description */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center z-10 px-4">
                        <h3 className="text-lg sm:text-xl font-black mb-2 bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,1)] filter brightness-110 tracking-tight">URLs CORTAS</h3>
                        <p className="text-sm sm:text-base text-white leading-relaxed font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          Acorta enlaces y analiza clics en tiempo real
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 4: Mi Landing */}
                <motion.div
                  {...{ className: "relative group feature-card" } as any}
                >
                  <div className="group relative aspect-square rounded-[2.5rem] overflow-hidden   bg-gradient-to-br from-black via-indigo-950 to-black shadow-2xl  ring-4 ring-blue-500/40  border border-blue-400/20">
                    {/* Epic glow effect */}
                    <div className="absolute inset-0 opacity-0 ">
                      <div className="absolute inset-[-20px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 blur-xl opacity-60 " />
                    </div>
                    
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 " />
                    
                    {/* Decorative circles with animation */}
                    <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-blue-500/30  " />
                    <div className="absolute bottom-12 left-6 w-10 h-10 rounded-full bg-indigo-800/40  " />
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-yellow-400/50 " />
                    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-yellow-400/40  animation-delay-200" />
                    
                    {/* Content */}
                    <div className="relative h-full p-4 sm:p-6 flex flex-col items-center text-white z-10 overflow-hidden">
                      {/* Background Icon with blur */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40  z-0">
                        <div className="relative">
                          <div className="absolute inset-0 blur-xl">
                            <Settings className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-300" />
                          </div>
                          <Settings className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)] relative z-10 " />
                        </div>
                      </div>
                      
                      {/* Title and description */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center z-10 px-4">
                        <h3 className="text-lg sm:text-xl font-black mb-2 bg-gradient-to-r from-white via-blue-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,1)] filter brightness-110 tracking-tight">MI LANDING</h3>
                        <p className="text-sm sm:text-base text-white leading-relaxed font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          Crea tu página personal con diseño único
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* CTA al final de features */}
              <motion.div 
                {...{ className: "text-center mt-20" } as any}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <Link href="/register">
                  <motion.div
                    {...{ className: "inline-block relative group" } as any}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 "></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                    
                    <Button size="lg" className="relative h-12 md:h-16 px-4 sm:px-6 md:px-12 text-sm sm:text-base md:text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 transition-all duration-300 shadow-2xl">
                      Activa todas las herramientas GRATIS
                      <ArrowRightIcon className="ml-2 md:ml-3 h-4 md:h-6 w-4 md:w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <p className="text-sm text-gray-400 mt-4">
                  Sin tarjeta de crédito • Cancela cuando quieras
                </p>
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
              <div className={`absolute -top-[200px] left-1/4 w-[1000px] h-[1000px] bg-red-400/50 rounded-full ${isMobile ? 'blur-[150px]' : 'blur-[300px]'} opacity-[0.005]`} style={{ willChange: 'auto' }}></div>
              <div className={`absolute -top-[200px] right-1/4 w-[1000px] h-[1000px] bg-orange-400/50 rounded-full ${isMobile ? 'blur-[150px]' : 'blur-[300px]'} opacity-[0.005]`} style={{ willChange: 'auto' }}></div>
              
              {/* Capa de transición suave adicional */}
              <div className="absolute -top-[400px] left-0 right-0 h-[600px] bg-gradient-to-b from-transparent via-transparent to-black/[0.01]"></div>
            </div>
            
            
            {/* Grid pattern overlay con fade muy suave - DISABLED ON MOBILE */}
            {!isMobile && (
              <div className="absolute inset-0 opacity-5"
                   style={{
                     backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                     backgroundSize: '50px 50px',
                     maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1), transparent 70%)',
                     WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1), transparent 70%)'
                   }}
              />
            )}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              {...{ className: "max-w-6xl mx-auto" } as any}
            >
              {/* Título épico con animación */}
              <motion.div 
                {...{ className: "text-center mb-20" } as any}
              >
                <motion.h2 
                  {...{ className: "text-5xl md:text-7xl font-black mb-6 leading-tight" } as any}
                >
                  El 93% de creadores <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">fracasa</span>
                  <br />
                  <span className="text-3xl md:text-5xl text-gray-400">por hacer TODO manual</span>
                </motion.h2>
                
                <motion.p 
                  {...{ className: "text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto" } as any}
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
                  transition={{ duration: 0.5 }}
                  whileHover={isMobile ? {} : { scale: 1.01 }}
                >
                  {/* Multi-layer glow effect - OPTIMIZED */}
                  {!isMobile && (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur-md opacity-20 group-hover:opacity-30 transition duration-500"></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-700"></div>
                    </>
                  )}
                  
                  {/* Efecto de fuego animado */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-red-600/20 via-orange-500/10 to-transparent opacity-50" />
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-gray-950 via-red-950/90 to-gray-950 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-red-500/40 overflow-hidden h-full flex flex-col">
                    {/* Header con efecto de llamas */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                      <motion.div 
                        {...{ className: "relative w-14 h-14" } as any}
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
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, duration: 0.4 }}
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
                  transition={{ duration: 0.5 }}
                  whileHover={isMobile ? {} : { scale: 1.01 }}
                >
                  {/* Multi-layer glow effect - OPTIMIZED */}
                  {!isMobile && (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-md opacity-25 group-hover:opacity-35 transition duration-500"></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-25 transition duration-700"></div>
                    </>
                  )}
                  
                  {/* Efecto de aurora boreal */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute -top-10 left-0 right-0 h-40 bg-gradient-to-b from-green-400/20 via-emerald-300/10 to-transparent opacity-30" />
                    {/* Partículas de éxito - DISABLED FOR PERFORMANCE */}
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-gray-950 via-green-950/90 to-gray-950 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-green-500/40 overflow-hidden h-full flex flex-col">
                    {/* Header con efecto celestial */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                      <motion.div 
                        {...{ className: "relative w-14 h-14" } as any}
                        animate={isMobile ? {} : { 
                          rotate: [0, -5, 5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={isMobile ? {} : { duration: 4, repeat: Infinity }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/50"></div>
                        <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <CheckIcon className={`h-7 w-7 text-white ${isMobile ? '' : 'drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`} />
                        </div>
                        {/* Sparkle effect - DISABLED FOR PERFORMANCE */}
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
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, duration: 0.4 }}
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
                          animate={isMobile ? {} : { 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={isMobile ? {} : { duration: 4, repeat: Infinity }}
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 "></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                    
                    <Button size="lg" className="relative h-12 md:h-16 px-4 sm:px-6 md:px-12 text-sm sm:text-base md:text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 transition-all duration-300 shadow-2xl">
                      Automatiza AHORA (gratis)
                      <ArrowRightIcon className="ml-2 md:ml-3 h-4 md:h-6 w-4 md:w-6 group-hover:translate-x-2 transition-transform" />
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

        {/* Testimonials Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              {...{ className: "text-center mb-20" } as any}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Lo que dicen los <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">creadores exitosos</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Miles de creadores ya están automatizando su Instagram y multiplicando sus ventas
              </p>
            </motion.div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Testimonial 1 - Chef */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                {...{ className: "relative" } as any}
              >
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-400">
                      <Image
                        src="/images/testimonials/influ1_chef.png"
                        alt="Chef García"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">@chef.garcia92</h4>
                      <p className="text-gray-400 text-sm">Chef & Food Creator</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    "Al principio era escéptico, pero después de 3 meses usando Creator0x... madre mía. Antes perdía ventas por no responder rápido los DMs. Ahora todo está automatizado y personalizado. Lo mejor: más tiempo para crear contenido de calidad."
                  </p>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-400">
                      <span className="text-green-400 font-semibold">De 8 a 31</span> alumnos en mis cursos mensuales
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 - Fitness Trainer */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                {...{ className: "relative" } as any}
              >
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400">
                      <Image
                        src="/images/testimonials/influ2_train.png"
                        alt="Coach Martín"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">@martinfit_pro</h4>
                      <p className="text-gray-400 text-sm">Personal Trainer</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    "Llevo 6 meses con Creator0x. Los DMs automáticos filtran quien realmente quiere entrenar. La landing con mis planes y horarios funciona 24/7. Y los shortlinks me dicen qué contenido convierte mejor. Herramienta imprescindible si vas en serio con esto."
                  </p>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-400">
                      <span className="text-green-400 font-semibold">87%</span> menos tiempo perdido con consultas básicas
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 3 - Mom Influencer */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                {...{ className: "relative md:col-span-2 lg:col-span-1" } as any}
              >
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-400">
                      <Image
                        src="/images/testimonials/influ3_mom.png"
                        alt="Sofia Lifestyle"
                        width={64}
                        height={64}
                        className="object-cover object-center"
                        style={{ objectPosition: '50% 30%' }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">@sofi_vidasana</h4>
                      <p className="text-gray-400 text-sm">Mom Blogger</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    "Tengo 2 peques y mi tiempo es súper limitado. Creator0x me salva la vida literal. Los captions con IA mantienen mi feed activo, los DMs se responden solos (y bien!) y mi landing tiene todos mis links de afiliados organizados. Ojalá lo hubiera descubierto antes."
                  </p>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-400">
                      <span className="text-green-400 font-semibold">3h diarias</span> que ahora dedico a mi familia
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section - EPIC DESIGN */}
        <section className="relative py-32 overflow-hidden">
          {/* Epic background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
          
          {/* Animated orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              {...{ className: "text-center mb-20" } as any}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                {...{ className: "inline-block mb-6" } as any}
              >
                <span className="text-sm font-medium text-purple-400 bg-purple-400/10 px-4 py-2 rounded-full">
                  💎 PRICING SIMPLE Y TRANSPARENTE
                </span>
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Elige tu plan y <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">escala sin límites</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Empieza gratis y crece a tu ritmo. Sin permanencia, cancela cuando quieras.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                {...{ className: "relative" } as any}
              >
                <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  {/* Popular badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-400 to-teal-400 text-black text-sm font-bold px-4 py-1 rounded-full">
                      EMPIEZA AQUÍ
                    </span>
                  </div>
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Starter</h3>
                    <p className="text-gray-400 mb-6">Perfecto para empezar y probar</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">€0</span>
                      <span className="text-gray-400">/mes</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>50 DMs</strong> automáticos/mes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>1 Landing page</strong> personalizada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>5 Shortlinks</strong> con analytics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>10 Captions</strong> con IA/mes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Soporte por email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XMarkIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 line-through">Automatizaciones avanzadas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XMarkIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 line-through">Múltiples cuentas</span>
                    </li>
                  </ul>

                  <Link href="/register">
                    <Button 
                      className="w-full h-12 text-base font-bold bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
                    >
                      Empieza gratis ahora
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                {...{ className: "relative" } as any}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 blur-xl" />
                
                <div className="relative bg-gradient-to-br from-purple-900/40 to-orange-900/40 backdrop-blur-sm border-2 border-transparent bg-clip-padding rounded-3xl p-8 h-full"
                     style={{ 
                       backgroundImage: `
                         linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), rgba(249, 115, 22, 0.2)),
                         linear-gradient(to bottom right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8))
                       `,
                       backgroundOrigin: 'border-box',
                       backgroundClip: 'padding-box, border-box',
                       borderImage: 'linear-gradient(to bottom right, #f97316, #a855f7) 1'
                     }}>
                  
                  {/* Best value badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full animate-pulse">
                      🚀 MÁS POPULAR
                    </span>
                  </div>
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                      Creator Pro
                    </h3>
                    <p className="text-gray-300 mb-6">Para creadores que van en serio</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                        €29
                      </span>
                      <span className="text-gray-400">/mes</span>
                    </div>
                    <p className="text-sm text-green-400 mt-2">Ahorra €120/año pagando anual</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>DMs ilimitados</strong> con IA avanzada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Landing pages ilimitadas</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Shortlinks ilimitados</strong> + analytics pro</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Captions ilimitados</strong> con IA</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Automatizaciones avanzadas</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>3 cuentas</strong> de Instagram</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Soporte prioritario</strong> 24/7</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <SparklesIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Early access</strong> a nuevas features</span>
                    </li>
                  </ul>

                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-400 hover:to-purple-400 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                      >
                        Empieza prueba de 14 días
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Business Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                {...{ className: "relative" } as any}
              >
                <div className="relative bg-black/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  {/* Enterprise badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                      🏢 PARA AGENCIAS
                    </span>
                  </div>
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Business</h3>
                    <p className="text-gray-400 mb-6">Para agencias y equipos</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">€79</span>
                      <span className="text-gray-400">/mes</span>
                    </div>
                    <p className="text-sm text-green-400 mt-2">Ahorra €350/año pagando anual</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Todo del plan Pro</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>10 cuentas</strong> de Instagram</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Team collaboration</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>API access</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>White label</strong> disponible</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Account manager</strong> dedicado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Training</strong> personalizado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300"><strong>Custom integrations</strong></span>
                    </li>
                  </ul>

                  <Link href="/contact">
                    <Button 
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white transition-all duration-300"
                    >
                      Contactar ventas
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              {...{ className: "flex flex-wrap items-center justify-center gap-8 mt-16 text-sm text-gray-400" } as any}
            >
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span>Sin permanencia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span>Cancela cuando quieras</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span>Pago 100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span>Factura disponible</span>
              </div>
            </motion.div>

            {/* Enterprise CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              {...{ className: "text-center mt-16 p-8 bg-black/20 rounded-2xl border border-white/10" } as any}
            >
              <h3 className="text-2xl font-bold mb-2">¿Necesitas más?</h3>
              <p className="text-gray-400 mb-4">
                Planes personalizados para agencias y equipos grandes con necesidades especiales
              </p>
              <Link href="/contact">
                <Button variant="outline" className="border-white/20 hover:border-white/40">
                  Contacta con ventas
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="relative py-32 overflow-hidden bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              {...{ className: "text-center mb-20" } as any}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Empieza en <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">3 simples pasos</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Configura tu automatización en minutos y empieza a vender mientras duermes
              </p>
            </motion.div>

            {/* Steps */}
            <div className="max-w-5xl mx-auto">
              <div className="space-y-24">
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  {...{ className: "grid md:grid-cols-2 gap-8 items-center" } as any}
                >
                  <div className="order-2 md:order-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-purple-400 text-white font-bold text-xl mb-6">
                      1
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Conecta tu Instagram</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Conecta tu cuenta Business de Instagram en un click. Totalmente seguro con la API oficial de Meta. Sin contraseñas ni accesos extraños.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Conexión segura con OAuth</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Compatible con cuentas Business y Creator</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Desconecta cuando quieras</span>
                      </li>
                    </ul>
                  </div>
                  <div className="order-1 md:order-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-purple-400/20 blur-3xl" />
                      <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                        <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-orange-900/20 rounded-xl flex items-center justify-center">
                          <div className="text-6xl">🔗</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  {...{ className: "grid md:grid-cols-2 gap-8 items-center" } as any}
                >
                  <div className="order-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-purple-400 text-white font-bold text-xl mb-6">
                      2
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Configura tus automatizaciones</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Crea flujos de respuesta personalizados. Define palabras clave, respuestas automáticas y acciones. Tu IA aprende de tu estilo.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Editor visual drag & drop</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Plantillas prediseñadas</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">IA que aprende tu tono</span>
                      </li>
                    </ul>
                  </div>
                  <div className="order-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-orange-400/20 blur-3xl" />
                      <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                        <div className="aspect-video bg-gradient-to-br from-orange-900/20 to-purple-900/20 rounded-xl flex items-center justify-center">
                          <div className="text-6xl">⚡</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  {...{ className: "grid md:grid-cols-2 gap-8 items-center" } as any}
                >
                  <div className="order-2 md:order-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-purple-400 text-white font-bold text-xl mb-6">
                      3
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Relájate y vende más</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Tu asistente IA trabaja 24/7 respondiendo DMs, calificando leads y cerrando ventas. Tú solo enfócate en crear contenido increíble.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Respuestas instantáneas 24/7</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Analytics en tiempo real</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">Notificaciones de ventas</span>
                      </li>
                    </ul>
                  </div>
                  <div className="order-1 md:order-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-teal-400/20 blur-3xl" />
                      <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                        <div className="aspect-video bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-xl flex items-center justify-center">
                          <div className="text-6xl">🚀</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                {...{ className: "text-center mt-20" } as any}
              >
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-400 hover:to-purple-400 text-white font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    Empieza ahora - Es GRATIS
                    <ArrowRightIcon className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                <p className="text-gray-400 text-sm mt-4">No necesitas tarjeta de crédito</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              {...{ className: "text-center mb-20" } as any}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Preguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">frecuentes</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Todo lo que necesitas saber para empezar a automatizar tu Instagram
              </p>
            </motion.div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto space-y-4">
              {[
                {
                  question: "¿Cómo funciona la automatización de DMs?",
                  answer: "Nuestra IA analiza los mensajes que recibes y responde automáticamente basándose en tus configuraciones personalizadas. Puedes crear flujos de respuesta, palabras clave y respuestas predefinidas. Todo 100% seguro y sin violar las políticas de Instagram."
                },
                {
                  question: "¿Es seguro para mi cuenta de Instagram?",
                  answer: "Totalmente seguro. Usamos la API oficial de Instagram Business y cumplimos todas sus políticas. No hacemos spam ni acciones masivas. Tu cuenta está protegida y mantienes el control total sobre todas las automatizaciones."
                },
                {
                  question: "¿Puedo personalizar mi landing page?",
                  answer: "¡Por supuesto! Tienes control total sobre el diseño, colores, contenido y estructura. Añade tus links, productos, servicios, testimonios y más. Es tu espacio digital 100% personalizable sin necesidad de saber programar."
                },
                {
                  question: "¿Qué incluye el plan gratuito?",
                  answer: "El plan gratuito incluye: automatización básica de DMs (hasta 50/mes), 1 landing page personalizada, 5 shortlinks con analytics básico y acceso al generador de captions con IA (10/mes). Perfecto para empezar y probar la plataforma."
                },
                {
                  question: "¿Cómo funcionan los shortlinks?",
                  answer: "Crea enlaces cortos personalizados para trackear todos tus clicks. Obtén analytics detallados: ubicación, dispositivo, hora, fuente de tráfico y más. Perfecto para medir el ROI de tus campañas y optimizar tu estrategia."
                },
                {
                  question: "¿Puedo cancelar en cualquier momento?",
                  answer: "Sí, sin compromisos ni permanencia. Puedes cancelar tu suscripción cuando quieras desde tu panel de control. Si cancelas, mantienes el acceso hasta el final del período pagado."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <button
                    onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                    className="w-full text-left bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-semibold pr-4">{faq.question}</h3>
                      <ChevronDownIcon 
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                          activeFAQ === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                    <AnimatePresence>
                      {activeFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-300 mt-4 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* CTA after FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              {...{ className: "text-center mt-16" } as any}
            >
              <p className="text-gray-300 mb-6">¿Tienes más preguntas?</p>
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 text-white font-bold"
                >
                  Prueba gratis y descubre más
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Epic background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-orange-900/20 to-purple-900/20" />
          
          {/* Animated background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              {...{ className: "text-center max-w-4xl mx-auto" } as any}
            >
              {/* Main CTA Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8">
                  ¿Listo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">multiplicar tus ventas</span>?
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                  Únete a miles de creadores que ya están automatizando su Instagram y 
                  vendiendo mientras duermen. Empieza gratis hoy.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                {...{ className: "grid grid-cols-3 gap-8 mb-12" } as any}
              >
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                    1,200+
                  </div>
                  <div className="text-gray-400 mt-2">Creadores activos</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    500K+
                  </div>
                  <div className="text-gray-400 mt-2">DMs respondidos</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                    98%
                  </div>
                  <div className="text-gray-400 mt-2">Satisfacción</div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                {...{ className: "space-y-6" } as any}
              >
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button 
                      size="lg" 
                      className="h-16 px-12 text-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-400 hover:via-pink-400 hover:to-purple-400 text-white font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                    >
                      Empieza GRATIS ahora
                      <ArrowRightIcon className="ml-3 h-6 w-6" />
                    </Button>
                  </motion.div>
                </Link>
                
                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                    <span>Sin tarjeta de crédito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                    <span>Cancela cuando quieras</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                    <span>Soporte 24/7</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>


        <footer className="border-t border-white/10 py-12 bg-black/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Logo and description */}
              <div className="md:col-span-1">
                <h3 className="text-2xl font-bold mb-4">Creator0x</h3>
                <p className="text-gray-400 text-sm">
                  La plataforma todo-en-uno para creadores de contenido que quieren automatizar y escalar.
                </p>
              </div>
              
              {/* Product Links */}
              <div>
                <h4 className="font-semibold mb-4 text-gray-300">Producto</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Características</Link></li>
                  <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Precios</Link></li>
                  <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div>
                <h4 className="font-semibold mb-4 text-gray-300">Soporte</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Centro de ayuda</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacidad</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Términos</Link></li>
                </ul>
              </div>
              
              {/* Social Links */}
              <div>
                <h4 className="font-semibold mb-4 text-gray-300">Síguenos</h4>
                <div className="flex gap-4">
                  <a href="https://instagram.com/creator0x" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <span className="text-2xl">📸</span>
                  </a>
                  <a href="https://twitter.com/creator0x" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <span className="text-2xl">🐦</span>
                  </a>
                  <a href="https://youtube.com/@creator0x" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <span className="text-2xl">📺</span>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
              <p>© 2024 Creator0x. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}