import React, { createContext, useContext, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';

interface ToastContextType {
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  showInfoToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showSuccessToast = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showErrorToast = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showInfoToast = useCallback((message: string) => {
    toast(message);
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccessToast, showErrorToast, showInfoToast }}>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast doit être utilisé à l\'intérieur d\'un ToastProvider');
  }
  return context;
};