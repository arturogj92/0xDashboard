'use client';

import React from 'react';

interface StepIndicatorProps {
  total: number;
  current: number;
}

export default function StepIndicator({ total, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center">
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1;
        const isActive = idx === current;
        const isCompleted = idx < current;
        return (
          <React.Fragment key={i}>
            <span
              className={`w-3 h-3 rounded-full ${isActive || isCompleted ? 'bg-indigo-600' : 'bg-gray-500'} transition-colors`}
            />
            {i < total - 1 && (
              <div
                className={`w-6 h-0.5 ${isCompleted ? 'bg-indigo-600' : 'bg-gray-500'} transition-colors`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
} 