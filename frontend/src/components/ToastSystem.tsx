import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, Trophy, Sparkles } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastSystemProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastItem = forwardRef<HTMLDivElement, { toast: Toast; onRemove: (id: string) => void }>(
  ({ toast, onRemove }, ref) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Trophy className="w-6 h-6 text-green-600" />;
      case 'error':
        return <X className="w-6 h-6 text-red-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className={`professional-card rounded-xl p-4 border ${getColors()} min-w-[320px] max-w-md`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold mb-1">{toast.title}</h4>
            {toast.description && (
              <p className="text-sm opacity-80">{toast.description}</p>
            )}
          </div>
          
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }
);

// Add display name for better debugging
ToastItem.displayName = 'ToastItem';

export default function ToastSystem({ toasts, onRemove }: ToastSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
};