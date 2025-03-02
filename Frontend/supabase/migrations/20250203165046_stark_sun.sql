/*
  # Add Patient Health Records Table

  1. New Tables
    - `patient_health_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to appointments)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - JSONB columns for each health topic
      - Individual columns for vital signs

  2. Changes
    - Adds foreign key constraint to appointments table
    - Creates indexes for better query performance

  3. Security
    - Enables RLS
    - Grants necessary permissions
*/

-- Create patient_health_records table
CREATE TABLE patient_health_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- JSONB columns for health topics
    general_health jsonb DEFAULT '{}'::jsonb,
    pain_discomfort jsonb DEFAULT '{}'::jsonb,
    digestion_appetite jsonb DEFAULT '{}'::jsonb,
    chronic_conditions jsonb DEFAULT '{}'::jsonb,
    lifestyle_habits jsonb DEFAULT '{}'::jsonb,
    womens_health jsonb DEFAULT '{}'::jsonb,
    family_community_health jsonb DEFAULT '{}'::jsonb,
    mental_health jsonb DEFAULT '{}'::jsonb,
    
    -- Individual columns for vital signs
    heart_rate integer,
    blood_pressure text,
    respiratory_rate integer,
    body_temperature decimal(4,1),
    weight decimal(5,2),
    height decimal(5,2),
    bmi decimal(4,1),
    blood_glucose integer,
    oxygen_saturation integer,
    pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10)
);

-- Create updated_at trigger
CREATE TRIGGER update_patient_health_records_updated_at
    BEFORE UPDATE ON patient_health_records
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create indexes
CREATE INDEX idx_patient_health_records_patient_id ON patient_health_records(patient_id);
CREATE INDEX idx_patient_health_records_created_at ON patient_health_records(created_at);

-- Grant permissions
GRANT ALL ON TABLE patient_health_records TO authenticated;
GRANT ALL ON TABLE patient_health_records TO anon;

-- Enable RLS
ALTER TABLE patient_health_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Enable all access for authenticated users"
    ON patient_health_records
    FOR ALL
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE patient_health_records IS 'Stores patient health records with structured and unstructured data';