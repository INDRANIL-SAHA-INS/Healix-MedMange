/*
  # Fix Appointments Schema

  1. Changes
    - Drop and recreate tables with correct structure
    - Add all necessary columns
    - Add proper constraints and relationships
    - Set up indexes for performance

  2. Tables Modified
    - appointments
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS appointments CASCADE;

-- Create appointments table with all required columns
CREATE TABLE appointments (
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
    CONSTRAINT fk_region FOREIGN KEY (region_id) 
        REFERENCES regions(region_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_ref_id) 
        REFERENCES doctors(ref_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

-- Create indexes for better query performance
CREATE INDEX idx_appointments_doctor_ref_id ON appointments(doctor_ref_id);
CREATE INDEX idx_appointments_region_id ON appointments(region_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_appointments_timestamp
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Grant necessary permissions
GRANT ALL ON TABLE appointments TO authenticated;