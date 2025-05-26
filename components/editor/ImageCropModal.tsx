"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

export function ImageCropModal({ isOpen, imageSrc, onClose, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Calcular un crop inicial cuadrado centrado
    const minDimension = Math.min(width, height);
    const cropSize = minDimension * 0.8; // 80% de la dimensión menor
    
    const centerCrop: Crop = {
      unit: 'px',
      width: cropSize,
      height: cropSize,
      x: (width - cropSize) / 2,
      y: (height - cropSize) / 2,
    };
    
    setCrop(centerCrop);
  }, []);

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Manejar el scroll del body cuando la modal está abierta
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body cuando se cierra
      document.body.style.overflow = 'unset';
    }

    // Cleanup: restaurar scroll cuando el componente se desmonte
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getCroppedImg = useCallback(async (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Configurar el canvas con el tamaño del crop
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Tamaño final deseado (500x500 para avatars)
    const finalSize = 500;
    canvas.width = finalSize;
    canvas.height = finalSize;

    // Calcular las coordenadas del crop en la imagen original
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Dibujar la imagen recortada y redimensionada
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      finalSize,
      finalSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.9 // Calidad 90%
      );
    });
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImageBlob);
      onClose();
    } catch (error) {
      console.error('Error al recortar imagen:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, getCroppedImg, onCropComplete, onClose]);

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
      <div 
        ref={modalRef}
        className="bg-[#120724] rounded-lg border border-indigo-900/30 p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Recortar Imagen</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-sm text-gray-300 mb-4">
          Arrastra las esquinas para seleccionar la parte de la imagen que quieres mostrar. El resultado será un cuadrado de 500x500px optimizado para avatars.
        </div>

        <div className="mb-6 flex justify-center overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1} // Ratio 1:1 para cuadrado
            minWidth={50}
            minHeight={50}
            keepSelection
            ruleOfThirds
            className="max-w-full"
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imageSrc}
              onLoad={onImageLoad}
              className="max-w-full max-h-[60vh] object-contain"
              style={{ display: 'block' }}
            />
          </ReactCrop>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCropComplete}
            disabled={isProcessing || !completedCrop}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Procesando...
              </>
            ) : (
              'Aplicar Recorte'
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}