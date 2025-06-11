'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialTooltipProps {
  /** Texto principal del tooltip */
  message: string;
  /** Emoji o icono de la izquierda */
  leftIcon?: string;
  /** Emoji o icono de la derecha */
  rightIcon?: string;
  /** Clave única para localStorage */
  storageKey: string;
  /** Duración en millisegundos antes de auto-ocultar */
  duration?: number;
  /** Retraso antes de mostrar en millisegundos */
  delay?: number;
  /** Función callback cuando se hace click en el elemento padre */
  onParentClick?: () => void;
  /** Condición adicional para mostrar el tooltip (además de no haberlo visto antes) */
  showCondition?: boolean;
  /** Posición del tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Color del gradiente del tooltip */
  gradient?: 'yellow-orange' | 'purple-blue' | 'green-teal' | 'red-pink';
  /** Hijos (el elemento sobre el que aparece el tooltip) */
  children: React.ReactNode;
}

const gradientClasses = {
  'yellow-orange': 'bg-gradient-to-r from-yellow-400 to-orange-500',
  'purple-blue': 'bg-gradient-to-r from-purple-500 to-blue-500',
  'green-teal': 'bg-gradient-to-r from-green-400 to-teal-500',
  'red-pink': 'bg-gradient-to-r from-red-400 to-pink-500'
};

const arrowClasses = {
  'yellow-orange': 'border-t-orange-500',
  'purple-blue': 'border-t-blue-500',
  'green-teal': 'border-t-teal-500',
  'red-pink': 'border-t-pink-500'
};

const positionClasses = {
  top: 'absolute -top-16 inset-x-0 mx-auto pointer-events-none z-30 w-fit',
  bottom: 'absolute -bottom-16 inset-x-0 mx-auto pointer-events-none z-30 w-fit',
  left: 'absolute -left-64 top-1/2 transform -translate-y-1/2 pointer-events-none z-30 w-fit',
  right: 'absolute -right-64 top-1/2 transform -translate-y-1/2 pointer-events-none z-30 w-fit'
};

const arrowPositions = {
  top: 'absolute top-full left-1/2 transform -translate-x-1/2',
  bottom: 'absolute bottom-full left-1/2 transform -translate-x-1/2 rotate-180',
  left: 'absolute left-full top-1/2 transform -translate-y-1/2 rotate-90',
  right: 'absolute right-full top-1/2 transform -translate-y-1/2 -rotate-90'
};

export function TutorialTooltip({
  message,
  leftIcon = '🎉',
  rightIcon = '⬇️',
  storageKey,
  duration = 10000,
  delay = 1500,
  onParentClick,
  showCondition = true,
  position = 'top',
  gradient = 'yellow-orange',
  children
}: TutorialTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);
    
    // Mostrar tooltip si no se ha visto y se cumple la condición
    if (!hasSeen && showCondition) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        // Auto-ocultar después del tiempo especificado
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem(storageKey, 'true');
        }, duration);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [storageKey, showCondition, duration, delay]);

  const handleParentClick = () => {
    // Cerrar tooltip si está visible
    if (showTooltip) {
      setShowTooltip(false);
      localStorage.setItem(storageKey, 'true');
    }
    
    // Ejecutar callback adicional si existe
    if (onParentClick) {
      onParentClick();
    }
  };

  return (
    <div className="relative" onClick={handleParentClick}>
      {children}
      
      {/* Tooltip animado */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotate: [0, -2, 2, -1, 1, 0]
            }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut",
              rotate: { 
                duration: 0.8, 
                repeat: Infinity, 
                repeatType: "loop",
                ease: "easeInOut"
              }
            }}
            className={positionClasses[position]}
          >
            <div className={`${gradientClasses[gradient]} text-black px-4 py-2 rounded-lg shadow-lg font-semibold text-sm whitespace-nowrap relative`}>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {leftIcon}
                </motion.div>
                {message}
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {rightIcon}
                </motion.div>
              </div>
              
              {/* Flecha apuntando al elemento */}
              <div className={arrowPositions[position]}>
                <div className={`w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent ${arrowClasses[gradient]}`}></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}