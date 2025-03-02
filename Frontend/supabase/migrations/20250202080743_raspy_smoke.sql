/*
  # Update Appointments Schema

  1. Changes
    - Ensure doctor_ref_id in appointments matches ref_id from doctors table
    - Add foreign key constraint to enforce referential integrity
    - Add index for performance

  2. Relationships
    - Appointments.doctor_ref_id -> Doctors.ref_id
    - This ensures patients are properly linked to their assigned doctors
*/

-- Drop existing foreign key if it exists
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS fk_doctor;

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

-- Add NOT NULL constraint if not already present
ALTER TABLE appointments
ALTER COLUMN doctor_ref_id SET NOT NULL;