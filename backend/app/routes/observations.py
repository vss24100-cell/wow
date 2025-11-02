from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.models.schemas import Observation, ObservationCreate, User
from app.routes.auth import get_current_user
from app.database import get_supabase
from app.models.zoo_model import zoo_model
from typing import List, Optional
import uuid
from datetime import datetime
import json

router = APIRouter()

@router.get("/", response_model=List[Observation])
async def get_observations(
    animal_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    query = supabase.table("observations").select("*")
    if animal_id:
        query = query.eq("animal_id", animal_id)
    
    result = query.order("created_at", desc=True).execute()
    return result.data

@router.post("/", response_model=Observation)
async def create_observation(
    observation_data: ObservationCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["zookeeper", "admin"]:
        raise HTTPException(status_code=403, detail="Only zookeepers can create observations")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    # Find or create animal by name
    animal_result = supabase.table("animals").select("*").eq("name", observation_data.animal_name).execute()
    
    if animal_result.data and len(animal_result.data) > 0:
        animal_id = animal_result.data[0]["id"]
    else:
        # Create new animal
        new_animal = {
            "id": str(uuid.uuid4()),
            "name": observation_data.animal_name,
            "species": "Unknown",
            "health": "good",
            "last_checked": datetime.utcnow().isoformat()
        }
        create_result = supabase.table("animals").insert(new_animal).execute()
        animal_id = create_result.data[0]["id"]
    
    structured_data = zoo_model.process_observation(
        observation_data.audio_text or "",
        observation_data.date
    )
    
    new_observation = {
        "id": str(uuid.uuid4()),
        "animal_id": animal_id,
        "zookeeper_id": current_user["id"],
        "date_or_day": structured_data.date_or_day,
        "animal_observed_on_time": structured_data.animal_observed_on_time,
        "clean_drinking_water_provided": structured_data.clean_drinking_water_provided,
        "enclosure_cleaned_properly": structured_data.enclosure_cleaned_properly,
        "normal_behaviour_status": structured_data.normal_behaviour_status,
        "normal_behaviour_details": structured_data.normal_behaviour_details,
        "feed_and_supplements_available": structured_data.feed_and_supplements_available,
        "feed_given_as_prescribed": structured_data.feed_given_as_prescribed,
        "other_animal_requirements": structured_data.other_animal_requirements,
        "incharge_signature": structured_data.incharge_signature,
        "daily_animal_health_monitoring": structured_data.daily_animal_health_monitoring,
        "carnivorous_animal_feeding_chart": structured_data.carnivorous_animal_feeding_chart,
        "medicine_stock_register": structured_data.medicine_stock_register,
        "daily_wildlife_monitoring": structured_data.daily_wildlife_monitoring,
        "is_emergency": observation_data.is_emergency,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("observations").insert(new_observation).execute()
    
    supabase.table("animals").update({
        "last_checked": datetime.utcnow().isoformat()
    }).eq("id", animal_id).execute()
    
    return result.data[0]

@router.post("/audio-transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("hi"),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["zookeeper", "admin"]:
        raise HTTPException(status_code=403, detail="Only zookeepers can submit audio")
    
    audio_bytes = await audio.read()
    
    transcript = zoo_model.transcribe_audio(audio_bytes, language)
    
    return {
        "transcript": transcript,
        "language": language
    }

@router.post("/{observation_id}/add-media")
async def add_media_to_observation(
    observation_id: str,
    file: UploadFile = File(...),
    media_type: str = Form("image"),
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    file_ext = file.filename.split(".")[-1]
    file_name = f"{observation_id}_{uuid.uuid4()}.{file_ext}"
    file_content = await file.read()
    
    bucket_name = "observation-images" if media_type == "image" else "observation-videos"
    
    storage_result = supabase.storage.from_(bucket_name).upload(
        file_name,
        file_content,
        {"content-type": file.content_type}
    )
    
    public_url = supabase.storage.from_(bucket_name).get_public_url(file_name)
    
    observation = supabase.table("observations").select("*").eq("id", observation_id).execute()
    if not observation.data:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    if media_type == "image":
        current_images = observation.data[0].get("images", []) or []
        current_images.append(public_url)
        supabase.table("observations").update({"images": current_images}).eq("id", observation_id).execute()
    else:
        supabase.table("observations").update({"video_url": public_url}).eq("id", observation_id).execute()
    
    return {"url": public_url, "message": f"{media_type.capitalize()} uploaded successfully"}

@router.post("/{observation_id}/vet-comment")
async def add_vet_comment(
    observation_id: str,
    comment: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "vet":
        raise HTTPException(status_code=403, detail="Only vets can add comments")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = supabase.table("observations").update({
        "vet_comments": comment.get("comment"),
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", observation_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    return {"message": "Comment added successfully"}

@router.post("/emergency-alert")
async def create_emergency_alert(
    alert_data: dict,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    emergency = {
        "id": str(uuid.uuid4()),
        "animal_id": alert_data["animal_id"],
        "observation_id": alert_data.get("observation_id"),
        "description": alert_data["description"],
        "created_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("emergency_alerts").insert(emergency).execute()
    
    return {"message": "Emergency alert created", "data": result.data[0]}
