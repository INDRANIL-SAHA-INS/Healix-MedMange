/*
  # Update doctors table structure

  1. Changes
    - Add safety checks for existing table
    - Update policies if needed
    - Ensure indexes exist

  2. Security
    - Verify RLS is enabled
    - Update admin management policy
*/

-- Add any missing columns safely
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'ref_id'
    ) THEN
        ALTER TABLE doctors ADD COLUMN ref_id text UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'assigned_regions'
    ) THEN
        ALTER TABLE doctors ADD COLUMN assigned_regions text[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'joining_date'
    ) THEN
        ALTER TABLE doctors ADD COLUMN joining_date text;
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Update or create policies
DO $$ 
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;
    
    -- Create new policy
    CREATE POLICY "Admins can manage doctors"
        ON doctors FOR ALL
        USING (EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND role = 'admin'
        ));
END $$;

-- Ensure indexes exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_doctors_email'
    ) THEN
        CREATE INDEX idx_doctors_email ON doctors(email);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_doctors_ref_id'
    ) THEN
        CREATE INDEX idx_doctors_ref_id ON doctors(ref_id);
    END IF;
END $$;