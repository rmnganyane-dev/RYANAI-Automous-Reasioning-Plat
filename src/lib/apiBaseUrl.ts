const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

export const API_BASE_URL = (
  configuredApiBaseUrl ||
  (typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin)
).replace(/\/+$/, '');
