import os
import json
import base64
import hmac
import hashlib
from pathlib import Path
from typing import Any, Dict, Optional, List
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
import stripe

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
DATA_DIR = ROOT_DIR / "data"
HISTORY_DIR = DATA_DIR / "history"
SUBS_DIR = DATA_DIR / "subscriptions"
PHOTOS_DIR = DATA_DIR / "photos"
STORAGE_DIR = DATA_DIR / "storage"
ANNOUNCEMENTS_FILE = DATA_DIR / "announcements.json"
_app_secret_env = os.getenv("APP_SECRET") or os.getenv("JWT_SECRET")
APP_SECRET = (_app_secret_env or "botnology-dev-secret").encode("utf-8")
OPENAI_ENABLED = bool(os.getenv("OPENAI_API_KEY"))
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if OPENAI_ENABLED else None

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
    # no imports that can crash here
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    has_stripe = bool(os.getenv("STRIPE_SECRET_KEY"))
    return {
        "status": "ok",
<<<<<<< HEAD
        "openai": has_openai,
        "stripe": has_stripe,
        "static_dir": str(PUBLIC_DIR),
=======
        "openai": OPENAI_ENABLED,
        "stripe": bool(os.getenv("STRIPE_SECRET_KEY")),
        "public_dir_exists": PUBLIC_DIR.exists(),
        "public_dir": str(PUBLIC_DIR),
>>>>>>> 08bfa35 (UI polish: forest-green chat, resilient nav, announcements endpoint + dashboard feed, Sign-In modals, light pane variants, bubble contrast, portrait swap; date-stamped announcements)
    }

# ---------- Optional auth endpoints (so UI can show plan/name) ----------
@app.post("/api/auth", include_in_schema=False)
async def api_auth(req: Request):
    body = await req.json()
    email = (body.get("email") or "").strip()
    name = (body.get("name") or "Student").strip()
<<<<<<< HEAD
    student_id = (body.get("student_id") or "").strip() or "BN-UNKNOWN"
=======
    student_id = (body.get("student_id") or "").strip()
>>>>>>> 08bfa35 (UI polish: forest-green chat, resilient nav, announcements endpoint + dashboard feed, Sign-In modals, light pane variants, bubble contrast, portrait swap; date-stamped announcements)
    plan = (body.get("plan") or "associates").strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email required")
<<<<<<< HEAD

    payload = {"email": email, "name": name, "student_id": student_id, "plan": plan}
    token = sign_token(payload)
=======
    if not student_id:
        rnd = base64.urlsafe_b64encode(os.urandom(6)).decode("utf-8").rstrip("=").upper()
        student_id = f"BN-{rnd}"
    token = sign_token({"email": email, "name": name, "student_id": student_id, "plan": plan})
>>>>>>> 08bfa35 (UI polish: forest-green chat, resilient nav, announcements endpoint + dashboard feed, Sign-In modals, light pane variants, bubble contrast, portrait swap; date-stamped announcements)
    return {"token": token, "plan": plan, "name": name, "student_id": student_id}

@app.get("/api/me", include_in_schema=False)
def api_me(req: Request):
    p = bearer_payload(req)
    if not p:
        return {"logged_in": False}
    # If a subscription record exists, prefer its plan
    try:
        student_id = p.get("student_id") or "BN-UNKNOWN"
        fp = SUBS_DIR / f"{student_id}.json"
        if fp.exists():
            sub = json.loads(fp.read_text("utf-8"))
            if isinstance(sub, dict) and str(sub.get("status")).lower() in ("active", "trialing"):
                plan = str(sub.get("plan") or "").strip().lower()
                if plan:
                    p["plan"] = plan
    except Exception:
        pass
    return {"logged_in": True, **p}

