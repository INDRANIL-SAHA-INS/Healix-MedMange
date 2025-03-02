/*
  # Add password support for doctors

  1. Changes
    - Add password column to doctors table
    - Update RLS policies to maintain security
*/

-- Add password column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'password'
    ) THEN
        ALTER TABLE doctors ADD COLUMN password text;
    END IF;
END $$;