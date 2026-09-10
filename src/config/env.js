/**
 * Retrieves an environment variable across Vite and Node.js environments
 * with auto-prefixing fallback for `VITE_` variables.
 */
export const getEnvVar = (key, defaultValue = '') => {
  const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const env = import.meta.env;
    if (env[viteKey] !== undefined) return env[viteKey];
    if (env[key] !== undefined) return env[key];
  }

  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key] !== undefined) return process.env[key];
    if (process.env[viteKey] !== undefined) return process.env[viteKey];
  }

  return defaultValue;
};