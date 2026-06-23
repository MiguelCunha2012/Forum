import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'view';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<User>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractErrorMessage = (error: any, defaultMsg: string): string => {
  if (!error) return defaultMsg;
  if (typeof error === 'string') return error;
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
    }
    if (typeof detail === 'object') {
      return detail.message || JSON.stringify(detail);
    }
  }
  return error.message || defaultMsg;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      setUser(response.data.user);
      return response.data.user;
    } catch (error: any) {
      setUser(null);
      console.error('Erro de autenticação:', error);
      throw new Error(extractErrorMessage(error, 'Erro ao realizar login.'));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao deslogar no backend:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', { name, email, password, role: 'view' });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error);
      throw new Error(extractErrorMessage(error, 'Erro ao cadastrar usuário.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
