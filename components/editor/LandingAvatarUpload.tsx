"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Upload, X } from "lucide-react";
import { ImageCropModal } from './ImageCropModal';
import { API_URL } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface LandingAvatarUploadProps {
  landingId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LandingAvatarUpload({ 
  landingId, 
  currentAvatarUrl, 
  onAvatarUpdate, 
  className = '', 
  size = 'md' 
}: LandingAvatarUploadProps) {
  const t = useTranslations('landingAvatarUpload');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert(t('selectValidImage'));
        return;
      }

      // Validar tamaño máximo (10MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert(t('imageTooLarge'));
        return;
      }

      // Crear URL para preview
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsModalOpen(true);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsLoading(true);
    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('avatar', croppedImageBlob, 'landing-avatar.jpg');

      // Crear headers con token de autenticación
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Subir avatar al backend
      const response = await fetch(`${API_URL}/api/landings/${landingId}/upload-avatar`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Actualizar el avatar en el componente padre
        onAvatarUpdate(data.data.avatarUrl);
        console.log('Avatar de landing subido exitosamente:', data.data.avatarUrl);
      } else {
        console.error('Error subiendo avatar de landing:', data.message);
        alert(data.message || t('errorUploading'));
      }
    } catch (error) {
      console.error('Error subiendo avatar de landing:', error);
      alert(t('errorUploading'));
    } finally {
      setIsLoading(false);
      // Limpiar URL del objeto
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/landings/${landingId}/remove-avatar`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onAvatarUpdate(null);
        console.log('Avatar de landing eliminado exitosamente');
      } else {
        console.error('Error eliminando avatar de landing:', data.message);
        alert(data.message || t('errorRemoving'));
      }
    } catch (error) {
      console.error('Error eliminando avatar de landing:', error);
      alert(t('errorRemoving'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Limpiar URL del objeto
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Avatar con overlay de cámara */}
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-2 border-purple-500 ring-2 ring-purple-300/30 transition-all duration-200`}>
          <AvatarImage 
            src={currentAvatarUrl} 
            alt="Avatar de landing" 
          />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-semibold flex items-center justify-center">
            <User className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} />
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay de cámara al hacer hover */}
        <div 
          className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          onClick={handleUploadClick}
        >
          <Camera className="w-4 h-4 text-white" />
        </div>

        {/* Botón de eliminar (solo si hay avatar) */}
        {currentAvatarUrl && (
          <button
            onClick={handleRemoveAvatar}
            disabled={isLoading}
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          onClick={handleUploadClick}
          disabled={isLoading}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 h-8"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-1" />
              {currentAvatarUrl ? t('changing') : t('uploading')}
            </>
          ) : (
            <>
              <Upload className="w-3 h-3 mr-1" />
              {currentAvatarUrl ? t('change') : t('uploadAvatar')}
            </>
          )}
        </Button>
      </div>

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal de recorte */}
      {selectedImage && (
        <ImageCropModal
          isOpen={isModalOpen}
          imageSrc={selectedImage}
          onClose={handleModalClose}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}