from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.models.schemas import Animal, AnimalCreate, User
from app.routes.auth import get_current_user
from app.database import get_supabase
from typing import List
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[Animal])
async def get_animals(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = supabase.table("animals").select("*").execute()
    return result.data

@router.get("/{animal_id}", response_model=Animal)
async def get_animal(animal_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = supabase.table("animals").select("*").eq("id", animal_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Animal not found")
    return result.data[0]

@router.post("/", response_model=Animal)
async def create_animal(animal_data: AnimalCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "officer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    new_animal = {
        "id": str(uuid.uuid4()),
        "name": animal_data.name,
        "species": animal_data.species,
        "number": animal_data.number,
        "health": "good",
        "last_checked": datetime.utcnow().isoformat(),
        "assigned_to": animal_data.assigned_to,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("animals").insert(new_animal).execute()
    return result.data[0]

@router.post("/{animal_id}/upload-image")
async def upload_animal_image(
    animal_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    file_ext = file.filename.split(".")[-1]
    file_name = f"{animal_id}_{uuid.uuid4()}.{file_ext}"
    file_content = await file.read()
    
    storage_result = supabase.storage.from_("animal-images").upload(
        file_name,
        file_content,
        {"content-type": file.content_type}
    )
    
    public_url = supabase.storage.from_("animal-images").get_public_url(file_name)
    
    supabase.table("animals").update({"image_url": public_url}).eq("id", animal_id).execute()
    
    return {"url": public_url, "message": "Image uploaded successfully"}

@router.put("/{animal_id}", response_model=Animal)
async def update_animal(
    animal_id: str,
    animal_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "officer", "vet"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    animal_data["updated_at"] = datetime.utcnow().isoformat()
    result = supabase.table("animals").update(animal_data).eq("id", animal_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Animal not found")
    return result.data[0]
