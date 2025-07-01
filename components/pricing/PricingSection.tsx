'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon, 
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function PricingSection() {
  return (
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
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            {...{ className: "relative" } as any}
          >
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 pb-24 hover:border-white/20 transition-all duration-300 min-h-[700px]">
              {/* Popular badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1 
                  }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-green-400 blur-xl opacity-50 rounded-full" />
                  
                  {/* Badge */}
                  <div className="relative bg-gradient-to-r from-green-400 to-teal-400 text-black text-sm font-black px-6 py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">👉</span>
                      <span className="uppercase tracking-wider">EMPIEZA AQUÍ</span>
                    </div>
                  </div>
                  
                  {/* Sparkles */}
                  <div className="absolute -top-1 -right-1">
                    <SparklesIcon className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </div>
                </motion.div>
              </div>
              
              <div>
                <div className="text-center mb-8">
                  {/* Logo */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-16 h-16">
                      <Image 
                        src="/images/logo-block.png" 
                        alt="0x" 
                        fill
                        className="object-contain opacity-60"
                        sizes="64px"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <p className="text-gray-400 mb-6">Perfecto para empezar y probar</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">GRATIS</span>
                  </div>
                </div>

                <ul className="space-y-4">
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>50 DMs</strong> automáticos/mes</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>1 Landing page</strong> personalizada</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>5 Shortlinks</strong> con analytics</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>10 Captions</strong> con IA/mes</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left">Soporte por email</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <XMarkIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 line-through text-center md:text-left">Automatizaciones avanzadas</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <XMarkIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 line-through text-center md:text-left">Múltiples cuentas</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <XMarkIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 line-through text-center md:text-left">Soporte prioritario</span>
                </li>
                </ul>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full h-12 text-base font-bold bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
                    >
                      Empieza gratis ahora
                    </Button>
                  </motion.div>
                </Link>
              </div>
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
            
            <div className="relative bg-gradient-to-br from-purple-900/40 to-orange-900/40 backdrop-blur-sm border-2 border-transparent bg-clip-padding rounded-3xl p-8 pb-24 min-h-[700px] overflow-hidden"
                 style={{ 
                   backgroundImage: `
                     linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), rgba(249, 115, 22, 0.2)),
                     linear-gradient(to bottom right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8))
                   `,
                   backgroundOrigin: 'border-box',
                   backgroundClip: 'padding-box, border-box',
                   borderImage: 'linear-gradient(to bottom right, #f97316, #a855f7) 1'
                 }}>
              
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 blur-2xl rounded-3xl" />
              
              {/* Best value badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  initial={{ scale: 0, rotate: 12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.15 
                  }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-500 blur-xl opacity-60 rounded-full animate-pulse" />
                  
                  {/* Badge */}
                  <div className="relative bg-gradient-to-r from-orange-500 to-purple-500 text-white text-sm font-black px-6 py-2.5 rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-200 border border-white/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xl animate-bounce" style={{ animationDelay: '0.1s' }}>🚀</span>
                      <span className="uppercase tracking-wider">MÁS POPULAR</span>
                      <span className="text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                    </div>
                  </div>
                  
                  {/* Extra sparkles */}
                  <div className="absolute -top-2 -left-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-2">
                    <SparklesIcon className="w-4 h-4 text-orange-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </motion.div>
              </div>
              
              <div>
                <div className="text-center mb-8">
                  {/* Logo */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-20 h-20">
                      <Image 
                        src="/images/logo-block.png" 
                        alt="0x" 
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="80px"
                        priority
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                    Creator Pro
                  </h3>
                  <p className="text-gray-300 mb-2">Para creadores que van en serio</p>
                  
                  {/* Summer Sale text */}
                  <p className="text-lg font-medium mb-4">
                    ☀️ <span className="text-orange-400 font-bold">Summer Sale</span> - 
                    <span className="text-white font-bold"> 50% de descuento</span> en Creator Pro
                  </p>
                  
                  {/* Clean Price Display */}
                  <div className="relative mb-8">
                    {/* Subtle glow effect */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-purple-400/20 blur-3xl rounded-full"
                    />
                    
                    <div className="relative">
                      {/* Price comparison container - Clean Style */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="flex items-baseline justify-center gap-8"
                      >
                        {/* Original price */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                          className="relative"
                        >
                          <span className="text-6xl font-bold text-gray-500 line-through decoration-2">
                            €30
                          </span>
                        </motion.div>
                        
                        {/* New price with gradient */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, type: "spring", stiffness: 200 }}
                          className="relative"
                        >
                          <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                            €15
                          </span>
                          <span className="text-2xl text-gray-300 font-medium ml-2">/mes</span>
                        </motion.div>
                      </motion.div>
                      
                      {/* Savings info */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                        className="text-center mt-6"
                      >
                        <div className="inline-flex items-center gap-2 text-lg">
                          <span className="text-2xl">🔥</span>
                          <span className="text-orange-400 font-bold">OFERTA LIMITADA</span>
                          <span className="text-gray-400">-</span>
                          <span className="text-green-400 font-bold">Ahorra €180/año</span>
                        </div>
                      </motion.div>
                      
                    </div>
                  </div>
                </div>

                <ul className="space-y-4">
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>DMs ilimitados</strong> con IA avanzada</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Landing pages ilimitadas</strong></span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Shortlinks ilimitados</strong> + analytics pro</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Captions ilimitados</strong> con IA</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Automatizaciones avanzadas</strong></span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>3 cuentas</strong> de Instagram</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Soporte prioritario</strong> 24/7</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <SparklesIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Early access</strong> a nuevas features</span>
                </li>
                </ul>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
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
            <div className="relative bg-black/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 pb-24 hover:border-white/20 transition-all duration-300 min-h-[700px]">
              {/* Enterprise badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2 
                  }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 blur-xl opacity-50 rounded-full" />
                  
                  {/* Badge */}
                  <div className="relative bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-black px-6 py-2 rounded-full shadow-xl transform hover:scale-105 transition-transform duration-200 border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏢</span>
                      <span className="uppercase tracking-wider">PARA AGENCIAS</span>
                      <span className="text-lg">💼</span>
                    </div>
                  </div>
                  
                  {/* Professional touch */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <div className="w-1 h-3 bg-gradient-to-b from-indigo-400 to-transparent opacity-60" />
                  </div>
                </motion.div>
              </div>
              
              <div>
                <div className="text-center mb-8">
                  {/* Logo */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-16 h-16">
                      <Image 
                        src="/images/logo-block.png" 
                        alt="0x" 
                        fill
                        className="object-contain opacity-80"
                        sizes="64px"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Creator Ultra</h3>
                  <p className="text-gray-400 mb-6">Para agencias y equipos</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">€40</span>
                    <span className="text-gray-400">/mes</span>
                  </div>
                  <p className="text-sm text-green-400 mt-2">Ahorra €480/año pagando anual</p>
                </div>

                <ul className="space-y-4">
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Todo del plan Pro</strong></span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>10 cuentas</strong> de Instagram</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Team collaboration</strong></span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>API access</strong></span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>White label</strong> disponible</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Account manager</strong> dedicado</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Training</strong> personalizado</span>
                </li>
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-center md:text-left"><strong>Custom integrations</strong></span>
                </li>
                </ul>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white transition-all duration-300"
                    >
                      Empezar ahora
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
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
  );
}