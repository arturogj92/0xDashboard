'use client';

import { useState, useEffect } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePosition({ x, y });
      }}
      style={{ perspective: '2000px' }}
    >
      {/* iPhone Frame */}
      <motion.div
        className="relative"
        style={{ 
          width: '300px', 
          height: '600px',
          transformStyle: 'preserve-3d'
        }}
        animate={{
          rotateY: isHovered ? (mousePosition?.x || 0) * 0.03 : 0,
          rotateX: isHovered ? (mousePosition?.y || 0) * -0.03 : 0,
          scale: isHovered ? 1.05 : 1,
          z: isHovered ? 50 : 0,
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeOut"
        }}
      >
        {/* iPhone shadow - Fija, sin seguir el mouse */}
        <motion.div
          className="absolute inset-0 bg-black/40 rounded-[3rem] blur-2xl"
          style={{ 
            transform: 'translateZ(-100px) translateY(30px)',
            transformStyle: 'preserve-3d'
          }}
          animate={{
            opacity: isHovered ? 0.6 : 0.3,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.4 }}
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
                type: "spring",
                stiffness: 200,
                damping: 35,
                duration: 0.9
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
                className={`h-1 rounded-full transition-all duration-300 ${
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
      
      {/* Status Indicator Dot - Más tech */}
      <motion.div
        className="absolute top-1/4 -right-4 group"
        animate={{
          x: isHovered ? 12 : 0,
          y: isHovered ? -8 : 0,
          scale: isHovered ? 1.3 : 1,
        }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <div className="relative">
          {/* Pulsing ring */}
          <motion.div 
            className="absolute inset-0 w-8 h-8 border-2 border-green-400 rounded-full"
            animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          
          {/* Core dot */}
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
            <motion.div 
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Mouse move handler for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

        {/* Dynamic gradient background matching app colors */}
        <div 
          className="fixed inset-0 opacity-20 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, var(--primary), transparent 50%)`
          }}
        />

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
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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

        {/* Social Proof Bar - Section 2 */}
        <section className="relative py-16 overflow-hidden">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Hook emotivo */}
              <div className="text-center mb-12">
                <motion.h3 
                  className="text-2xl md:text-3xl font-bold mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Mientras tú duermes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">ellos venden</span>
                </motion.h3>
                <motion.p 
                  className="text-gray-300 text-lg"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Números reales de creadores que tomaron acción (y ahora viven de Instagram)
                </motion.p>
              </div>
              
              {/* Metrics Cards con más diseño */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {/* DMs Automatizados */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6 text-center hover:border-orange-400/40 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">2.1M+</div>
                    <div className="text-sm text-gray-300 mb-3">DMs enviados</div>
                    <div className="text-xs text-gray-500">sin spam ni baneos</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-xs">
                      🔥
                    </div>
                  </div>
                </motion.div>
                
                {/* Link Clicks */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 text-center hover:border-purple-400/40 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">847K+</div>
                    <div className="text-sm text-gray-300 mb-3">Clicks en bio</div>
                    <div className="text-xs text-gray-500">32% conversión</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-xs">
                      💎
                    </div>
                  </div>
                </motion.div>
                
                {/* Tiempo Ahorrado */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 text-center hover:border-green-400/40 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">18K+</div>
                    <div className="text-sm text-gray-300 mb-3">Horas ahorradas</div>
                    <div className="text-xs text-gray-500">= 2 años de trabajo</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-xs">
                      ⏰
                    </div>
                  </div>
                </motion.div>
                
                {/* ROI Promedio */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 1.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-black/40 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 text-center hover:border-blue-400/40 transition-all">
                    <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">427%</div>
                    <div className="text-sm text-gray-300 mb-3">ROI promedio</div>
                    <div className="text-xs text-gray-500">en 90 días</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-xs">
                      📈
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Ticker de actividad en tiempo real */}
              <ActivityTicker />
              
              {/* Logos de confianza */}
              <motion.div 
                className="flex flex-wrap justify-center items-center gap-12 mt-10"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                    <CheckIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-sm font-medium text-white">100% compatible</div>
                  <div className="text-xs text-gray-400">con Instagram</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-xl flex items-center justify-center">
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="text-sm font-medium text-white">4.9/5 estrellas</div>
                  <div className="text-xs text-gray-400">+1,200 reviews</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center">
                    <BoltIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-sm font-medium text-white">99.9% uptime</div>
                  <div className="text-xs text-gray-400">garantizado</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Link in Bio Section */}
        <section className="py-20 fade-in-section">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div 
                className="grid lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="lg:order-2">
                  <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    🔗 Link in Bio
                  </div>
                  <h3 className="text-3xl font-bold mb-4">La página que nunca dice "no disponible"</h3>
                  <p className="text-gray-300 mb-6 text-lg">
                    <strong>¿Cuántas ventas has perdido por enlaces rotos o biografías limitadas?</strong> 
                    Tu link-in-bio inteligente se adapta automáticamente, prioriza tus ofertas actuales 
                    y guía a cada visitante hacia la conversión. Como tener un vendedor 24/7.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>🎨 +50 diseños que convierten (probados con A/B testing)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>🧠 IA optimiza orden de enlaces para más ventas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>📈 Heat maps: ve exactamente dónde hacen clic</span>
                    </div>
                  </div>
                </div>
                <div className="lg:order-1 relative">
                  <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-2xl p-6 border border-green-500/20">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-blue-400 mb-3"></div>
                        <div className="font-semibold">@miusuario</div>
                        <div className="text-sm text-gray-400">Creador de contenido ✨</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white/10 rounded-lg p-3 text-center text-sm">🎬 Mis videos</div>
                        <div className="bg-white/10 rounded-lg p-3 text-center text-sm">🛍️ Mi tienda</div>
                        <div className="bg-white/10 rounded-lg p-3 text-center text-sm">📱 Instagram</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
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