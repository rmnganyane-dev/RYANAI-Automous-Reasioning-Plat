/**
 * Retrieves an environment variable across Vite and Node.js environments
 * with auto-prefixing fallback for `VITE_` variables.
 */
export declare const getEnvVar: (key: string, defaultValue?: string) => string;
