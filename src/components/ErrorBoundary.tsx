import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MeloTwo ErrorBoundary caught an unhandled runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleResetSession = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage during session reset:', e);
    }
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (e) {
        console.warn('onReset callback failed:', e);
      }
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public handleHardReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full bg-slate-950 text-slate-100 p-6 sm:p-10 rounded-2xl border border-rose-500/30 shadow-2xl flex flex-col items-center justify-center my-6 relative overflow-hidden font-sans">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono uppercase tracking-widest mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>4.0 Stability Standard • Intercepted System Exception</span>
          </div>

          {/* Shield / Warning Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-rose-500/40 flex items-center justify-center mb-5 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white text-center uppercase tracking-tight mb-2">
            {this.props.fallbackTitle || 'System Recovering...'}
          </h2>
          <p className="text-sm text-slate-400 text-center max-w-md leading-relaxed mb-6">
            An unexpected process exception occurred within the compliance rendering engine. The system safe-guard isolate has captured the state to preserve your work and prevent browser crashes.
          </p>

          {/* Error Message Details Box */}
          {this.state.error && (
            <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-6 text-left font-mono text-xs text-rose-300/90 overflow-x-auto max-h-32">
              <p className="font-bold text-rose-400 mb-1">&gt; Diagnostic Log: {this.state.error.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <p className="text-[10px] text-slate-500 whitespace-pre-wrap">{this.state.errorInfo.componentStack.slice(0, 300)}...</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={this.handleResetSession}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
            >
              Reset Session &amp; Recover
            </button>
            <button
              type="button"
              onClick={this.handleHardReload}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
