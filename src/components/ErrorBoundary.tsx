import React from 'react';
import { logger, downloadLogFile } from '../utils/logger';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('react.render_error', { error, componentStack: info.componentStack ?? '' });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold">Something went wrong / কিছু ভুল হয়েছে</h1>
          <p className="text-slate-400 text-sm">The app hit an unexpected error. Your data is safe on this device.</p>
          <div className="flex gap-3 justify-center">
            <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold" onClick={() => window.location.reload()}>
              Reload
            </button>
            <button className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800" onClick={downloadLogFile}>
              Download log
            </button>
          </div>
        </div>
      </div>
    );
  }
}
