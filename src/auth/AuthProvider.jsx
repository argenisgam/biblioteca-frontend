import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, TOKEN_KEY } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState('');

  const logout = useCallback((message = '') => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSessionMessage(message);
  }, []);

  useEffect(() => {
    let active = true;
    const handleUnauthorized = () => {
      logout('Tu sesión expiró. Inicia sesión de nuevo.');
      setLoading(false);
    };
    window.addEventListener('biblioteca:unauthorized', handleUnauthorized);

    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return () => window.removeEventListener('biblioteca:unauthorized', handleUnauthorized);
    }

    authApi.currentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) logout('No se pudo validar la sesión. Inicia sesión de nuevo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener('biblioteca:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const session = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, session.token);
    setUser(session.user);
    setSessionMessage('');
  }, []);

  const register = useCallback(async (credentials) => {
    const session = await authApi.register(credentials);
    localStorage.setItem(TOKEN_KEY, session.token);
    setUser(session.user);
    setSessionMessage('');
  }, []);

  const value = useMemo(() => ({ user, loading, sessionMessage, login, register, logout }), [user, loading, sessionMessage, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
