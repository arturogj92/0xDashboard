import React, { ReactNode, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface TextLengthSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  labelKey?: string;
  countLabelKey?: string;
  prefixIcon?: ReactNode;
}

const DEFAULT_MIN = 50;
const DEFAULT_MAX = 1000;
const DEFAULT_STEP = 25;
const CHARS_PER_LINE = 100;

export default function TextLengthSelector({ value, onChange, min = DEFAULT_MIN, max = DEFAULT_MAX, step = DEFAULT_STEP, labelKey, countLabelKey, prefixIcon }: TextLengthSelectorProps) {
  const t = useTranslations('captionGenerator');

  const [randomWidthFactors, setRandomWidthFactors] = useState<number[]>([]);
  const [staticSegmentsCount, setStaticSegmentsCount] = useState<number>(0);

  // Generar factores y controlar cuántos segmentos están estáticos vs animados
  useEffect(() => {
    const fullLinesCount = Math.floor(value / CHARS_PER_LINE);
    const remainderCount = value % CHARS_PER_LINE;
    const remainderSegments = Math.floor((remainderCount / CHARS_PER_LINE) * 4);
    const totalNeededSegments = fullLinesCount * 4 + remainderSegments;
    const oldLength = randomWidthFactors.length;

    if (totalNeededSegments > oldLength) {
      // Hay segmentos nuevos: fijar cuántos quedan estáticos y generar nuevos
      setStaticSegmentsCount(oldLength);
      const newFactorsNeeded = totalNeededSegments - oldLength;
      const newFactors = Array.from({ length: newFactorsNeeded }, (_, i) => {
        const segmentGlobalIndex = oldLength + i;
        const segmentLineIndex = Math.floor(segmentGlobalIndex / 4);
        const isLastLine = remainderSegments > 0
            ? segmentLineIndex === fullLinesCount
            : fullLinesCount > 0 && segmentLineIndex === fullLinesCount - 1;
        return isLastLine ? Math.random() * 8 - 2 : Math.random() * 12 - 6;
      });
      setRandomWidthFactors(prev => [...prev, ...newFactors]);
    } else {
      // Slider redujo o se mantiene: recortar estáticos al total necesario
      setStaticSegmentsCount(prev => Math.min(prev, totalNeededSegments));
    }
  }, [value]);

  const fullLinesCount = Math.floor(value / CHARS_PER_LINE);
  const remainderCount = value % CHARS_PER_LINE;
  const remainderSegments = Math.floor((remainderCount / CHARS_PER_LINE) * 4);

  return (
      <div className="w-full space-y-4">
        {/* Etiqueta y contador */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            {prefixIcon && <span className="flex-shrink-0">{prefixIcon}</span>}
            <label className="font-medium text-gray-200">
              {labelKey ? t(labelKey) : t('lengthSliderLabel')}
            </label>
          </div>
          <div className="flex items-baseline text-yellow-400 font-semibold">
          <span className="inline-block">
            <span className="text-xs align-baseline">≈</span>{value}
        </span>
            <span className="ml-1 text-xs sm:text-xs">{t(countLabelKey || 'characters')}</span>
          </div>
        </div>

        {/* Slider */}
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-indigo-500"
        />

        {/* Previsualización */}
        <div className="bg-[#1c1033] rounded-md p-4 space-y-1 animate-fadeIn">
          {Array.from({ length: fullLinesCount + (remainderSegments > 0 ? 1 : 0) }).map((_, lineIndex) => {
            const isFullLine = lineIndex < fullLinesCount;
            const segmentsInThisLine = isFullLine ? 4 : remainderSegments;
            return (
                <div key={`line-${lineIndex}`} className="flex space-x-1 overflow-hidden">
                  <AnimatePresence initial={false}>
                    {Array.from({ length: segmentsInThisLine }).map((_, segmentInLineIndex) => {
                      const segmentGlobalIndex = lineIndex * 4 + segmentInLineIndex;
                      const randomFactor = randomWidthFactors[segmentGlobalIndex] ?? 0;
                      return (
                          <motion.div
                              key={segmentGlobalIndex}
                              {...({ className: "h-3 bg-gray-500/60 rounded flex-shrink-0" } as any)}
                              style={{ width: `calc(25% - 4px + ${randomFactor}%)`, transformOrigin: 'left' }}
                              initial={segmentGlobalIndex < staticSegmentsCount ? false : { scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 1 }}
                              exit={{ scaleX: 0, opacity: 0 }}
                              transition={{ duration: 0.1, ease: 'easeInOut' }}
                          />
                      );
                    })}
                  </AnimatePresence>
                </div>
            );
          })}
        </div>
      </div>
  );
} 