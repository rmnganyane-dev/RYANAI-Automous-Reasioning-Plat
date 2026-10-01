import { Analytics } from '@segment/analytics-node';
// CommonJS alternative:
// const { Analytics } = require('@segment/analytics-node');

const WRITE_KEY = process.env.SEGMENT_WRITE_KEY || '<YOUR_WRITE_KEY>';

export const analytics = new Analytics({ 
  writeKey: WRITE_KEY 
});

/**
 * Call when a user registers or updates their profile details.
 */
export function identifyUser(userId, traits = {}) {
  analytics.identify({
    userId,
    traits
  });
}

/**
 * Call whenever a user performs a key action in your app.
 */
export function trackEvent(userId, event, properties = {}) {
  analytics.track({
    userId,
    event,
    properties
  });
}
