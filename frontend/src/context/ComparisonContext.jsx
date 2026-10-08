import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const notify = useNotification();
  const [comparedProperties, setComparedProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync with API when authenticated, or maintain session list
  const fetchComparisons = async () => {
    if (!isAuthenticated) {
      const local = localStorage.getItem('homes2own_comparisons');
      if (local) {
        try {
          setComparedProperties(JSON.parse(local));
        } catch (e) {
          setComparedProperties([]);
        }
      }
      return;
    }

    try {
      setLoading(true);
      const res = await client.get('/api/comparisons');
      if (res.success && Array.isArray(res.comparisons)) {
        setComparedProperties(res.comparisons);
      }
    } catch (err) {
      console.warn('Could not load comparisons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisons();
  }, [isAuthenticated]);

  const addToComparison = async (property) => {
    if (comparedProperties.some((p) => p.id === property.id)) {
      notify.info('Property is already in your comparison tray.');
      return;
    }

    if (comparedProperties.length >= 3) {
      notify.error('Maximum 3 properties can be compared. Please remove one first.');
      return;
    }

    if (isAuthenticated) {
      try {
        const res = await client.post(`/api/comparisons/${property.id}`);
        if (res.success) {
          fetchComparisons();
          notify.success(`Added ${property.title} to comparison.`);
        }
      } catch (err) {
        notify.error(err.message);
      }
    } else {
      const updated = [...comparedProperties, property];
      setComparedProperties(updated);
      localStorage.setItem('homes2own_comparisons', JSON.stringify(updated));
      notify.success(`Added ${property.title} to comparison.`);
    }
  };

  const removeFromComparison = async (propertyId) => {
    if (isAuthenticated) {
      try {
        await client.delete(`/api/comparisons/${propertyId}`);
        fetchComparisons();
        notify.info('Property removed from comparison.');
      } catch (err) {
        notify.error(err.message);
      }
    } else {
      const updated = comparedProperties.filter((p) => p.id !== propertyId);
      setComparedProperties(updated);
      localStorage.setItem('homes2own_comparisons', JSON.stringify(updated));
      notify.info('Property removed from comparison.');
    }
  };

  const clearComparisons = async () => {
    if (isAuthenticated) {
      try {
        await client.delete('/api/comparisons');
        setComparedProperties([]);
      } catch (err) {
        console.warn(err);
      }
    } else {
      setComparedProperties([]);
      localStorage.removeItem('homes2own_comparisons');
    }
    notify.info('Comparison tray cleared.');
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparedProperties,
        count: comparedProperties.length,
        addToComparison,
        removeFromComparison,
        clearComparisons,
        loading,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
