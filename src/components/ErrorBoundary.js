import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File path: ./src/components/ErrorBoundary.tsx
import { Component } from "react";
import { AlertTriangle } from "lucide-react";
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("RyanAI Uncaught Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "flex flex-col items-center justify-center h-screen bg-neutral-950 text-neutral-100 p-6 font-mono", children: _jsxs("div", { className: "p-6 bg-red-950/40 border border-red-800/50 rounded-lg max-w-md space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-3 text-red-400 font-bold", children: [_jsx(AlertTriangle, { className: "w-6 h-6" }), _jsx("span", { children: "Runtime Exception Detected" })] }), _jsx("p", { className: "text-xs text-neutral-300", children: this.state.error?.message || "An unexpected error occurred in the RyanAI reasoning runtime." }), _jsx("button", { onClick: () => window.location.reload(), className: "w-full py-2 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors", children: "Restart Runtime Interface" })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
