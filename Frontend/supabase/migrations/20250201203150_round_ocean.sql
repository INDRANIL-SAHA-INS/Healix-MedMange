/*
  # Update patients table schema

  1. Changes
    - Add current_visit JSONB column for storing visit details
    - Add emergency_contact JSONB column for storing contact info
    - Add medical_history JSONB column for storing medical records
    - Add government_id column for identification

  2. Security
    - Enable RLS on patients table
    - Add policies for doctor and admin access
*/

-- Add new columns to patients table
DO $$ 
BEGIN
    -- Add current_visit column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'current_visit'
    ) THEN
        ALTER TABLE patients ADD COLUMN current_visit JSONB DEFAULT '{}';
    END IF;

    -- Add emergency_contact column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'emergency_contact'
    ) THEN
        ALTER TABLE patients ADD COLUMN emergency_contact JSONB DEFAULT '{}';
    END IF;

    -- Add medical_history column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'medical_history'
    ) THEN
        ALTER TABLE patients ADD COLUMN medical_history JSONB DEFAULT '{}';
    END IF;

    -- Add government_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'government_id'
    ) THEN
        ALTER TABLE patients ADD COLUMN government_id text;
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Doctors can manage their patients" ON patients;
DROP POLICY IF EXISTS "Admins can manage all patients" ON patients;

-- Create new policies
CREATE POLICY "Doctors can manage their patients"
    ON patients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'doctor'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'doctor'
        )
    );

CREATE POLICY "Admins can manage all patients"
    ON patients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );