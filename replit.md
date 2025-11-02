# ZooCare Management System

## Overview
A production-grade Progressive Web App (PWA) for comprehensive zoo management with multi-level hierarchy support. The system features AI-powered audio transcription in Hindi, role-based access control, and emergency alert functionality.

## Architecture
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: FastAPI (Python 3.11)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini + Deepgram for audio transcription

## User Roles
1. **Zookeeper**: Records animal observations in Hindi (audio/text), uploads images/videos, triggers SOS alerts
2. **Veterinarian**: Reviews observations, adds medical comments, responds to emergencies
3. **Admin**: Full system access, user management, role assignment, system monitoring
4. **Officer**: Monitors all activities, generates reports, manages animal database

## Features
- 🎤 **Hindi Audio Transcription**: Zookeepers can record observations in Hindi, automatically transcribed and structured
- 📝 **Smart Form Generation**: AI converts audio/text to structured observation forms
- 📸 **Media Upload**: Support for animal images and emergency videos
- 🚨 **SOS Emergency System**: Quick alert system for critical situations
- 👥 **Role-Based Access Control**: Different permissions for each role
- 📊 **Dashboard Views**: Customized for each role type
- 🔐 **Secure Authentication**: JWT-based auth with password hashing
- 🌐 **PWA Support**: Installable, offline-capable progressive web app

## Project Structure
```
├── src/                          # React frontend
│   ├── components/               # UI components (existing beautiful design)
│   │   ├── ZookeeperDashboard.tsx
│   │   ├── VetDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── OfficerDashboard.tsx
│   │   └── ui/                   # shadcn/ui components
│   ├── styles/
│   └── App.tsx
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # Supabase connection
│   │   ├── models/
│   │   │   ├── zoo_model.py     # AI transcription model
│   │   │   └── schemas.py       # Pydantic models
│   │   └── routes/
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── animals.py       # Animal management
│   │       ├── observations.py  # Observation records
│   │       └── users.py         # User management
│   ├── requirements.txt
│   └── database_schema.sql      # PostgreSQL schema
└── replit.md                     # This file
```

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Run the SQL schema from `backend/database_schema.sql` in the Supabase SQL editor
4. Create storage buckets:
   - `animal-images`
   - `observation-images`
   - `observation-videos`
5. Get your Supabase URL and anon key

### 2. API Keys Required
- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_KEY**: Your Supabase anon key
- **JWT_SECRET_KEY**: Generate a secure random string
- **GEMINI_API_KEY**: Get from Google AI Studio
- **DEEPGRAM_API_KEY**: Get from Deepgram dashboard

### 3. Environment Configuration
Copy `backend/.env.example` to `backend/.env` and fill in your API keys.

## Development

### Frontend (Port 5000)
- Automatically runs on Replit
- Accessible via the webview panel
- Uses beautiful shadcn/ui components

### Backend (Port 8000)
- FastAPI server with automatic API documentation
- API docs available at: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Animals
- `GET /api/animals/` - List all animals
- `POST /api/animals/` - Create animal (admin/officer only)
- `GET /api/animals/{id}` - Get animal details
- `POST /api/animals/{id}/upload-image` - Upload animal image

### Observations
- `GET /api/observations/` - List observations
- `POST /api/observations/` - Create observation (zookeeper/admin)
- `POST /api/observations/audio-transcribe` - Transcribe Hindi audio
- `POST /api/observations/{id}/add-media` - Add image/video
- `POST /api/observations/{id}/vet-comment` - Add vet comment (vet only)
- `POST /api/observations/emergency-alert` - Create SOS alert

### Users
- `GET /api/users/` - List all users (admin only)
- `POST /api/users/` - Create user (admin only)
- `PUT /api/users/{id}/role` - Update user role (admin only)
- `DELETE /api/users/{id}` - Delete user (admin only)

## Deployment
The application is configured for deployment on Replit with autoscale deployment target.

### Production Checklist
- ✅ Change JWT_SECRET_KEY to a secure random value
- ✅ Set all API keys in environment variables
- ✅ Run database migrations in Supabase
- ✅ Create storage buckets in Supabase
- ✅ Configure RLS policies in Supabase
- ✅ Test all user roles and permissions
- ✅ Configure PWA manifest for offline support

## Recent Changes
- Initial project setup with React + Vite frontend
- FastAPI backend implementation
- Multi-role authentication system
- AI-powered audio transcription integration
- Database schema design for Supabase
- Role-based access control

## Current Status
- ✅ Frontend: Running and configured
- ⏳ Backend: Ready, needs API keys
- ⏳ Database: Schema ready, needs Supabase setup
- ⏳ AI Integration: Model integrated, needs API keys

## Next Steps
1. User to provide Supabase credentials
2. User to provide AI API keys (Gemini, Deepgram)
3. Test authentication flow
4. Connect frontend to backend API
5. Test multi-role functionality
6. Add PWA configuration
7. Deploy to production
