import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('homes2own_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('homes2own_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await client.get('/api/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/api/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('homes2own_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const register = async (userData) => {
    const res = await client.post('/api/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem('homes2own_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed.');
  };

  const logout = () => {
    localStorage.removeItem('homes2own_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        isAdmin: user?.role === 'admin',
        isConsultant: user?.role === 'consultant' || user?.role === 'admin',
        isCustomer: user?.role === 'customer',
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
