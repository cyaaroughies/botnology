# Botnology 101
  
Premium AI tutor web app with FastAPI backend and static frontend, deployable on Vercel.

## Quick Start (Local)

- Prereqs: Python 3.10+.
- Install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
- Run the server:

```bash
python -m uvicorn api.index:app --host 0.0.0.0 --port 3050 --reload
```

- Verify:

```bash
curl -sS http://localhost:3050/api/health
```

Static files are served from `public/` at `/`.

## Environment Variables

- `APP_SECRET` or `JWT_SECRET`: HMAC secret for bearer tokens.
- `OPENAI_API_KEY`: Enable chat/TTS features.
- `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `OPENAI_TTS_MODEL` (default: `gpt-4o-mini-tts`)
- `BOTNOLOGY_API_BASE_URL`: External API origin used by the Next.js chat proxy in production.
- `LEMON_SQUEEZY_API_KEY`: Required for checkout creation.
- `LEMON_SQUEEZY_WEBHOOK_SECRET`: Lemon Squeezy webhook signature validation.
- Variant IDs:
  - `LEMON_SQUEEZY_VARIANT_ASSOCIATES_MONTHLY`, `LEMON_SQUEEZY_VARIANT_ASSOCIATES_ANNUAL`
  - `LEMON_SQUEEZY_VARIANT_BACHELORS_MONTHLY`, `LEMON_SQUEEZY_VARIANT_BACHELORS_ANNUAL`
  - `LEMON_SQUEEZY_VARIANT_MASTERS_MONTHLY`, `LEMON_SQUEEZY_VARIANT_MASTERS_ANNUAL`

See `.env.example` for the full list. For local dev, export vars or use a dotenv loader.

## API Overview

- `/api/health`: Status check.
- `/api/auth` → `/api/me`: Simple HMAC bearer auth to reflect plan/name.
- `/api/chat`: Tutor chat (OpenAI optional; demo fallback).
- `/api/tts`: Text-to-speech (OpenAI optional).
- `/api/announcements` (GET/POST): Masters-only write; read for all.
- `/api/history` (GET/POST): Persist chat history per `student_id`.
- `/api/storage/*`: Simple per-student storage (list/read/write/delete).
- `/api/lemonsqueezy/*`: Checkout + webhook -> writes `data/subscriptions/<student>.json`.
  - `/api/lemonsqueezy/config`: Non-secret setup diagnostics (missing env vars + webhook URL).
  - Frontend Next deployment also exposes `/api/lemonsqueezy/config`, `/api/lemonsqueezy/create-checkout`, and `/api/lemonsqueezy/webhook`.

## Vercel Deployment

The `vercel.json` routes are already configured:

- `/api/(.*)` → `api/index.py` (FastAPI via `vercel-python@3.1.7`).
- Static: everything else → `public/`.

Deploy steps:

```bash
npm i -g vercel
vercel login
vercel
vercel deploy --prod
```

Set env vars in Vercel:

```bash
vercel env add APP_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add BOTNOLOGY_API_BASE_URL production
vercel env add LEMON_SQUEEZY_API_KEY production
vercel env add LEMON_SQUEEZY_WEBHOOK_SECRET production
# add variant ID envs per plan/cadence
```

Set `BOTNOLOGY_API_BASE_URL` to the deployed API origin, for example `https://your-backend.vercel.app` or your FastAPI host. The frontend proxy will call `/api/chat` on that base.

For local emulation:

```bash
vercel dev
```

### Vercel Python Dependencies

Vercel's Python builder installs dependencies from `api/requirements.txt` for serverless functions. Keep this file in sync with the root `requirements.txt`.

## Lemon Squeezy Webhooks

Configure your Lemon Squeezy webhook endpoint to `/api/lemonsqueezy/webhook` and use the signing secret in `LEMON_SQUEEZY_WEBHOOK_SECRET`.

## Notes

- If OpenAI is not configured, chat/tts return demo data gracefully.
- Data persists under `data/` in JSON files; ensure write perms.
