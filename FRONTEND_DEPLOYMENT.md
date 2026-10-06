# RyanAI Frontend (Vercel)

This is the frontend deployment target for Vercel. It builds and deploys the React/Vite web UI only.

## Deployment

```bash
npm install
npm run build:web
```

Output: `dist/`

## Environment Variables (Frontend Only)

Set these in Vercel project settings:

```
NODE_ENV=production
VITE_API_URL=https://your-backend-api.render.com
VITE_APP_ENV=production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_dsn (optional)
```

## Backend API

The backend runs separately on Render/Railway. Update `VITE_API_URL` to point to your backend deployment.

---

See `API_DEPLOYMENT.md` for backend setup.
