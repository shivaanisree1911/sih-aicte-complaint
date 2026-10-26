import { useState, useCallback } from 'react';

let toastListener = null;

export function notify(message, type = 'info') {
  if (toastListener) {
    toastListener({ id: Date.now(), message, type });
  }
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register listener
  toastListener = addToast;

  return { toasts, removeToast };
}
