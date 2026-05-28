from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    messages: list

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # TODO: Replace with real AI model call
    return {"reply": "This is Dr. Botnotic responding from FastAPI."}
