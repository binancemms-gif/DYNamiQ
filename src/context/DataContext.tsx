import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BootstrapData } from '../types.ts';

interface DataContextType {
  data: BootstrapData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  currentPath: string;
  navigate: (path: string) => void;
  subscribeNewsletter: (email: string) => Promise<{ success: boolean; message: string }>;
}

const DataContext = createContext<DataContextType>({
  data: null,
  isLoading: true,
  error: null,
  refreshData: async () => {},
  currentPath: '/',
  navigate: () => {},
  subscribeNewsletter: async () => ({ success: false, message: '' })
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<BootstrapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/public/bootstrap');
      if (!res.ok) throw new Error('Failed to retrieve publication data');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error('Data bootstrap error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchData]);

  const navigate = useCallback((path: string) => {
    if (path === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const subscribeNewsletter = async (email: string) => {
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await res.json();
      return {
        success: res.ok,
        message: result.message || (res.ok ? 'Subscribed successfully.' : result.error || 'Failed to subscribe.')
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network connection failed' };
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      isLoading,
      error,
      refreshData: fetchData,
      currentPath,
      navigate,
      subscribeNewsletter
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
