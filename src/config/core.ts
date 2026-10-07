import appManifest from '../../app/routes.json' with { type: 'json' };

// Keep the runtime contract in the checkout; the legacy RYANAI gitlink is optional.
export const API_ROUTES = Object.freeze({
  healthPath: '/api/health',
  reasonPath: '/api/reason',
  streamPath: '/api/reasoning/stream',
});

export const UI_CONFIG = Object.freeze({
  defaultRoute: appManifest.defaultRoute,
});

export const RYANAI_CORE = Object.freeze({
  api: API_ROUTES,
  ui: UI_CONFIG,
  activeSkills: ['autonomous-reasoning'],
});
