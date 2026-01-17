import os
import json
import base64
import hmac
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# ---------- CORS (tighten later) ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Paths ----------
ROOT_DIR = Path(__file__).resolve().parents[1]  # repo root on Vercel: /var/task
PUBLIC_DIR = ROOT_DIR / "public"
if not PUBLIC_DIR.exists():
    # fallback if you stored static files in root
    PUBLIC_DIR = ROOT_DIR

# ---------- Tiny token (stateless, serverless-safe) ----------
APP_SECRET = (os.getenv("APP_SECRET") or "botnology-dev-secret").encode("utf-8")

def _b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode("utf-8").rstrip("=")

def _b64url_dec(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode((s + pad).encode("utf-8"))

def sign_token(payload: Dict[str, Any]) -> str:
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    sig = hmac.new(APP_SECRET, raw, hashlib.sha256).digest()
    return f"{_b64url(raw)}.{_b64url(sig)}"

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        raw_b64, sig_b64 = token.split(".", 1)
        raw = _b64url_dec(raw_b64)
        sig = _b64url_dec(sig_b64)
        exp = hmac.new(APP_SECRET, raw, hashlib.sha256).digest()
        if not hmac.compare_digest(sig, exp):
            return None
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return None

def bearer_payload(req: Request) -> Optional[Dict[str, Any]]:
    auth = req.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return None
    token = auth.split(" ", 1)[1].strip()
    return verify_token(token)

# ---------- Health (MAKE THIS NEVER FAIL) ----------
@app.get("/api/health", include_in_schema=False)
def api_health():
    # no imports that can crash here
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    has_stripe = bool(os.getenv("STRIPE_SECRET_KEY"))
    return {
        "status": "ok",
        "openai": has_openai,
        "stripe": has_stripe,
        "static_dir": str(PUBLIC_DIR),
    }

# ---------- Optional auth endpoints (so UI can show plan/name) ----------
@app.post("/api/auth", include_in_schema=False)
async def api_auth(req: Request):
    body = await req.json()
    email = (body.get("email") or "").strip()
    name = (body.get("name") or "Student").strip()
    student_id = (body.get("student_id") or "").strip() or "BN-UNKNOWN"
    plan = (body.get("plan") or "associates").strip().lower()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email required")

    payload = {"email": email, "name": name, "student_id": student_id, "plan": plan}
    token = sign_token(payload)
    return {"token": token, "plan": plan, "name": name, "student_id": student_id}

@app.get("/api/me", include_in_schema=False)
def api_me(req: Request):
    p = bearer_payload(req)
    if not p:
        return {"logged_in": False}
    return {"logged_in": True, **p}

# ---------- Root safety net (fixes "/" showing {"detail":"Not Found"}) ----------
@app.get("/", include_in_schema=False)
def serve_root():
    # If Vercel routes "/" to the function, serve index.html instead of JSON 404
    candidates = [
        ROOT_DIR / "public" / "index.html",
        ROOT_DIR / "index.html",
    ]
    for p in candidates:
        if p.exists():
            return FileResponse(str(p))
    return JSONResponse({"detail": "index.html missing"}, status_code=404)

# ---------- Serve static (LAST; acts as catch-all for non-/api routes) ----------
# IMPORTANT: keep this at the end so /api/* routes win first
app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")
