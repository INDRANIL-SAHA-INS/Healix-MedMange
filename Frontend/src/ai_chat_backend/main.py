from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from .routes import sessions, messages, files
import os

app = FastAPI(title="AI Chat Backend")

# Updated CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Added for WebSocket
)

# Include routers
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(files.router, prefix="/files", tags=["files"])

@app.get("/health")
async def health_check():
    return Response(status_code=200, content="OK") 