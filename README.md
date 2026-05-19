# AI Score Checker

Monorepo for the AI Visibility Score Checker MVP.

## Structure

- `AI_SCORE_BACKEND` - Node.js + Express + MongoDB + Cloudinary API
- `AI_SCORE_FRONTEND` - React + Vite UI

## Setup

1. Copy the env examples into real env files:
   - `AI_SCORE_BACKEND/.env`
   - `AI_SCORE_FRONTEND/.env`
2. Install dependencies in each folder:
   - `cd AI_SCORE_BACKEND && npm install`
   - `cd AI_SCORE_FRONTEND && npm install`
3. Start the backend:
   - `cd AI_SCORE_BACKEND && npm run dev`
4. Start the frontend:
   - `cd AI_SCORE_FRONTEND && npm run dev`

## Environment Variables

### Backend

- `PORT=5000`
- `MONGODB_URI=your_mongodb_connection_string`
- `CLOUDINARY_CLOUD_NAME=`
- `CLOUDINARY_API_KEY=`
- `CLOUDINARY_API_SECRET=`
- `CLIENT_URL=http://localhost:5173`
- `NODE_ENV=development`

### Frontend

- `VITE_API_URL=http://localhost:5000`

## API

- `POST /api/scan`
- `GET /api/scan/:id`
- `GET /api/history`
- `POST /api/upload`

## Notes

- URL scans fetch and score the page content synchronously.
- Text scans require at least 50 characters.
- File uploads support JPEG, PNG, and PDF. PDFs are text-extracted before scoring. Images are stored in Cloudinary without OCR.

## Build Output

- Frontend: `cd AI_SCORE_FRONTEND && npm run build`
- Backend: `cd AI_SCORE_BACKEND && npm start`
