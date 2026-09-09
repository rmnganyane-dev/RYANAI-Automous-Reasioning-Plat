// File path: ./src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("RyanAI Uncaught Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-neutral-100 p-6 font-mono">
          <div className="p-6 bg-red-950/40 border border-red-800/50 rounded-lg max-w-md space-y-4">
            <div className="flex items-center space-x-3 text-red-400 font-bold">
              <AlertTriangle className="w-6 h-6" />
              <span>Runtime Exception Detected</span>
            </div>
            <p className="text-xs text-neutral-300">
              {this.state.error?.message || "An unexpected error occurred in the RyanAI reasoning runtime."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
            >
              Restart Runtime Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;