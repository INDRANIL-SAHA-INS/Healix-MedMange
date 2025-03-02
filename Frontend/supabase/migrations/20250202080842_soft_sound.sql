/*
  # Update Appointments Schema

  1. Changes
    - Add doctor_ref_id column if it doesn't exist
    - Add foreign key constraint to enforce referential integrity
    - Add index for performance

  2. Relationships
    - Appointments.doctor_ref_id -> Doctors.ref_id
    - This ensures patients are properly linked to their assigned doctors
*/

-- First ensure the column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'doctor_ref_id'
    ) THEN
        ALTER TABLE appointments 
        ADD COLUMN doctor_ref_id text;
    END IF;
END $$;

-- Drop existing foreign key if it exists
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS fk_doctor_ref;

-- Add new foreign key constraint
ALTER TABLE appointments
ADD CONSTRAINT fk_doctor_ref
FOREIGN KEY (doctor_ref_id) 
REFERENCES doctors(ref_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_ref_id 
ON appointments(doctor_ref_id);

-- Add NOT NULL constraint with a default value
ALTER TABLE appointments
ALTER COLUMN doctor_ref_id SET NOT NULL;