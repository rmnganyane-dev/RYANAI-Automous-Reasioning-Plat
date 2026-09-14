import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import indexHtmlSource from '../index.html?raw';

(window as unknown as { __RYANAI_INDEX_HTML__: string }).__RYANAI_INDEX_HTML__ = indexHtmlSource;

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element for mounting.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App indexHtmlSource={indexHtmlSource} />
  </React.StrictMode>
);