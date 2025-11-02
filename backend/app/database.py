import os
from supabase import create_client, Client
from typing import Optional

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

supabase: Optional[Client] = None

def get_supabase() -> Client:
    global supabase
    if supabase is None and url and key:
        supabase = create_client(url, key)
    return supabase

def init_db():
    return get_supabase()
