import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((title, message) => addToast({ type: 'success', title, message }), [addToast]);
  const showError = useCallback((title, message) => addToast({ type: 'error', title, message }), [addToast]);
  const showWarning = useCallback((title, message) => addToast({ type: 'warning', title, message }), [addToast]);
  const showInfo = useCallback((title, message) => addToast({ type: 'info', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {/* Toast floating container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform animate-slide-up bg-white ${
              toast.type === 'success'
                ? 'border-green-200 text-gray-800 shadow-green-900/5'
                : toast.type === 'error'
                ? 'border-red-200 text-gray-800 shadow-red-900/5'
                : toast.type === 'warning'
                ? 'border-amber-200 text-gray-800 shadow-amber-900/5'
                : 'border-blue-200 text-gray-800 shadow-blue-900/5'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-wa-teal" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="text-sm font-bold text-gray-900 leading-tight">{toast.title}</h4>}
              {toast.message && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
