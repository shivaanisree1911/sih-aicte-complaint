import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isError
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="mr-3 flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 mr-2">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