<<<<<<< HEAD
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
=======
@app.post("/api/chat", include_in_schema=False)
async def api_chat(req: Request):
    body = await req.json()
    msg = (body.get("message") or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Missing message")
    hist = body.get("history") or []
    subject = (body.get("subject") or "General").strip()
    plan = (body.get("plan") or "associates").strip().lower()
    if not OPENAI_ENABLED or client is None:
        return {"reply": f"(Demo) Dr. Botonic heard: {msg}", "plan": plan}
    sys_prompt = (
        "You are Dr. Botonic, a 72-year-old sophisticated Harvard graduate yeti professor. "
        "You speak calm, soft English with a subtle accent. "
        "You are the smartest AI tutor in the industry. "
        "Be concise yet deeply insightful, use earthy, scholarly tone, and optionally a tasteful gentle joke. "
        "Adapt depth to the student's plan: Associates = foundational guidance, Bachelors = deeper explanations and structured steps, Masters = elite coaching with advanced insights, references, and study strategies. "
        "Subject: " + subject
    )
    messages: List[Dict[str, str]] = [{"role": "system", "content": sys_prompt}]
    if isinstance(hist, list):
        for m in hist[-16:]:
            if isinstance(m, dict) and m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str):
                messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": msg})
    try:
        out = client.chat.completions.create(model=OPENAI_MODEL, messages=messages, temperature=0.7)
        txt = (out.choices[0].message.content or "").strip()
        return {"reply": txt, "plan": plan}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(getattr(e, "message", e)))

def _get_base_url(req: Request) -> str:
    origin = req.headers.get("origin") or ""
    if origin:
        return origin.rstrip("/")
    host = req.headers.get("host") or "localhost:3050"
    scheme = (req.headers.get("x-forwarded-proto") or "http").split(",")[0]
    return f"{scheme}://{host}".rstrip("/")

def _get_price_id(plan: str, cadence: str) -> Optional[str]:
    plan = (plan or "associates").strip().lower()
    cadence = (cadence or "monthly").strip().lower()
    env_key = None
    if plan == "associates" and cadence == "monthly": env_key = "STRIPE_PRICE_ASSOCIATES_MONTHLY"
    elif plan == "associates" and cadence == "annual": env_key = "STRIPE_PRICE_ASSOCIATES_ANNUAL"
    elif plan == "bachelors" and cadence == "monthly": env_key = "STRIPE_PRICE_BACHELORS_MONTHLY"
    elif plan == "bachelors" and cadence == "annual": env_key = "STRIPE_PRICE_BACHELORS_ANNUAL"
    elif plan == "masters" and cadence == "monthly": env_key = "STRIPE_PRICE_MASTERS_MONTHLY"
    elif plan == "masters" and cadence == "annual": env_key = "STRIPE_PRICE_MASTERS_ANNUAL"
    if not env_key:
        return None
    return os.getenv(env_key) or None

@app.post("/api/stripe/create-checkout-session", include_in_schema=False)
async def api_stripe_checkout(req: Request):
    body = await req.json()
    plan = (body.get("plan") or "associates").strip().lower()
    cadence = (body.get("cadence") or "monthly").strip().lower()
    student_id = (body.get("student_id") or "BN-UNKNOWN").strip()
    email = (body.get("email") or "").strip() or None

    secret = os.getenv("STRIPE_SECRET_KEY")
    if not secret:
        raise HTTPException(status_code=400, detail="Stripe not configured: set STRIPE_SECRET_KEY and price IDs env vars.")

    price_id = _get_price_id(plan, cadence)
    if not price_id:
        raise HTTPException(status_code=400, detail="Missing Stripe price id env var for selected plan/cadence.")

    stripe.api_key = secret
    base_url = _get_base_url(req)
    success_url = f"{base_url}/pricing.html?checkout=success&plan={plan}"
    cancel_url = f"{base_url}/pricing.html?checkout=cancel"

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=email,
            client_reference_id=student_id,
            metadata={"student_id": student_id, "plan": plan, "cadence": cadence},
        )
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {getattr(e, 'user_message', str(e))}")

@app.exception_handler(404)
async def not_found(_, __):
    return JSONResponse({"detail": "Not Found"}, status_code=404)

def _ensure_dirs() -> None:
    try:
        DATA_DIR.mkdir(exist_ok=True)
        HISTORY_DIR.mkdir(exist_ok=True)
        SUBS_DIR.mkdir(exist_ok=True)
        PHOTOS_DIR.mkdir(exist_ok=True)
        STORAGE_DIR.mkdir(exist_ok=True)
    except Exception:
        pass

