/**
 * Retrieves an environment variable across Vite and Node.js environments
 * with auto-prefixing fallback for `VITE_` variables.
 */
export var getEnvVar = function (key, defaultValue) {
    if (defaultValue === void 0) { defaultValue = ''; }
    var viteKey = key.startsWith('VITE_') ? key : "VITE_".concat(key);
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        var env = import.meta.env;
        if (env[viteKey] !== undefined)
            return env[viteKey];
        if (env[key] !== undefined)
            return env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        if (process.env[key] !== undefined)
            return process.env[key];
        if (process.env[viteKey] !== undefined)
            return process.env[viteKey];
    }
    return defaultValue;
};
