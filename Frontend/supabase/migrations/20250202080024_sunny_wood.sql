-- Create regions table first
CREATE TABLE IF NOT EXISTS regions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name text NOT NULL,
    patient_phone text NOT NULL,
    patient_aadhar text NOT NULL,
    patient_email text,
    patient_address text NOT NULL,
    region_id uuid NOT NULL,
    reason text NOT NULL,
    status text NOT NULL CHECK (status IN ('critical', 'medium', 'low')),
    appointment_date date NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_region_id ON appointments(region_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Grant permissions
GRANT ALL ON TABLE appointments TO authenticated;
GRANT ALL ON TABLE regions TO authenticated;