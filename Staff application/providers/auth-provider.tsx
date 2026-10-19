import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { ApiError, apiRequest } from '@/lib/api';

const TOKEN_KEY = 'campussentry-auth-token';
const USER_KEY = 'campussentry-auth-user';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'security' | string;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type BackendUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: AuthUser['role'];
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  mode: 'signed-out' | 'demo' | 'authenticated';
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<AuthContextValue['mode']>('signed-out');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      if (Platform.OS === 'web') return;
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (!mounted) return;
      if (storedToken && storedUser) {
        try {
          const cachedUser = JSON.parse(storedUser) as AuthUser;
          setToken(storedToken);
          setUser(cachedUser);
          setMode('authenticated');
          const backendUser = await apiRequest<BackendUser>('/api/auth/me', {}, storedToken);
          const restoredUser: AuthUser = {
            id: backendUser.id ?? backendUser._id ?? cachedUser.id,
            name: backendUser.name,
            email: backendUser.email,
            role: backendUser.role,
          };
          if (!restoredUser.id || !restoredUser.email) {
            throw new Error('The backend returned incomplete account details.');
          }
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(restoredUser));
          if (mounted) setUser(restoredUser);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await Promise.all([
              SecureStore.deleteItemAsync(TOKEN_KEY),
              SecureStore.deleteItemAsync(USER_KEY),
            ]);
            if (mounted) {
              setToken(null);
              setUser(null);
              setMode('signed-out');
            }
          } else if (error instanceof SyntaxError) {
            await Promise.all([
              SecureStore.deleteItemAsync(TOKEN_KEY),
              SecureStore.deleteItemAsync(USER_KEY),
            ]);
            if (mounted) {
              setToken(null);
              setUser(null);
              setMode('signed-out');
            }
          } else {
            console.error('Unable to validate the saved sign-in session.', error);
          }
        }
      }
    };

    restoreSession().catch((error: unknown) => {
      console.error('Unable to restore the saved session.', error);
    }).finally(() => {
      if (mounted) setIsReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response?.token || !response.user?.id || !response.user.email) {
      throw new Error('The backend sign-in response is missing the token or user details.');
    }

    if (Platform.OS !== 'web') {
      try {
        await Promise.all([
          SecureStore.setItemAsync(TOKEN_KEY, response.token),
          SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
        ]);
      } catch {
        await Promise.all([
          SecureStore.deleteItemAsync(TOKEN_KEY),
          SecureStore.deleteItemAsync(USER_KEY),
        ]);
        throw new Error('Could not securely save the sign-in session on this device.');
      }
    }
    setToken(response.token);
    setUser(response.user);
    setMode('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
    }
    setToken(null);
    setUser(null);
    setMode('signed-out');
  }, []);

  const value = useMemo(
    () => ({ token, user, mode, isReady, signIn, signOut }),
    [isReady, mode, signIn, signOut, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
