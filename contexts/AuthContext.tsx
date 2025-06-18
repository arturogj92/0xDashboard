'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/lib/types';
import { loginUser, registerUser, getUserProfile, logout as apiLogout, verifyToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
  loginWithToken: (token: string, userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Función para obtener el perfil del usuario
  const refreshUserProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setUser(response.data);
        return;
      } else {
        // Si el perfil no se puede obtener, limpiar el usuario
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // Efecto para inicializar la autenticación al cargar la aplicación
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        console.log('Token encontrado en localStorage, verificando...');
        
        // Refrescar el perfil del usuario
        await refreshUserProfile();
        
      } catch (err) {
        console.error('Error al inicializar auth:', err);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      console.log('Respuesta de login:', response);
      
      if (response.success) {
        setUser(response.data.user);
        router.push('/home');
        return { success: true };
      } else {
        setError(response.message || 'Error al iniciar sesión');
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      const errorMsg = err.message || 'Error al iniciar sesión';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(credentials);
      if (response.success) {
        setUser(response.data.user);
        router.push('/home');
        return { success: true };
      } else {
        setError(response.message || 'Error al registrar usuario');
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error al registrar usuario';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Nueva función para manejar el login post-callback (ej: Facebook)
  const loginWithToken = async (token: string, userData: User) => {
    console.log('Login con token', token, userData);
    localStorage.setItem('token', token); // Guardar el nuevo token
    setError(null); // Limpiar errores previos
    setIsLoading(true);
    try {
      const profileResponse = await getUserProfile();
      if (profileResponse.success && profileResponse.data) {
        setUser(profileResponse.data);
        router.push('/home'); // Redirigir al dashboard o página principal
      } else {
        // Si falla, hacer logout
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout: handleLogout,
    error,
    refreshUserProfile,
    loginWithToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 