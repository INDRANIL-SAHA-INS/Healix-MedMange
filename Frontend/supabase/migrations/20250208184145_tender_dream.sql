-- Safely create seen_patients table if it doesn't exist
DO $$ 
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'seen_patients'
    ) THEN
        -- Create the table
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
    END IF;
END $$;