import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const APP_VERSION = '4.5.0-matrix';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class RyanAIClient {
  private baseURL: string;
  private version: string;

  constructor(baseURL: string, version: string) {
    this.baseURL = baseURL;
    this.version = version;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}

const apiClient = new RyanAIClient(API_BASE_URL, APP_VERSION);

declare global {
  interface Window {
    ryanai: {
      client: RyanAIClient;
      version: string;
      apiUrl: string;
    };
  }
}

window.ryanai = {
  client: apiClient,
  version: APP_VERSION,
  apiUrl: API_BASE_URL,
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
