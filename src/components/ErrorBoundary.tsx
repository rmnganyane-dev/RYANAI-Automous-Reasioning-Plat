// File path: ./src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Telemetry logging can be integrated here (e.g., OpenTelemetry / Sentry)
    console.error("RyanAI Unhandled Runtime Exception:", error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-950/20 backdrop-blur space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xl font-['Orbitron']">
                !
              </div>
              <div>
                <h2 className="font-['Orbitron'] font-bold text-lg text-red-400 tracking-wide">
                  RYANAI EXECUTION EXCEPTION
                </h2>
                <p className="text-xs text-slate-400 font-['Space_Grotesk']">
                  Runtime environment error intercepted
                </p>
              </div>
            </div>

            {/* Error Stack Display */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-['JetBrains_Mono']">
                Exception Diagnostics
              </label>
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800/80 font-['JetBrains_Mono'] text-xs text-red-300 overflow-x-auto max-h-48 leading-relaxed">
                <p className="font-bold">{this.state.error?.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-[11px] text-slate-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-['Space_Grotesk']">
                Engine state preserved.
              </span>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-['JetBrains_Mono'] font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-950/30"
              >
                REBOOT ENGINE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;