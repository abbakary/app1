'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { saveSession, clearSession } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AuthContextType {
  user: User | null;
  restaurantId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      const storedRid = localStorage.getItem('restaurant_id');
      if (stored) setUser(JSON.parse(stored));
      if (storedRid) {
        setRestaurantId(storedRid);
        sessionStorage.setItem('restaurant_id', storedRid);
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const handleSessionSave = (userData: User, rid: string | null | undefined) => {
    setUser(userData);
    setRestaurantId(rid ?? null);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    saveSession(rid);
    if (rid) localStorage.setItem('restaurant_id', rid);
    else localStorage.removeItem('restaurant_id');
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const token = await res.json();
      const userData: User = {
        id: token.user_id,
        name: email.split('@')[0],
        email,
        role: token.role,
        restaurantId: token.restaurant_id,
        createdAt: new Date().toISOString(),
      };
      handleSessionSave(userData, token.restaurant_id);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) return false;
      const token = await res.json();
      const userData: User = {
        id: token.user_id,
        name: `Staff ${token.user_id.slice(0, 4)}`,
        email: '',
        role: token.role,
        restaurantId: token.restaurant_id,
        createdAt: new Date().toISOString(),
      };
      handleSessionSave(userData, token.restaurant_id);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRestaurantId(null);
    clearSession();
    localStorage.removeItem('auth_user');
    localStorage.removeItem('restaurant_id');
  }, []);

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurantId,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithPin,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
