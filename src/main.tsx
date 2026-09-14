import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import indexHtmlSource from "../index.html?raw";

(window as any).__RYANAI_INDEX_HTML__ = indexHtmlSource;

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element for mounting.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);