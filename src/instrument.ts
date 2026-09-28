// src/instrument.ts
export {};

const sentryDsn = process.env.SENTRY_DSN;

// Sentry is optional for local development. Do not use a placeholder DSN or
// make the server unstartable when observability packages are not installed.
if (sentryDsn) {
  try {
    const [Sentry, profiling] = await Promise.all([
      import('@sentry/node'),
      import('@sentry/profiling-node'),
    ]);

    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || 'development',
      integrations: [profiling.nodeProfilingIntegration()],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      profilesSampleRate: 1.0,
    });
  } catch (error) {
    console.warn('[Sentry] Disabled because its optional packages are unavailable:', error);
  }
}