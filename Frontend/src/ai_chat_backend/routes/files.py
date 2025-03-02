from fastapi import APIRouter, UploadFile, File
from ai_chat_backend.database import supabase

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_content = await file.read()
    
    upload = supabase.storage.from_("ai-chat-files")\
        .upload(file.filename, file_content)
        
    return {
        "file_url": supabase.storage.from_("ai-chat-files")\
            .get_public_url(file.filename)
    } 