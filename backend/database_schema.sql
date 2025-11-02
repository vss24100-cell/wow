-- Zoo Management System Database Schema for Supabase

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
CREATE INDEX idx_animals_assigned_to ON animals(assigned_to);
CREATE INDEX idx_observations_animal_id ON observations(animal_id);
CREATE INDEX idx_observations_zookeeper_id ON observations(zookeeper_id);
CREATE INDEX idx_observations_created_at ON observations(created_at);
CREATE INDEX idx_emergency_alerts_animal_id ON emergency_alerts(animal_id);
CREATE INDEX idx_emergency_alerts_resolved ON emergency_alerts(resolved);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_observations_updated_at BEFORE UPDATE ON observations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets (execute these in Supabase dashboard or via Supabase client)
-- animal-images
-- observation-images
-- observation-videos

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (only admins can view all users)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- RLS Policies for animals (all authenticated users can view)
CREATE POLICY "Authenticated users can view animals" ON animals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and officers can insert animals" ON animals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'officer')
        )
    );

CREATE POLICY "Admins, officers, and vets can update animals" ON animals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'officer', 'vet')
        )
    );

-- RLS Policies for observations
CREATE POLICY "Authenticated users can view observations" ON observations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Zookeepers and admins can create observations" ON observations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('zookeeper', 'admin')
        )
    );

CREATE POLICY "Vets can update observations" ON observations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'vet'
        )
    );

-- RLS Policies for emergency alerts
CREATE POLICY "Authenticated users can view emergency alerts" ON emergency_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create emergency alerts" ON emergency_alerts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Vets and admins can resolve emergency alerts" ON emergency_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('vet', 'admin')
        )
    );
