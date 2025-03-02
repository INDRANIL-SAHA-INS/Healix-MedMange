import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()  # Add this before creating the client

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
) 