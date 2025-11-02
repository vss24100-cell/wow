from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import User, UserCreate
from app.routes.auth import get_current_user, get_password_hash
from app.database import get_supabase
from typing import List
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all users")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = supabase.table("users").select("id, email, name, role, created_at, updated_at").execute()
    return result.data

@router.post("/", response_model=User)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    existing = supabase.table("users").select("*").eq("email", user_data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "name": user_data.name,
        "role": user_data.role.value,
        "password_hash": get_password_hash(user_data.password),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("users").insert(new_user).execute()
    user_response = result.data[0].copy()
    user_response.pop("password_hash", None)
    return user_response

@router.put("/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update roles")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = supabase.table("users").update({
        "role": role_data["role"],
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_response = result.data[0].copy()
    user_response.pop("password_hash", None)
    return user_response

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = supabase.table("users").delete().eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}
