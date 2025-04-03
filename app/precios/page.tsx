'use client';

import { CheckIcon } from "@heroicons/react/24/solid";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const plans = [
  {
    name: "Plan Básico",
    description: "Para creadores emergentes que quieren automatizar sus primeras respuestas.",
    price: "9,99€",
    priceDescription: "al mes",
    features: [
      "1 reel configurado",
      "Hasta 5 palabras clave",
      "Respuestas personalizadas",
      "Estadísticas básicas",
      "Soporte por email"
    ],
    buttonText: "Empezar",
    variant: "outline",
    popular: false
  },
  {
    name: "Pro",
    description: "Para creadores que quieren escalar su presencia en Instagram.",
    price: "24,99€",
    priceDescription: "al mes",
    features: [
      "5 reels configurados",
      "Hasta 20 palabras clave por reel",
      "Generación de respuestas con IA",
      "Estadísticas avanzadas",
      "Soporte prioritario",
      "Personalización de botones",
      "Generación de comentarios con IA"
    ],
    buttonText: "Comenzar Ahora",
    variant: "default",
    popular: true
  },
  {
    name: "Empresarial",
    description: "Para marcas y creadores establecidos con gran audiencia.",
    price: "69,99€",
    priceDescription: "al mes",
    features: [
      "Reels ilimitados",
      "Palabras clave ilimitadas",
      "Respuestas con IA avanzada",
      "Etiquetas personalizadas",
      "Estadísticas en tiempo real",
      "Soporte dedicado 24/7",
      "Integración con otras plataformas",
      "API personalizada"
    ],
    buttonText: "Contactar",
    variant: "outline",
    popular: false
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

// Animación al hacer hover en la tarjeta
const cardHoverVariants = {
  hover: {
    scale: 1.03,
    y: -8,
    boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

const PricingCard = ({ plan, i, parallaxY }: { plan: typeof plans[0], i: number, parallaxY: number }) => {
  const cardRef = useRef(null);
  const y = useMotionValue(0);
  
  // Aplica el efecto parallax multiplicando por un factor diferente para cada tarjeta
  useEffect(() => {
    const factor = i === 0 ? 0.7 : i === 1 ? 0.5 : 0.9;
    y.set(parallaxY * factor);
  }, [parallaxY, i, y]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y }}
      custom={i}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
          }
        },
        hover: {
          scale: 1.03,
          y: -8,
          boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 15
          }
        }
      }}
      className="will-change-transform"
    >
      <Card className={`h-full flex flex-col border ${
        plan.popular 
          ? "border-indigo-500 bg-gradient-to-b from-indigo-950/40 to-indigo-900/10" 
          : "border-gray-700 bg-[#120724]"
      }`}>
        {plan.popular && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Más Popular
          </div>
        )}
        <CardHeader className={`pb-8 ${plan.popular ? "pt-8" : "pt-6"}`}>
          <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
          <CardDescription className="text-gray-400 mt-2">{plan.description}</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold text-white">{plan.price}</span>
            <span className="text-gray-400 ml-2">{plan.priceDescription}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-indigo-400 mt-0.5">
                  <CheckIcon />
                </div>
                <span className="ml-3 text-base text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-6 pb-8">
          <Button 
            variant={plan.popular ? "default" : "outline"} 
            size="lg" 
            className={`w-full ${
              plan.popular 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "border-indigo-500 text-indigo-400 hover:bg-indigo-950/50"
            }`}
          >
            {plan.buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function PreciosPage() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Suaviza el efecto de scroll con spring physics
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const smoothScrollY = useSpring(scrollY, springConfig);

  useMotionValueEvent(smoothScrollY, "change", (latest) => {
    setScrollPosition(latest);
  });

  return (
    <div className="py-12" ref={containerRef}>
      <div className="text-center mb-16">
        <motion.h1 
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Planes y Precios
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-400 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Elige el plan que mejor se adapte a tus necesidades para automatizar tus respuestas en Instagram y potenciar tu crecimiento.
        </motion.p>
      </div>

      <div className="grid gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:grid-cols-3">
        {plans.map((plan, i) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            i={i}
            parallaxY={scrollPosition * 0.15}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <motion.p 
          className="text-gray-400 max-w-2xl mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ¿Tienes necesidades específicas? Contacta con nuestro equipo para crear un plan personalizado.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-950/50">
            Contactar para un plan personalizado
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 