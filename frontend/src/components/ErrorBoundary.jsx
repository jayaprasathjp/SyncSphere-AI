/**
 * @fileoverview React Error Boundary for SyncSphere AI
 * @description Catches unhandled React render errors and displays a user-friendly fallback UI.
 *   Prevents the entire app from crashing due to a single component error.
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * @class ErrorBoundary
 * @extends React.Component
 * @description Class-based React error boundary that catches render errors in child components.
 */
class ErrorBoundary extends React.Component {
  /**
   * @param {object} props
   * @param {React.ReactNode} props.children - Child components to protect.
   * @param {string} [props.fallbackTitle='Something went wrong'] - Title for error UI.
   */
  constructor(props) {
    super(props);
    /** @type {{ hasError: boolean, error: Error|null }} */
    this.state = { hasError: false, error: null };
  }

  /**
   * Updates state so the next render shows the fallback UI.
   * @param {Error} error
   * @returns {{ hasError: boolean, error: Error }}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Logs error details for debugging.
   * @param {Error} error
   * @param {React.ErrorInfo} info
   */
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  /** Resets error state to allow retry. */
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex-1 flex items-center justify-center p-8"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-rose-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-slate-400 text-sm">
                This component encountered an error. Please try refreshing or click retry.
              </p>
              {this.state.error && (
                <details className="mt-4 text-left bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <summary className="text-xs text-slate-500 cursor-pointer">Error details</summary>
                  <pre className="text-xs text-rose-400 mt-2 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
