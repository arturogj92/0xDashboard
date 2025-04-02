'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/lib/types';
import { loginUser, registerUser, getUserProfile, logout, verifyToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verificar token
          const verifyResponse = await verifyToken(token);
          if (!verifyResponse.success || !verifyResponse.data.valid) {
            localStorage.removeItem('token');
            setIsLoading(false);
            return;
          }

          // Obtener perfil de usuario
          const profileResponse = await getUserProfile();
          if (profileResponse.success) {
            setUser(profileResponse.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Error al inicializar auth:', err);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        setUser(response.data.user);
        router.push('/');
        return { success: true };
      } else {
        setError(response.message || 'Error al iniciar sesión');
        return { success: false, message: response.message };
      }
    } catch (err: any) {
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
        router.push('/');
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

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout: handleLogout,
    error
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