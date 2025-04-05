import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getShortenedUrl(url: string) {
  if (!url) return '';
  
  // Eliminar protocolo
  let cleanUrl = url.replace(/(https?:\/\/)?(www\.)?/, '');
  
  // Limitar a 25 caracteres con elipsis
  if (cleanUrl.length > 25) {
    cleanUrl = cleanUrl.substring(0, 22) + '...';
  }
  
  return cleanUrl;
}
