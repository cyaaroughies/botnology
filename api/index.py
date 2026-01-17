import os
import json
import base64
import hmac
import hashlib
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT_DIR / "public"

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

@app.get("/api/health", include_in_schema=False)
def api_health():
    return {
        "status": "ok",
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "stripe": bool(os.getenv("STRIPE_SECRET_KEY")),
        "public_dir_exists": PUBLIC_DIR.exists(),
        "public_dir": str(PUBLIC_DIR),
    }

@app.post("/api/auth", include_in_schema=False)
async def api_auth(req: Request):
    body = await req.json()
    email = (body.get("email") or "").strip()
    name = (body.get("name") or "Student").strip()
    student_id = (body.get("student_id") or "BN-UNKNOWN").strip()
    plan = (body.get("plan") or "associates").strip().lower()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email required")

    token = sign_token({"email": email, "name": name, "student_id": student_id, "plan": plan})
    return {"token": token, "plan": plan, "name": name, "student_id": student_id}

@app.get("/api/me", include_in_schema=False)
def api_me(req: Request):
    p = bearer_payload(req)
    if not p:
        return {"logged_in": False}
    return {"logged_in": True, **p}

@app.post("/api/chat", include_in_schema=False)
async def api_chat(req: Request):
    body = await req.json()
    msg = (body.get("message") or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Missing message")

    # Demo mode if no key (keeps UI working while you set env vars)
    if not os.getenv("OPENAI_API_KEY"):
        return {"reply": f"(Demo mode) You said: {msg}", "plan": body.get("plan") or "associates"}

    # If you want live OpenAI wired back in next, we do that AFTER the plumbing is stable.
    return {"reply": "OPENAI_API_KEY is set, but live OpenAI call is not enabled in this minimal build yet.", "plan": body.get("plan") or "associates"}

# Serve static site last (this makes "/" load index.html)
app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")

# Custom 404 (clean)
@app.exception_handler(404)
async def not_found(_, __):
    return JSONResponse({"detail": "Not Found"}, status_code=404)
