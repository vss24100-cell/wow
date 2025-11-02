-- ZooCare Database Complete Setup Script
-- Copy this entire file and paste it into Supabase SQL Editor
-- Then click "Run" to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('zookeeper', 'vet', 'admin', 'officer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    species VARCHAR(255) NOT NULL,
    number VARCHAR(100),
    image_url TEXT,
    health VARCHAR(50) DEFAULT 'good' CHECK (health IN ('excellent', 'good', 'fair', 'poor')),
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_to UUID REFERENCES users(id),
    mood VARCHAR(255),
    appetite VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Observations table
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    zookeeper_id UUID REFERENCES users(id),
    date_or_day VARCHAR(100) NOT NULL,
    animal_observed_on_time BOOLEAN DEFAULT TRUE,
    clean_drinking_water_provided BOOLEAN DEFAULT TRUE,
    enclosure_cleaned_properly BOOLEAN DEFAULT TRUE,
    normal_behaviour_status BOOLEAN DEFAULT TRUE,
    normal_behaviour_details TEXT,
    feed_and_supplements_available BOOLEAN DEFAULT TRUE,
    feed_given_as_prescribed BOOLEAN DEFAULT TRUE,
    other_animal_requirements TEXT,
    incharge_signature VARCHAR(255),
    daily_animal_health_monitoring TEXT,
    carnivorous_animal_feeding_chart TEXT,
    medicine_stock_register TEXT,
    daily_wildlife_monitoring TEXT,
    audio_url TEXT,
    images JSONB,
    video_url TEXT,
    vet_comments TEXT,
    is_emergency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    observation_id UUID REFERENCES observations(id),
    description TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_assigned_to ON animals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_observations_animal_id ON observations(animal_id);
CREATE INDEX IF NOT EXISTS idx_observations_zookeeper_id ON observations(zookeeper_id);
CREATE INDEX IF NOT EXISTS idx_observations_created_at ON observations(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_animal_id ON emergency_alerts(animal_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_resolved ON emergency_alerts(resolved);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_animals_updated_at ON animals;
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_observations_updated_at ON observations;
CREATE TRIGGER update_observations_updated_at BEFORE UPDATE ON observations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DISABLE ROW LEVEL SECURITY (required for custom JWT auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts DISABLE ROW LEVEL SECURITY;

-- Create admin user
-- Email: admin@zoo.com
-- Password: password123
INSERT INTO users (email, name, password_hash, role)
VALUES (
    'admin@zoo.com',
    'Admin User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5jtI7pJBtQwGS',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE 'Login with: admin@zoo.com / password123';
    RAISE NOTICE '⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!';
END $$;
