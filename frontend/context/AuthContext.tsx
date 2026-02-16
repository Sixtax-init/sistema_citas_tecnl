"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  rol: 'ALUMNO' | 'ESPECIALISTA' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  login: (access: string, refresh: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/login');
  }, [router]);

  const login = useCallback((access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    try {
      const base64Url = access.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);

      const userData: User = {
        id: payload.user_id,
        email: payload.email,
        username: "",
        first_name: payload.full_name?.split(' ')[0] || "",
        last_name: payload.full_name?.split(' ')[1] || "",
        rol: payload.rol
      };

      setUser(userData);

      // Redirect based on role
      if (userData.rol === 'ALUMNO') router.push('/student');
      else if (userData.rol === 'ESPECIALISTA') router.push('/specialist');
      else router.push('/');

    } catch (e) {
      console.error("Error decoding token during login", e);
    }
  }, [router]);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Decode token payload manually to avoid extra libraries for now
          // JWT structure: Header.Payload.Signature
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const payload = JSON.parse(jsonPayload);

          setUser({
            id: payload.user_id,
            email: payload.email,
            username: "",
            first_name: payload.full_name?.split(' ')[0] || "",
            last_name: payload.full_name?.split(' ')[1] || "",
            rol: payload.rol
          });

        } catch (error) {
          console.error("Failed to restore session", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
