-- Drop and recreate seen_patients table
DROP TABLE IF EXISTS seen_patients CASCADE;

CREATE TABLE seen_patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id text NOT NULL REFERENCES doctors(ref_id),
    seen_at timestamptz DEFAULT now(),
    notes text,
    CONSTRAINT unique_seen_appointment UNIQUE(appointment_id, doctor_id)
);

-- Create indexes for better performance
CREATE INDEX idx_seen_patients_doctor_id ON seen_patients(doctor_id);
CREATE INDEX idx_seen_patients_appointment_id ON seen_patients(appointment_id);
CREATE INDEX idx_seen_patients_seen_at ON seen_patients(seen_at);

-- Grant permissions
GRANT ALL ON TABLE seen_patients TO authenticated;
GRANT ALL ON TABLE seen_patients TO anon;

-- Disable RLS for this table
ALTER TABLE seen_patients DISABLE ROW LEVEL SECURITY;