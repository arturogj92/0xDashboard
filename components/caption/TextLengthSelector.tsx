import React, { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface TextLengthSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const DEFAULT_MIN = 50;
const DEFAULT_MAX = 1000;
const CHARS_PER_LINE = 50;

export default function TextLengthSelector({ value, onChange, min = DEFAULT_MIN, max = DEFAULT_MAX }: TextLengthSelectorProps) {
  const t = useTranslations('captionGenerator');

  // Calcular líneas aproximadas según caracteres
  const lines = useMemo(() => Math.max(1, Math.ceil(value / CHARS_PER_LINE)), [value]);

  // Generar segmentos simulados y mantenerlos estables
  const generateSegments = () => {
    const count = 3 + Math.floor(Math.random() * 3); // 3 a 5 segmentos
    return Array.from({ length: count }).map(() => 20 + Math.random() * 60);
  };
  const [segmentsByLine, setSegmentsByLine] = useState<number[][]>(() =>
    Array.from({ length: lines }).map(() => generateSegments())
  );
  useEffect(() => {
    if (lines > segmentsByLine.length) {
      const newSegs = Array.from({ length: lines - segmentsByLine.length }).map(() => generateSegments());
      setSegmentsByLine(prev => [...prev, ...newSegs]);
    }
    // No eliminamos segmentos existentes si líneas disminuye
  }, [lines, segmentsByLine.length]);

  return (
    <div className="w-full space-y-4">
      {/* Etiqueta y contador */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-200">
          {t('lengthSliderLabel')}
        </label>
        <span className="text-yellow-400 font-semibold">
          {value} {t('characters')}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={25}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-indigo-500"
      />

      {/* Previsualización */}
      <div className="bg-[#1c1033] rounded-md p-4 space-y-2 animate-fadeIn">
        {segmentsByLine.slice(0, lines).map((segments, lineIndex) => (
          <div key={lineIndex} className="flex gap-1">
            {segments.map((w, idx) => (
              <div
                key={idx}
                className="h-3 bg-gray-500/60 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 