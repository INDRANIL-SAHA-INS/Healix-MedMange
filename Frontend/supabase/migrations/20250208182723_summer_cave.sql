-- Create seen_patients table
CREATE TABLE seen_patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id text NOT NULL REFERENCES doctors(ref_id),
    seen_at timestamptz DEFAULT now(),
    UNIQUE(appointment_id, doctor_id)
);

-- Create indexes
CREATE INDEX idx_seen_patients_doctor ON seen_patients(doctor_id);
CREATE INDEX idx_seen_patients_appointment ON seen_patients(appointment_id);
CREATE INDEX idx_seen_patients_seen_at ON seen_patients(seen_at);

-- Grant permissions
GRANT ALL ON TABLE seen_patients TO authenticated;