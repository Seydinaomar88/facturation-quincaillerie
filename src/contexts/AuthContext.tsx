import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';
import { logout as apiLogout } from '../api/auth';

interface AuthContextType {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: { id: string; name: string; email: string }) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState<boolean>(true);
  const { showSuccessToast } = useToast();

  // Charger l'utilisateur si le token existe
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Votre backend n'a pas de route /user
          // On utilise les informations stockées lors du login
          const storedUser = localStorage.getItem('authUser');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'utilisateur:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = useCallback((newToken: string, userData: { id: string; name: string; email: string }) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
      showSuccessToast('Vous avez été déconnecté avec succès.');
    }
  }, [showSuccessToast]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};