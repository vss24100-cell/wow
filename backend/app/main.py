from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, animals, observations, users
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="ZooCare Management API",
    description="Production-grade Zoo Management System API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(animals.router, prefix="/api/animals", tags=["Animals"])
app.include_router(observations.router, prefix="/api/observations", tags=["Observations"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "ZooCare Management API", "version": "1.0.0"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}
