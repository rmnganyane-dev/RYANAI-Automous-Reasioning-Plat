// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("RyanAI Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 font-bold text-lg">
              !
            </div>
            <h2 className="text-lg font-bold text-red-400">RyanAI Engine Fault Detected</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred in the autonomous workspace."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-cyan-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-cyan-400 transition-colors"
            >
              Restart Reasoning Engine
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}