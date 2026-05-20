# Grand Helm

Monorepo for the Grand Helm AI Visibility Score Checker SPA.

## Structure

- `AI_SCORE_BACKEND` - Legacy backend folder from the previous build
- `AI_SCORE_FRONTEND` - React + Vite SPA

## Setup

1. Install the frontend dependencies:
   - `cd AI_SCORE_FRONTEND && npm run dev`
2. Open the app in the browser shown by Vite.

## Environment Variables

### Frontend

- `VITE_APP_NAME=Technova Hub`
- `VITE_API_BASE_URL=http://localhost:5000`

## API

## Notes

- URL scans are best-effort client-side analyses and fall back to the URL text if remote content cannot be read.
- Text scans require at least 50 characters unless a file is attached.
- File uploads support JPEG, PNG, and PDF. PDFs are text-extracted before scoring. Images are analyzed from filename and metadata only.
- URL scans also use the backend to collect technical SEO signals such as `robots.txt`, sitemap references, canonical tags, meta tags, and schema when the API is available.

## Build Output

- Frontend: `cd AI_SCORE_FRONTEND && npm run build`
