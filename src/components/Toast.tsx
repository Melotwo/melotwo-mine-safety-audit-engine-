import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X, 
  Copy,
  ExternalLink 
} from 'lucide-react';
import { useToast, ToastItem, ToastType } from '../hooks/useToast';

interface SingleToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const SingleToast: React.FC<SingleToastProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const intervalTime = 25;
    const totalSteps = toast.duration / intervalTime;
    const decrement = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.duration]);

  const getTheme = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/50',
          bg: 'bg-slate-900/95',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
          badgeText: 'text-emerald-400',
          badgeBg: 'bg-emerald-950/80 border-emerald-800/60',
          progress: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        };
      case 'error':
        return {
          border: 'border-rose-500/50',
          bg: 'bg-slate-900/95',
          iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          badgeText: 'text-rose-400',
          badgeBg: 'bg-rose-950/80 border-rose-800/60',
          progress: 'bg-rose-500',
          icon: <XCircle className="w-4 h-4 text-rose-400" />
        };
      case 'warning':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-slate-900/95',
          iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          badgeText: 'text-amber-400',
          badgeBg: 'bg-amber-950/80 border-amber-800/60',
          progress: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
        };
      case 'info':
      default:
        return {
          border: 'border-cyan-500/50',
          bg: 'bg-slate-900/95',
          iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
          badgeText: 'text-cyan-400',
          badgeBg: 'bg-cyan-950/80 border-cyan-800/60',
          progress: 'bg-cyan-500',
          icon: <Info className="w-4 h-4 text-cyan-400" />
        };
    }
  };

  const theme = getTheme(toast.type);

  return (
    <div
      role="status"
      aria-live="polite"
      id={`toast-${toast.id}`}
      className={`relative w-full max-w-sm sm:max-w-md pointer-events-auto rounded-2xl shadow-2xl backdrop-blur-xl border ${theme.border} ${theme.bg} overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-bottom-4`}
    >
      {/* Progress countdown bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="w-full bg-slate-800/80 h-1 overflow-hidden">
          <div 
            className={`h-full ${theme.progress} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4 flex items-start gap-3">
        {/* Icon Badge */}
        <div className={`p-2 rounded-xl shrink-0 ${theme.iconBg}`}>
          {theme.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {toast.title}
            </h4>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText}`}>
              {toast.type || 'info'}
            </span>
          </div>

          {toast.message && (
            <p className="text-xs text-slate-300 leading-relaxed break-words line-clamp-3">
              {toast.message}
            </p>
          )}

          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                onDismiss(toast.id);
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <span>{toast.actionLabel}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'bottom-right'
}) => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4 items-end',
    'top-left': 'top-4 left-4 items-start',
    'bottom-right': 'bottom-6 right-6 items-end',
    'bottom-left': 'bottom-6 left-6 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 items-center'
  }[position];

  return (
    <aside 
      aria-label="Notifications"
      className={`fixed z-50 pointer-events-none flex flex-col gap-2.5 max-w-full px-4 sm:px-0 ${positionClasses}`}
    >
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </aside>
  );
};

export default ToastContainer;
