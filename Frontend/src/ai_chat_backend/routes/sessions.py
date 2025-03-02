from fastapi import APIRouter, HTTPException, Header
from ai_chat_backend.database import supabase
import uuid

router = APIRouter()

@router.post("/")
async def create_session():
    # Let database generate UUID
    session_data = {"title": "New Chat"}
    
    result = supabase.table("ai_chat_sessions") \
        .insert(session_data) \
        .execute()
        
    return result.data[0]

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    supabase.table("ai_chat_sessions")\
        .delete()\
        .eq("id", session_id)\
        .execute()
    return {"status": "deleted"} 