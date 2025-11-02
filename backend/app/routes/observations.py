from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.models.schemas import Observation, ObservationCreate, User
from app.database import get_supabase
from app.models.zoo_model import zoo_model
from typing import List, Optional
import uuid
from datetime import datetime
import json

router = APIRouter()

@router.get("/")
async def get_observations(animal_id: Optional[str] = None):
    return []

@router.post("/")
async def create_observation(observation_data: ObservationCreate):
    animal_id = str(uuid.uuid4())
    
    structured_data = zoo_model.process_observation(
        observation_data.audio_text or "",
        observation_data.date
    )
    
    new_observation = {
        "id": str(uuid.uuid4()),
        "animal_id": animal_id,
        "zookeeper_id": "demo-user",
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
    
    return new_observation

@router.post("/audio-transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("hi")
):
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
    media_type: str = Form("image")
):
    return {"url": "https://demo.url/media.jpg", "message": f"{media_type.capitalize()} uploaded successfully (demo mode)"}

@router.post("/{observation_id}/vet-comment")
async def add_vet_comment(observation_id: str, comment: dict):
    return {"message": "Comment added successfully (demo mode)"}

@router.post("/emergency-alert")
async def create_emergency_alert(alert_data: dict):
    emergency = {
        "id": str(uuid.uuid4()),
        "animal_id": alert_data.get("animal_id", "demo-animal"),
        "observation_id": alert_data.get("observation_id"),
        "description": alert_data.get("description", "Emergency alert"),
        "created_by": "demo-user",
        "created_at": datetime.utcnow().isoformat()
    }
    
    return {"message": "Emergency alert created (demo mode)", "data": emergency}
