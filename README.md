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
- `STRIPE_SECRET_KEY`: Required for checkout.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signature validation.
- Price IDs:
  - `STRIPE_PRICE_ASSOCIATES_MONTHLY`, `STRIPE_PRICE_ASSOCIATES_ANNUAL`
  - `STRIPE_PRICE_BACHELORS_MONTHLY`, `STRIPE_PRICE_BACHELORS_ANNUAL`
  - `STRIPE_PRICE_MASTERS_MONTHLY`, `STRIPE_PRICE_MASTERS_ANNUAL`

See `.env.example` for the full list. For local dev, export vars or use a dotenv loader.

## API Overview

- `/api/health`: Status check.
- `/api/auth` → `/api/me`: Simple HMAC bearer auth to reflect plan/name.
- `/api/chat`: Tutor chat (OpenAI optional; demo fallback).
- `/api/tts`: Text-to-speech (OpenAI optional).
- `/api/announcements` (GET/POST): Masters-only write; read for all.
- `/api/history` (GET/POST): Persist chat history per `student_id`.
- `/api/storage/*`: Simple per-student storage (list/read/write/delete).
- `/api/stripe/*`: Checkout + webhook → writes `data/subscriptions/<student>.json`.

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
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
# add price ID envs per plan/cadence
```

For local emulation:

```bash
vercel dev
```

## Stripe Webhooks

Configure your Stripe webhook endpoint to `/api/stripe/webhook` and use the signing secret in `STRIPE_WEBHOOK_SECRET`.

## Notes

- If OpenAI is not configured, chat/tts return demo data gracefully.
- Data persists under `data/` in JSON files; ensure write perms.
