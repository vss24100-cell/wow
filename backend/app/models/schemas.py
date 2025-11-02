from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ZOOKEEPER = "zookeeper"
    VET = "vet"
    ADMIN = "admin"
    OFFICER = "officer"

class Language(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"

class HealthStatus(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class User(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: UserRole

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Animal(BaseModel):
    id: str
    name: str
    species: str
    number: Optional[str] = None
    image_url: Optional[str] = None
    health: HealthStatus
    last_checked: datetime
    assigned_to: Optional[str] = None
    mood: Optional[str] = None
    appetite: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

class AnimalCreate(BaseModel):
    name: str
    species: str
    number: Optional[str] = None
    assigned_to: Optional[str] = None

class Observation(BaseModel):
    id: str
    animal_id: str
    zookeeper_id: str
    date_or_day: str
    animal_observed_on_time: bool
    clean_drinking_water_provided: bool
    enclosure_cleaned_properly: bool
    normal_behaviour_status: bool
    normal_behaviour_details: Optional[str] = None
    feed_and_supplements_available: bool
    feed_given_as_prescribed: bool
    other_animal_requirements: Optional[str] = None
    incharge_signature: str
    daily_animal_health_monitoring: str
    carnivorous_animal_feeding_chart: str
    medicine_stock_register: str
    daily_wildlife_monitoring: str
    audio_url: Optional[str] = None
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    vet_comments: Optional[str] = None
    is_emergency: bool = False
    created_at: Optional[datetime] = None

class FormData(BaseModel):
    date_or_day: str
    animal_observed_on_time: bool
    clean_drinking_water_provided: bool
    enclosure_cleaned_properly: bool
    normal_behaviour_status: bool
    normal_behaviour_details: str
    feed_and_supplements_available: bool
    feed_given_as_prescribed: bool
    other_animal_requirements: str
    incharge_signature: str
    daily_animal_health_monitoring: str
    carnivorous_animal_feeding_chart: str
    medicine_stock_register: str
    daily_wildlife_monitoring: str

class ObservationCreate(BaseModel):
    animal_name: str
    audio_text: Optional[str] = None
    date: str
    is_emergency: bool = False
    has_animal_images: bool = False
    has_enclosure_images: bool = False
    has_emergency_video: bool = False
    form_data: Optional[FormData] = None

class AudioTranscription(BaseModel):
    audio_file: bytes
    language: Language = Language.HINDI

class EmergencyAlert(BaseModel):
    animal_id: str
    observation_id: str
    description: str
    created_by: str
    created_at: datetime
