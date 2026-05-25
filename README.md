# Technova Hub

Monorepo for the Technova Hub AI Visibility Score Checker app.

## Structure

- `AI_SCORE_BACKEND` - Node/Express backend
- `AI_SCORE_FRONTEND` - React + Vite frontend
- `package.json` - Monorepo scripts for local development and deploy helpers
- `vercel.json` - SPA rewrite config for Vercel
- `render.yaml` - Render blueprint for the backend service

## Setup

1. Install dependencies from the repo root:
   - `npm install`
2. Run the frontend:
   - `npm run dev:frontend`
3. Run the backend:
   - `npm run dev:backend`

## Environment Variables

### Frontend

- `VITE_APP_NAME=Technova Hub`
- `VITE_API_BASE_URL=http://localhost:5000`

### Backend

- `PORT=5000`
- `CLIENT_URL=http://localhost:5173`
- `MONGODB_URI=...`

### Deployment

- Render backend: use `render.yaml` or point the service root at `AI_SCORE_BACKEND`
- Vercel frontend: point the project at `AI_SCORE_FRONTEND` or use the repo root with `vercel.json`
- Set `VITE_API_BASE_URL` on Vercel to your Render backend URL so the frontend can reach the API

## Notes

- URL scans are best-effort client-side analyses and fall back to the URL text if remote content cannot be read.
- Text scans require at least 50 characters unless a file is attached.
- File uploads support JPEG, PNG, and PDF. PDFs are text-extracted before scoring. Images are analyzed from filename and metadata only.
- URL scans also use the backend to collect technical SEO signals such as `robots.txt`, sitemap references, canonical tags, meta tags, and schema when the API is available.

## Build Output

- Frontend: `npm run build:frontend`
