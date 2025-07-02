"use client";

import { useEffect, useState } from "react";

interface SocialProofBarProps {
  className?: string;
}

export default function SocialProofBar({ className = "" }: SocialProofBarProps) {
  const [marginTop, setMarginTop] = useState(300); // Start with 300px margin-top

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Reduce margin progressively, reaching 0 after scrolling 300px
      const newMargin = Math.max(0, 300 - scrollY);
      setMarginTop(newMargin);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`w-full max-w-lg mx-auto ${className}`}
      style={{ 
        marginTop: `${marginTop}px`, 
        transition: 'margin-top 0.3s ease-out' 
      }}
    >
      {/* Statistics Section */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">1000+</span>
            <span className="text-xs text-gray-300">Estudiantes</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">50+</span>
            <span className="text-xs text-gray-300">Proyectos</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">2000+</span>
            <span className="text-xs text-gray-300">Horas de código</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-400">98%</span>
            <span className="text-xs text-gray-300">Satisfacción</span>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="space-y-2 mb-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              M
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-200 mb-1 italic">
                &ldquo;Gracias a Art0xDev conseguí mi primer trabajo como desarrolladora en solo 6 meses.&rdquo;
              </p>
              <div className="text-xs">
                <span className="text-white font-medium">María García</span>
                <span className="text-gray-400"> · Frontend Developer</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              C
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-200 mb-1 italic">
                &ldquo;Los proyectos prácticos me ayudaron a construir un portafolio sólido.&rdquo;
              </p>
              <div className="text-xs">
                <span className="text-white font-medium">Carlos Ruiz</span>
                <span className="text-gray-400"> · Full Stack Developer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}