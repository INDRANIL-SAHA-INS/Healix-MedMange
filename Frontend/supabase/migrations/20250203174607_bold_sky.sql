-- Create appointment_recommendations table
CREATE TABLE appointment_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    from_doctor_id text NOT NULL REFERENCES doctors(ref_id),
    to_doctor_id text NOT NULL REFERENCES doctors(ref_id),
    reason text,
    recommended_at timestamptz DEFAULT now(),
    CONSTRAINT different_doctors CHECK (from_doctor_id != to_doctor_id)
);

-- Create indexes
CREATE INDEX idx_recommendations_appointment ON appointment_recommendations(appointment_id);
CREATE INDEX idx_recommendations_from_doctor ON appointment_recommendations(from_doctor_id);
CREATE INDEX idx_recommendations_to_doctor ON appointment_recommendations(to_doctor_id);

-- Grant permissions
GRANT ALL ON TABLE appointment_recommendations TO authenticated;