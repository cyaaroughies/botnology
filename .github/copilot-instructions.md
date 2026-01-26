# Copilot Instructions for Botnology 101

## Project Overview
- **Botnology 101** is a premium AI tutor web app with a FastAPI backend (Python) and a static frontend (HTML/JS/CSS in `public/`).
- Deployable on Vercel; static assets served from `public/`, API handled by FastAPI in `api/index.py`.
- Data is persisted in JSON files under `data/` (history, subscriptions, storage, photos, announcements).
 
## Key Architecture & Patterns
- **API:** All backend endpoints are defined in `api/index.py` using FastAPI. Endpoints are grouped by resource (auth, chat, tts, announcements, history, storage, stripe, etc.).
- **Authentication:** Custom HMAC bearer tokens (see `sign_token`, `verify_token`). Auth endpoints: `/api/auth`, `/api/me`.
- **Plans:** User plans (associates, bachelors, masters) affect access and API behavior (e.g., only masters can POST announcements).
- **Stripe Integration:** Checkout and webhook endpoints update per-user subscription JSON in `data/subscriptions/`.
- **OpenAI Integration:** Chat and TTS endpoints use OpenAI if API key is set, else return demo data.
- **Static Frontend:** All static files (HTML, JS, CSS) are in `public/`. Served at `/`.
- **SPA Fallback:** Unmatched routes serve `public/index.html` for SPA support.

## Developer Workflows
- **Local Dev:**
  - Create venv, install Python deps: `pip install -r requirements.txt`
  - Run server: `python -m uvicorn api.index:app --host 0.0.0.0 --port 3050 --reload`
  - Static files: open `public/index.html` or access via server root.
- **Vercel Deploy:**
  - Install Vercel CLI: `npm i -g vercel`
  - Deploy: `vercel` (see `vercel.json` for routing)
  - Set required env vars in Vercel dashboard or CLI.
- **Environment Variables:**
  - See `.env.example` and README for required secrets (OpenAI, Stripe, plan price IDs).
- **Data Storage:**
  - All persistent data is JSON in `data/` subfolders. No database is used.

## Project-Specific Conventions
- **No DB:** All state is file-based (JSON). Ensure write permissions for `data/` in dev/deploy.
- **API Versioning:** No explicit versioning; all endpoints are under `/api/`.
- **Error Handling:** API returns JSON errors with HTTP status codes; demo data is returned if OpenAI/Stripe is not configured.
- **Testing:** No formal test suite; test endpoints manually or with tools like `curl`.
- **Frontend:** No framework; vanilla JS/HTML/CSS. See `public/` for entry points.

## Key Files & Directories
- `api/index.py`: All backend logic and API endpoints.
- `public/`: Static frontend assets.
- `data/`: Persistent user and app data (JSON).
- `requirements.txt`: Python dependencies.
- `vercel.json`: Vercel routing config.
- `README.md`: Setup, environment, and deployment instructions.

## Examples
- To add a new API resource, define a FastAPI route in `api/index.py`.
- To persist user data, write JSON to the appropriate `data/` subfolder.
- To add a new frontend page, create an HTML file in `public/` and link JS/CSS as needed.

---
For more, see the README and comments in `api/index.py`.
