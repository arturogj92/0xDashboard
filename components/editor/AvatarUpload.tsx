"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Upload } from "lucide-react";
import { ImageCropModal } from './ImageCropModal';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploadProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ className = '', size = 'md' }: AvatarUploadProps) {
  const { user, refreshUserProfile } = useAuth();
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
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño máximo (10MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert('La imagen no puede ser mayor a 10MB');
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
      formData.append('avatar', croppedImageBlob, 'avatar.jpg');

      // Crear headers personalizados para FormData (sin Content-Type)
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Subir avatar al backend
      const response = await fetch(`${API_URL}/api/auth/upload-avatar`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Actualizar perfil del usuario para reflejar el nuevo avatar
        await refreshUserProfile();
        console.log('Avatar subido exitosamente:', data.data.avatarUrl);
      } else {
        console.error('Error subiendo avatar:', data.message);
        alert(data.message || 'Error al subir el avatar');
      }
    } catch (error) {
      console.error('Error subiendo avatar:', error);
      alert('Error al subir el avatar');
    } finally {
      setIsLoading(false);
      // Limpiar URL del objeto
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
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
            src={user?.avatar_url} 
            alt={user?.name || user?.username || 'Avatar'} 
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
      </div>

      {/* Botón de subida */}
      <Button
        onClick={handleUploadClick}
        disabled={isLoading}
        size="sm"
        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 h-8"
      >
        {isLoading ? (
          <>
            <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-1" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="w-3 h-3 mr-1" />
            Cambiar Avatar
          </>
        )}
      </Button>

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