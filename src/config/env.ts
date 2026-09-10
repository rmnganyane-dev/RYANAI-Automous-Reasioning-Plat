/**
 * Retrieves an environment variable across Vite and Node.js environments
 * with auto-prefixing fallback for `VITE_` variables.
 */
export const getEnvVar = (key: string, defaultValue = ''): string => {
  const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const env = import.meta.env as Record<string, unknown>;
    if (env[viteKey] !== undefined) return env[viteKey] as string;
    if (env[key] !== undefined) return env[key] as string;
  }

  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key] !== undefined) return process.env[key] as string;
    if (process.env[viteKey] !== undefined) return process.env[viteKey] as string;
  }

  return defaultValue;
};