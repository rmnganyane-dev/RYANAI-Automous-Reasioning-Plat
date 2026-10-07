import { config } from 'dotenv';

config({ quiet: true });

// --local deliberately overrides Compose URLs saved in older .env files.
const local = process.argv.includes('--local');
export const apiUrl = (local
  ? `http://localhost:${process.env.PORT || 3001}`
  : process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
export const webUrl = (local
  ? `http://localhost:${process.env.VITE_PORT || 1420}`
  : process.env.WEB_BASE_URL || 'http://localhost:9090').replace(/\/+$/, '');
export const apiHealthUrl = local ? `${apiUrl}/health` : process.env.API_HEALTH_URL || `${apiUrl}/health`;
export const mcpHealthUrl = process.env.MCP_HEALTH_URL;
