import { config } from 'dotenv';

// npm scripts run from the repository root. Existing shell/Compose values win.
// A missing .env is valid when the deployment supplies its own environment.
config({ quiet: true });
