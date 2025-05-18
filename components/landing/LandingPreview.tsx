import Image from 'next/image';

interface LandingPreviewProps {
  name: string;
  description: string;
}

export function LandingPreview({ name, description }: LandingPreviewProps) {
  return (
    <div className="relative w-[200px] h-[430px] select-none">
      {/* Marco del iPhone */}
      <Image
        src="/images/iphone16-frame.png"
        alt="iPhone frame"
        fill
        className="absolute inset-0 z-20 pointer-events-none"
      />

      {/* Contenido de la pantalla */}
      <div className="absolute inset-0 z-10 flex flex-col items-center pt-12 px-3 overflow-y-auto bg-gradient-to-b from-[#1c1033] to-[#230447] rounded-[36px]">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden flex-shrink-0" />

        {/* Nombre dinámico */}
        <h2 className="mt-2 text-base font-semibold text-[#8ad2ff] text-center break-words">
          {name || 'Your Name'}
        </h2>

        {/* Descripción dinámica */}
        {description && (
          <p className="text-xs text-gray-300 text-center mt-1 break-words line-clamp-2">
            {description}
          </p>
        )}

        {/* Links skeleton */}
        <div className="w-full space-y-2 mt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-10 bg-black/40 rounded border border-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
} 