"use client";

import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 16,
        right: 16,
      }}
      toastOptions={{
        duration: 5000,
        success: {
          style: {
            background: 'rgb(240 253 244)',
            color: 'rgb(22 101 52)',
            border: '1px solid rgb(187 247 208)',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxWidth: '400px',
            fontSize: '14px',
          },
          iconTheme: {
            primary: 'rgb(34 197 94)',
            secondary: 'rgb(240 253 244)',
          },
        },
        error: {
          style: {
            background: 'rgb(254 242 242)',
            color: 'rgb(153 27 27)',
            border: '1px solid rgb(254 202 202)',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxWidth: '400px',
            fontSize: '14px',
          },
          iconTheme: {
            primary: 'rgb(239 68 68)',
            secondary: 'rgb(254 242 242)',
          },
        },
        loading: {
          style: {
            background: 'rgb(239 246 255)',
            color: 'rgb(30 64 175)',
            border: '1px solid rgb(191 219 254)',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxWidth: '400px',
            fontSize: '14px',
          },
          iconTheme: {
            primary: 'rgb(59 130 246)',
            secondary: 'rgb(239 246 255)',
          },
        },
      }}
      gutter={8}
    />
  );
}

export function useToast() {
  const success = (title: string, description?: string, duration?: number) => {
    const message = description ? `${title}\n${description}` : title;
    return toast.success(message, { duration: duration ?? 5000 });
  };

  const error = (title: string, description?: string, duration?: number) => {
    const message = description ? `${title}\n${description}` : title;
    return toast.error(message, { duration: duration ?? 5000 });
  };

  const info = (title: string, description?: string, duration?: number) => {
    const message = description ? `${title}\n${description}` : title;
    return toast(message, { 
      duration: duration ?? 5000,
      icon: <Info className="h-5 w-5" />,
      style: {
        background: 'rgb(239 246 255)',
        color: 'rgb(30 64 175)',
        border: '1px solid rgb(191 219 254)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        maxWidth: '400px',
        fontSize: '14px',
      },
    });
  };

  const warning = (title: string, description?: string, duration?: number) => {
    const message = description ? `${title}\n${description}` : title;
    return toast(message, { 
      duration: duration ?? 5000,
      icon: <AlertTriangle className="h-5 w-5" />,
      style: {
        background: 'rgb(254 252 232)',
        color: 'rgb(133 77 14)',
        border: '1px solid rgb(254 240 138)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        maxWidth: '400px',
        fontSize: '14px',
      },
    });
  };

  return {
    success,
    error,
    info,
    warning,
    dismiss: toast.dismiss,
    remove: toast.remove,
  };
}
