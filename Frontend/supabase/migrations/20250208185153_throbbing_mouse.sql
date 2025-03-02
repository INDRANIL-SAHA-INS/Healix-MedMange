-- Drop existing table and related objects
DROP TABLE IF EXISTS seen_patients CASCADE;

-- Create seen_patients table with proper structure
CREATE TABLE seen_patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL,
    doctor_id text NOT NULL,
    seen_at timestamptz DEFAULT now(),
    notes text,
    CONSTRAINT fk_appointment
        FOREIGN KEY (appointment_id) 
        REFERENCES appointments(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_doctor
        FOREIGN KEY (doctor_id) 
        REFERENCES doctors(ref_id) 
        ON DELETE RESTRICT,
    CONSTRAINT unique_seen_appointment 
        UNIQUE(appointment_id, doctor_id)
);

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_seen_patients_doctor_id ON seen_patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_seen_patients_appointment_id ON seen_patients(appointment_id);
CREATE INDEX IF NOT EXISTS idx_seen_patients_seen_at ON seen_patients(seen_at);

-- Grant full permissions to all authenticated users
GRANT ALL ON TABLE seen_patients TO authenticated;
GRANT ALL ON TABLE seen_patients TO anon;

-- Explicitly disable RLS
ALTER TABLE seen_patients DISABLE ROW LEVEL SECURITY;

-- Add helpful table comment
COMMENT ON TABLE seen_patients IS 'Tracks which patients have been seen by doctors during appointments';