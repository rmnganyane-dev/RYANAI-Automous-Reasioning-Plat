import { jsx as _jsx } from "react/jsx-runtime";
// File path: ./src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(App, {}) }) }));