@app.get("/api/announcements", include_in_schema=False)
def api_announcements():
    try:
        if ANNOUNCEMENTS_FILE.exists():
            data = json.loads(ANNOUNCEMENTS_FILE.read_text("utf-8"))
            items = data if isinstance(data, list) else data.get("items") or []
        else:
            items = [
                {"text": "Welcome to Botnoloy101 — your premium AI tutor."},
                {"text": "Forest-green chat panes are now live across the site."},
                {"text": "Study Hall notes now have a lighter pane for readability."}
            ]
        cleaned: List[Dict[str, Any]] = []
        for it in items:
            if isinstance(it, str):
                cleaned.append({"text": it})
            elif isinstance(it, dict) and it.get("text"):
                cleaned.append({"text": str(it.get("text")), "date": it.get("date")})
        return {"items": cleaned[:50]}
    except Exception:
        return {"items": []}

@app.post("/api/announcements", include_in_schema=False)
async def api_announcements_post(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    plan = str(p.get("plan") or "associates").strip().lower()
    if plan != "masters":
        raise HTTPException(status_code=403, detail="Masters plan required")
    body = await req.json()
    text = (body.get("text") or "").strip()
    date = (body.get("date") or None)
    if not text or len(text) < 3:
        raise HTTPException(status_code=400, detail="Announcement text required")
    try:
        items: List[Dict[str, Any]] = []
        if ANNOUNCEMENTS_FILE.exists():
            try:
                data = json.loads(ANNOUNCEMENTS_FILE.read_text("utf-8"))
                if isinstance(data, list):
                    items = data
                elif isinstance(data, dict):
                    items = data.get("items") or []
            except Exception:
                items = []
        new_item = {"text": text, "date": date or datetime.utcnow().isoformat()}
        items = [new_item] + [it for it in items if isinstance(it, dict) and isinstance(it.get("text"), str)]
        items = items[:100]
        ANNOUNCEMENTS_FILE.write_text(json.dumps(items, ensure_ascii=False, separators=(",", ":")), "utf-8")
        return {"saved": True, "count": len(items)}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save announcement")

def _history_path(student_id: str) -> Path:
    safe = "".join(c for c in (student_id or "BN-UNKNOWN") if c.isalnum() or c in ("-", "_"))
    return HISTORY_DIR / f"{safe}.json"

@app.get("/api/history", include_in_schema=False)
def api_history_get(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        return {"history": []}
    fp = _history_path(p.get("student_id") or "BN-UNKNOWN")
    if not fp.exists():
        return {"history": []}
    try:
        data = json.loads(fp.read_text("utf-8"))
        items = data if isinstance(data, list) else data.get("history") or []
        cleaned: List[Dict[str, Any]] = [
            {"role": m.get("role"), "content": str(m.get("content", ""))}
            for m in items
            if isinstance(m, dict) and m.get("role") in ("user", "assistant")
        ]
        return {"history": cleaned[-200:]}
    except Exception:
        return {"history": []}

@app.post("/api/history", include_in_schema=False)
async def api_history_post(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    body = await req.json()
    items = body.get("history") or []
    if not isinstance(items, list):
        raise HTTPException(status_code=400, detail="Invalid history")
    cleaned: List[Dict[str, Any]] = [
        {"role": m.get("role"), "content": str(m.get("content", ""))}
        for m in items
        if isinstance(m, dict) and m.get("role") in ("user", "assistant")
    ]
    fp = _history_path(p.get("student_id") or "BN-UNKNOWN")
    try:
        fp.write_text(json.dumps(cleaned[-200:], ensure_ascii=False, separators=(",", ":")), "utf-8")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save history")
    return {"saved": len(cleaned[-200:])}

@app.get("/api/music", include_in_schema=False)
def api_music_root_disabled():
    raise HTTPException(status_code=404, detail="Not Found")

@app.api_route("/api/music/{path:path}", methods=["GET", "POST", "PUT", "DELETE"], include_in_schema=False)
def api_music_disabled(path: str):
    raise HTTPException(status_code=404, detail="Not Found")

def _subs_path(student_id: str) -> Path:
    safe = "".join(c for c in (student_id or "BN-UNKNOWN") if c.isalnum() or c in ("-", "_"))
    return SUBS_DIR / f"{safe}.json"

@app.get("/api/subscription", include_in_schema=False)
def api_subscription(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    fp = _subs_path(p.get("student_id") or "BN-UNKNOWN")
    if not fp.exists():
        return {"status": "none"}
    try:
        data = json.loads(fp.read_text("utf-8"))
        return data if isinstance(data, dict) else {"status": "none"}
    except Exception:
        return {"status": "none"}

@app.post("/api/stripe/webhook", include_in_schema=False)
async def api_stripe_webhook(req: Request):
    _ensure_dirs()
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(status_code=400, detail="Missing STRIPE_WEBHOOK_SECRET")
    payload = await req.body()
    sig = req.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=sig, secret=secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook: {e}")

    etype = str(event.get("type") or "")
    obj = event.get("data", {}).get("object", {})

    if etype == "checkout.session.completed":
        try:
            mode = str(obj.get("mode") or "")
            client_ref = obj.get("client_reference_id") or "BN-UNKNOWN"
            meta = obj.get("metadata") or {}
            plan = (meta.get("plan") or "associates").strip().lower()
            cadence = (meta.get("cadence") or "monthly").strip().lower()
            status = "active" if mode == "subscription" else "completed"
            fp = _subs_path(client_ref)
            fp.write_text(json.dumps({
                "status": status,
                "plan": plan,
                "cadence": cadence,
                "client_reference_id": client_ref,
                "checkout_session": obj.get("id")
            }, ensure_ascii=False, separators=(",", ":")), "utf-8")
        except Exception:
            pass

    if etype.startswith("customer.subscription."):
        try:
            status = str(obj.get("status") or "").lower()
            meta = obj.get("metadata") or {}
            client_ref = meta.get("student_id") or "BN-UNKNOWN"
            plan = (meta.get("plan") or "").strip().lower()
            cadence = (meta.get("cadence") or "").strip().lower()
            fp = _subs_path(client_ref)
            current = {}
            if fp.exists():
                try:
                    current = json.loads(fp.read_text("utf-8"))
                except Exception:
                    current = {}
            current.update({"status": status or current.get("status") or "active"})
            if plan:
                current["plan"] = plan
            if cadence:
                current["cadence"] = cadence
            fp.write_text(json.dumps(current, ensure_ascii=False, separators=(",", ":")), "utf-8")
        except Exception:
            pass

    return {"received": True}

def _photo_path(student_id: str) -> Path:
    safe = "".join(c for c in (student_id or "BN-UNKNOWN") if c.isalnum() or c in ("-", "_"))
    return PHOTOS_DIR / f"{safe}.png"

@app.get("/api/photo", include_in_schema=False)
def api_get_photo(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    fp = _photo_path(p.get("student_id") or "BN-UNKNOWN")
    if not fp.exists():
        return {"photo_base64": None}
    try:
        data = fp.read_bytes()
        return {"photo_base64": base64.b64encode(data).decode("utf-8")}
    except Exception:
        return {"photo_base64": None}

@app.post("/api/photo", include_in_schema=False)
async def api_set_photo(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    body = await req.json()
    photo_b64 = (body.get("photo_base64") or "").strip()
    if not photo_b64:
        raise HTTPException(status_code=400, detail="Missing photo_base64")
    try:
        raw = base64.b64decode(photo_b64)
        fp = _photo_path(p.get("student_id") or "BN-UNKNOWN")
        fp.write_bytes(raw)
        return {"saved": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid photo")

app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")

def _storage_root(student_id: str) -> Path:
    safe = "".join(c for c in (student_id or "BN-UNKNOWN") if c.isalnum() or c in ("-", "_"))
    return STORAGE_DIR / safe

def _safe_path(student_id: str, rel: str) -> Path:
    base = _storage_root(student_id)
    p = (base / (rel or "")).resolve()
    if not str(p).startswith(str(base.resolve())):
        raise HTTPException(status_code=400, detail="Invalid path")
    return p

@app.get("/api/storage/list", include_in_schema=False)
def api_storage_list(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    root = _storage_root(p.get("student_id") or "BN-UNKNOWN")
    root.mkdir(parents=True, exist_ok=True)
    out: List[Dict[str, Any]] = []
    for r, ds, fs in os.walk(root):
        rel = os.path.relpath(r, root)
        out.append({"path": "/" if rel == "." else rel, "dirs": ds, "files": fs})
    return {"tree": out}

@app.post("/api/storage/write", include_in_schema=False)
async def api_storage_write(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    body = await req.json()
    rel = (body.get("path") or "").strip()
    content = body.get("content")
    if rel == "" or content is None:
        raise HTTPException(status_code=400, detail="Missing path or content")
    fp = _safe_path(p.get("student_id") or "BN-UNKNOWN", rel)
    fp.parent.mkdir(parents=True, exist_ok=True)
    data = content if isinstance(content, str) else json.dumps(content, ensure_ascii=False)
    fp.write_text(data, "utf-8")
    return {"saved": True}

@app.post("/api/storage/read", include_in_schema=False)
async def api_storage_read(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    body = await req.json()
    rel = (body.get("path") or "").strip()
    if rel == "":
        raise HTTPException(status_code=400, detail="Missing path")
    fp = _safe_path(p.get("student_id") or "BN-UNKNOWN", rel)
    if not fp.exists():
        raise HTTPException(status_code=404, detail="Not Found")
    return {"content": fp.read_text("utf-8")}

@app.post("/api/storage/delete", include_in_schema=False)
async def api_storage_delete(req: Request):
    _ensure_dirs()
    p = bearer_payload(req)
    if not p:
        raise HTTPException(status_code=401, detail="Unauthorized")
    body = await req.json()
    rel = (body.get("path") or "").strip()
    if rel == "":
        raise HTTPException(status_code=400, detail="Missing path")
    fp = _safe_path(p.get("student_id") or "BN-UNKNOWN", rel)
    if fp.is_dir():
        for sub in fp.glob("**/*"):
            if sub.is_file():
                try:
                    sub.unlink()
                except Exception:
                    pass
        try:
            fp.rmdir()
        except Exception:
            pass
    elif fp.exists():
        fp.unlink()
    return {"deleted": True}

@app.post("/api/tts", include_in_schema=False)
async def api_tts(req: Request):
    body = await req.json()
    text = (body.get("text") or "").strip()
    voice = (body.get("voice") or "alloy").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Missing text")
    if not OPENAI_ENABLED or client is None:
        return {"audio_base64": None}
    try:
        resp = client.audio.speech.create(model=TTS_MODEL, voice=voice, input=text)
        data = resp.read()
        return {"audio_base64": base64.b64encode(data).decode("utf-8")}
    except Exception:
        return {"audio_base64": None}

@app.post("/api/quiz/generate", include_in_schema=False)
async def api_quiz_generate(req: Request):
    body = await req.json()
    topic = (body.get("topic") or "General").strip()
    level = (body.get("level") or "bachelors").strip().lower()
    if not OPENAI_ENABLED or client is None:
        return {"questions": [
            {"q": "Define entropy in thermodynamics.", "a": "Entropy quantifies disorder and energy dispersal in a system."},
            {"q": "State the chain rule in calculus.", "a": "d/dx f(g(x)) = f'(g(x))·g'(x)."},
            {"q": "Explain Big-O of binary search.", "a": "O(log n) due to halving the search space each step."}
        ]}
    prompt = (
        "Create 5 rigorous study questions with concise ideal answers for topic: "
        + topic + ". Depth level: " + level + ". Return JSON array with keys 'q' and 'a'."
    )
    try:
        out = client.chat.completions.create(model=OPENAI_MODEL, messages=[{"role": "system", "content": "You produce only valid JSON."}, {"role": "user", "content": prompt}], temperature=0.2)
        txt = (out.choices[0].message.content or "[]").strip()
        data = json.loads(txt)
        if isinstance(data, list):
            return {"questions": data}
        return {"questions": []}
    except Exception:
        return {"questions": []}

@app.post("/api/quiz/grade", include_in_schema=False)
async def api_quiz_grade(req: Request):
    body = await req.json()
    questions = body.get("questions") or []
    answers = body.get("answers") or []
    score = 0
    total = 0
    for i, q in enumerate(questions):
        if not isinstance(q, dict):
            continue
        total += 1
        gold = str(q.get("a") or "").strip().lower()
        guess = str((answers[i] if i < len(answers) else "") or "").strip().lower()
        if gold and guess and (gold == guess or gold in guess or guess in gold):
            score += 1
    return {"score": score, "total": total}
>>>>>>> 08bfa35 (UI polish: forest-green chat, resilient nav, announcements endpoint + dashboard feed, Sign-In modals, light pane variants, bubble contrast, portrait swap; date-stamped announcements)
