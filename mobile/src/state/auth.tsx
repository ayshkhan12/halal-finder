import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api, ApiError, setAuthToken } from '@/api/client';
import type { User } from '@/api/types';
import { secureStore } from '@/lib/storage';

type AuthContext = {
  user: User | null;
  token: string | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = 'hf.token';
const Ctx = createContext<AuthContext>({
  user: null,
  token: null,
  ready: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const apply = async (next: { token: string; user: User } | null) => {
    setAuthToken(next?.token ?? null);
    setToken(next?.token ?? null);
    setUser(next?.user ?? null);
    if (next) await secureStore.set(TOKEN_KEY, next.token);
    else await secureStore.remove(TOKEN_KEY);
  };

  useEffect(() => {
    (async () => {
      const saved = await secureStore.get(TOKEN_KEY);
      if (saved) {
        setAuthToken(saved);
        try {
          const { data } = await api<{ data: User }>('/auth/me');
          setToken(saved);
          setUser(data);
        } catch (err) {
          // Only forget the token if the server rejected it; keep it when offline.
          if (err instanceof ApiError && err.status === 401) await apply(null);
          else setToken(saved);
        }
      }
      setReady(true);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data } = await api<{ data: { token: string; user: User } }>('/auth/login', { method: 'POST', body: { email, password } });
    await apply(data);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data } = await api<{ data: { token: string; user: User } }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    await apply(data);
  };

  return (
    <Ctx.Provider value={{ user, token, ready, signIn, signUp, signOut: () => apply(null) }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
