'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AppUser }>;
  register: (data: { email: string; password: string; full_name: string; phone: string }) => Promise<{ success: boolean; error?: string; user?: AppUser }>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isStaff: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cnc_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        // Try local storage first for snappy hydration
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }

        // Verify with server endpoint
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.warn('Session sync warning:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Login failed.' };
      }

      setUser(data.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'Network error occurred during login.' };
    }
  };

  const register = async (regData: { email: string; password: string; full_name: string; phone: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Registration failed.' };
      }

      setUser(data.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'Network error occurred during registration.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout network error:', e);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';
  const isStaff = isSuperAdmin || isAdmin || isModerator;

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isSuperAdmin,
        isAdmin,
        isModerator,
        isStaff,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
