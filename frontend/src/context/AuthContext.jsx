import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useNotification } from './NotificationContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cravecart_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  // Load existing session
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('cravecart_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/users/profile');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid token');
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('cravecart_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return res.user;
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      if (res.success && res.token) {
        localStorage.setItem('cravecart_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast('Registration successful! Welcome to CraveCart.', 'success');
        return res.user;
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('cravecart_token');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (role = 'customer') => {
    let email = 'customer@example.com';
    if (role === 'admin') email = 'admin@example.com';
    if (role === 'restaurant_admin') email = 'restaurant@example.com';

    return login(email, 'Password123!');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/api/users/profile', data);
      if (res.success && res.user) {
        setUser(res.user);
        showToast('Profile updated successfully!', 'success');
        return res.user;
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Update failed', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isRestaurantAdmin: user?.role === 'restaurant_admin' || user?.role === 'admin',
        login,
        register,
        logout,
        quickDemoLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
