import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number; // in ms, default 3500ms
  actionLabel?: string;
  onAction?: () => void;
  timestamp: number;
}

export interface ToastOptions {
  id?: string;
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

// Global subscribers for multi-component broadcast without heavy boilerplate
type ToastListener = (toasts: ToastItem[]) => void;
let globalToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener([...globalToasts]));
}

export function dismissToast(id: string) {
  globalToasts = globalToasts.filter((t) => t.id !== id);
  notifyListeners();
}

export function showToast(options: ToastOptions | string): string {
  const toastObj: ToastOptions = typeof options === 'string' 
    ? { title: options, type: 'info' } 
    : options;

  const id = toastObj.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const newToast: ToastItem = {
    id,
    title: toastObj.title,
    message: toastObj.message,
    type: toastObj.type || 'info',
    duration: toastObj.duration ?? 3500,
    actionLabel: toastObj.actionLabel,
    onAction: toastObj.onAction,
    timestamp: Date.now()
  };

  // Remove existing with same id if any, append new
  globalToasts = [newToast, ...globalToasts.filter((t) => t.id !== id)].slice(0, 5);
  notifyListeners();

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }

  return id;
}

export function showSuccessToast(title: string, message?: string, options?: Partial<ToastOptions>): string {
  return showToast({ title, message, type: 'success', ...options });
}

export function showErrorToast(title: string, message?: string, options?: Partial<ToastOptions>): string {
  return showToast({ title, message, type: 'error', ...options });
}

export function showWarningToast(title: string, message?: string, options?: Partial<ToastOptions>): string {
  return showToast({ title, message, type: 'warning', ...options });
}

export function showInfoToast(title: string, message?: string, options?: Partial<ToastOptions>): string {
  return showToast({ title, message, type: 'info', ...options });
}

/**
 * Custom hook to trigger and manage toast notifications across the application.
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(() => [...globalToasts]);

  useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => {
      setToasts(updated);
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const toast = useCallback((opts: ToastOptions | string) => {
    return showToast(opts);
  }, []);

  const success = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return showSuccessToast(title, message, options);
  }, []);

  const error = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return showErrorToast(title, message, options);
  }, []);

  const warning = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return showWarningToast(title, message, options);
  }, []);

  const info = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return showInfoToast(title, message, options);
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  const dismissAll = useCallback(() => {
    globalToasts = [];
    notifyListeners();
  }, []);

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  };
}

export default useToast;
