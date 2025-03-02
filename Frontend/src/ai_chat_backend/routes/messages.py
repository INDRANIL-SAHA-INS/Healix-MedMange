from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ai_chat_backend.database import supabase
from ai_chat_backend.ai.simple_ai import SimpleAIChat
import uuid
import os

app = FastAPI()

# 🔒 Configure CORS properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

router = APIRouter()
ai_bot = SimpleAIChat()

# Temporary development override
allowed_origins = ["*"]  # Not for production!

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    # Validate origin
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
    origin = websocket.headers.get("origin") or websocket.headers.get("Origin")
    
    if origin not in allowed_origins:
        await websocket.close(code=4003, reason="Origin not allowed")
        return

    try:
        await websocket.accept()
        
        # Connection test
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "session": session_id
        })
        
        # Message handling loop
        while True:
            message = await websocket.receive_text()
            # Process messages here
            await websocket.send_text(f"Echo: {message}")

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        await websocket.close(code=1011, reason="Server error")

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    # Add connection logging
    print(f"🔗 Incoming connection attempt for session: {session_id}")
    
    try:
        # Verify UUID format first
        uuid.UUID(session_id, version=4)
    except ValueError as ve:
        print(f"❌ Invalid UUID: {ve}")
        await websocket.close(code=4001, reason="Invalid UUID format")
        return

    # Verify session exists
    session_check = supabase.table('ai_chat_sessions') \
        .select('id') \
        .eq('id', session_id) \
        .execute()
        
    if not session_check.data:
        print(f"❌ Session {session_id} not found in database")
        await websocket.close(code=4001, reason="Session not found")
        return
    else:
        print(f"✅ Valid session connection: {session_id}")

    # Add these headers for WebSocket CORS
    await websocket.accept(headers={
        "Access-Control-Allow-Origin": os.getenv("ALLOWED_ORIGINS", "http://localhost:3000"),
        "Access-Control-Allow-Credentials": "true"
    })
    
    # Add ping/pong heartbeat
    await websocket.send_json({"type": "ping"})

    # Allow CLI tools like wscat that don't send Origin
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",") + ["null"]
    origin = websocket.headers.get("origin") or websocket.headers.get("Origin")
    
    if origin not in allowed_origins:
        print(f"🚫 Origin blocked: {origin} | Allowed: {allowed_origins}")
        await websocket.close(code=403, reason="Origin not allowed")
        return

    await websocket.accept()
    print(f"WebSocket connected for session: {session_id}")
    try:
        while True:
            user_message = await websocket.receive_text()
            print(f"Received message: {user_message}")
            
            # Add error handling for Supabase insert
            try:
                supabase.table("ai_chat_messages").insert({
                    "session_id": session_id,
                    "content": user_message,
                    "sender_type": "doctor",
                    "message_type": "text"
                }).execute()
            except Exception as db_error:
                print(f"Database error: {db_error}")
                await websocket.send_text("Error saving message")
                continue
            
            # ... rest of your code ...
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        await websocket.send_json({
            "type": "error",
            "message": "Internal server error"
        })
    finally:
        print("Closing connection")
        await websocket.close() 