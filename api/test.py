import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/test")
def test():
    return {"status": "ok", "message": "Vercel is working!"}

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "vercel": os.getenv("VERCEL") == "1",
        "has_stripe_key": bool(os.getenv("STRIPE_SECRET_KEY")),
        "has_openai_key": bool(os.getenv("OPENAI_API_KEY"))
    }

handler = Mangum(app, lifespan="off")
