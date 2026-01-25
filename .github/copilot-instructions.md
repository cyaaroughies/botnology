# Copilot Instructions for Botnology 101

Welcome to the Botnology 101 codebase! This document provides essential guidance for AI coding agents to be productive in this project. Please follow the conventions and workflows outlined below.

## Project Overview

Botnology 101 is a premium AI tutor web app with:
- **Backend**: FastAPI, located in `api/`.
- **Frontend**: Static files served from `public/`.
- **Deployment**: Configured for Vercel with `vercel.json`.
- **Data Storage**: JSON files under `data/`.

### Key Features
- **AI Chat & TTS**: OpenAI-powered endpoints (`/api/chat`, `/api/tts`).
- **Subscriptions**: Stripe integration for plans and payments.
- **Announcements & History**: JSON-based storage for user-specific data.

## Developer Workflows

### Local Development
1. **Setup Environment**:
   - Python 3.10+ required.
   - Install dependencies:
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     ```
2. **Run the Server**:
   ```bash
   python -m uvicorn api.index:app --host 0.0.0.0 --port 3050 --reload
   ```
3. **Verify**:
   ```bash
   curl -sS http://localhost:3050/api/health
   ```

### Vercel Deployment
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy:
   ```bash
   vercel login
   vercel
   vercel deploy --prod
   ```
3. Set environment variables in Vercel:
   ```bash
   vercel env add APP_SECRET production
   vercel env add OPENAI_API_KEY production
   vercel env add STRIPE_SECRET_KEY production
   vercel env add STRIPE_WEBHOOK_SECRET production
   ```

### Stripe Webhooks
- Endpoint: `/api/stripe/webhook`
- Secret: `STRIPE_WEBHOOK_SECRET`

## Codebase Conventions

### Backend
- **Location**: `api/`
- **Framework**: FastAPI
- **Endpoints**:
  - `/api/chat`: AI chat (uses OpenAI if configured).
  - `/api/tts`: Text-to-speech.
  - `/api/health`: Health check.
  - `/api/storage/*`: JSON-based storage.

### Frontend
- **Location**: `public/`
- **Static Files**: HTML, CSS, JS.
- **Service Workers**: `sw.js` for caching.

### Data Storage
- **Directory**: `data/`
- **Structure**:
  - `data/announcements.json`: Global announcements.
  - `data/history/<student_id>.json`: Chat history.
  - `data/storage/<student_id>.json`: User-specific storage.
  - `data/subscriptions/<student_id>.json`: Subscription data.

### Environment Variables
- `OPENAI_API_KEY`: Enables AI features.
- `STRIPE_SECRET_KEY`: Stripe integration.
- `APP_SECRET`: HMAC secret for auth.

## Patterns and Practices

- **Error Handling**: Ensure all API endpoints return meaningful error messages.
- **Fallbacks**: If OpenAI is not configured, `/api/chat` and `/api/tts` return demo data.
- **JSON Storage**: Use `data/` for persistent storage; ensure write permissions.
- **Testing**: Add tests under `api/test.py`.

## External Dependencies

- **OpenAI**: For chat and TTS features.
- **Stripe**: For subscription management.
- **Vercel**: For deployment.

## Examples

### Adding a New API Endpoint
1. Create a new function in `api/index.py`.
2. Use FastAPI decorators to define the route:
   ```python
   @app.get("/api/example")
   async def example():
       return {"message": "Hello, world!"}
   ```

### Modifying Frontend
1. Update HTML in `public/*.html`.
2. Add JavaScript in `public/*.js`.
3. Use `style.css` for styling.

---

For further questions, refer to the `README.md` or ask a human developer.