/*
  # Appointments and Regions Schema

  1. Tables
    - appointments
      - Core patient information
      - Region and doctor references
      - Appointment details and status
    - regions
      - Region identification and naming

  2. Relationships
    - Appointments reference regions via region_id
    - Appointments reference doctors via doctor_ref_id

  3. Indexes and Constraints
    - Status validation
    - Foreign key constraints
    - Performance indexes
*/

-- Create regions table first
CREATE TABLE IF NOT EXISTS regions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id text UNIQUE NOT NULL,
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
    region_id text NOT NULL,
    region_name text NOT NULL,
    doctor_ref_id text NOT NULL,
    reason text NOT NULL,
    status text NOT NULL CHECK (status IN ('critical', 'medium', 'low')),
    appointment_date date NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES regions(region_id) ON UPDATE CASCADE,
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_ref_id) REFERENCES doctors(ref_id) ON UPDATE CASCADE
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_regions_timestamp
    BEFORE UPDATE ON regions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_appointments_timestamp
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_ref_id ON appointments(doctor_ref_id);
CREATE INDEX IF NOT EXISTS idx_appointments_region_id ON appointments(region_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_regions_region_id ON regions(region_id);

-- Grant permissions
GRANT ALL ON TABLE regions TO authenticated;
GRANT ALL ON TABLE appointments TO authenticated;