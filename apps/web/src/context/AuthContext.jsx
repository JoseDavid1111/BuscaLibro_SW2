/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

function getInitialUser() {
  const token = localStorage.getItem('token');
  return token ? undefined : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  useEffect(() => {
    if (user !== undefined) return;
    let cancelled = false;

    authService.me()
      .then(({ user }) => { if (!cancelled) setUser(user); })
      .catch(() => { if (!cancelled) { localStorage.removeItem('token'); setUser(null); } });

    return () => { cancelled = true; };
  }, [user]);

  const login = useCallback(async (email, password) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: user === undefined, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
