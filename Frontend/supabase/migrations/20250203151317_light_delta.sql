-- Create appointment_history table
CREATE TABLE appointment_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    previous_doctor_id text NOT NULL REFERENCES doctors(ref_id),
    new_doctor_id text NOT NULL REFERENCES doctors(ref_id),
    reason text,
    recommended_at timestamptz DEFAULT now(),
    CONSTRAINT different_doctors CHECK (previous_doctor_id != new_doctor_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX idx_appointment_history_previous_doctor ON appointment_history(previous_doctor_id);
CREATE INDEX idx_appointment_history_new_doctor ON appointment_history(new_doctor_id);

-- Grant necessary permissions
GRANT ALL ON TABLE appointment_history TO authenticated;